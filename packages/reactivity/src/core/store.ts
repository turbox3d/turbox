import { Store, DispatchedAction, Mutation } from '../interfaces';
import { ReactionId, triggerCollector } from './collector';
import { nextTick, deduplicate, includes, isPromise } from '../utils/common';
import * as ReactDOM from 'react-dom';
import { EMaterialType } from '../const/enums';
import { Reaction } from './reactive';

export let store: Store;

export interface ActionType {
  name: string;
  displayName: string;
}

export const actionTypeChain: ActionType[] = [];

export function createStore(enhancer: (createStore: any) => Store) {
  if (enhancer !== void 0) {
    store = enhancer(createStore);
    return store;
  }

  const componentUUIDToListeners: WeakMap<ReactionId, Function[]> = new WeakMap();

  function subscribe(listener: Function, uuid: ReactionId) {
    let isSubscribed = true;
    const listeners = componentUUIDToListeners.get(uuid);

    if (listeners === void 0) {
      componentUUIDToListeners.set(uuid, [listener]);
    } else {
      if (!includes(listeners, listener)) {
        componentUUIDToListeners.set(uuid, listeners.concat(listener));
      }
    }

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      if (componentUUIDToListeners.has(uuid)) {
        componentUUIDToListeners.delete(uuid);
      }
    }
  }

  let dirtyJob: Function | undefined;
  let mutationDepth = 0;
  let called = false;

  const flushChange = (ids: ReactionId[], needBatchUpdate = true) => {
    if (!ids.length) {
      return;
    }
    const pendingListeners: Function[] = [];

    for (let index = 0; index < ids.length; index++) {
      const cid = ids[index];
      const listeners = componentUUIDToListeners.get(cid) || [];
      pendingListeners.push(...listeners);
    }

    const flush = () => {
      for (let index = 0; index < pendingListeners.length; index++) {
        const listener = pendingListeners[index];
        listener();
      }
    };

    if (needBatchUpdate) {
      ReactDOM.unstable_batchedUpdates(flush);
    } else {
      flush();
    }
  };

  const keepAliveComputed = () => {
    const computedReactionIds = triggerCollector.waitTriggerComponentIds.filter(id => id instanceof Reaction && !id.lazy && id.computed);
    if (computedReactionIds.length > 0) {
      flushChange(deduplicate(computedReactionIds), false);
    }
  };

  const nextTickQueue: Function[] = [];

  const nextTickCaller = () => {
    if (called) {
      return;
    }
    called = true;
    const func = () => {
      nextTick(() => {
        if (mutationDepth > 0) {
          called = false;
          return;
        }
        if (nextTickQueue.length === 0) {
          return;
        }
        dirtyJob && dirtyJob();
        nextTickQueue.shift();
      });
    };
    func();
    nextTickQueue.push(func);
  };

  function dispatch(dispatchedAction: DispatchedAction) {
    const {
      name,
      displayName,
      payload,
      type,
      domain,
      original,
      immediately,
      isInner = false,
    } = dispatchedAction;

    if (!isInner && (type !== EMaterialType.MUTATION && type !== EMaterialType.UPDATE)) {
      return;
    }

    const callback = () => {
      const ids = deduplicate(triggerCollector.waitTriggerComponentIds);
      if (ids.length > 0) {
        const computedReactionIds = ids.filter(id => id instanceof Reaction && id.lazy && id.computed);
        // do computed reaction first
        flushChange(computedReactionIds, false);
        const restIds = deduplicate(triggerCollector.waitTriggerComponentIds).filter(id => !(id instanceof Reaction && id.computed));
        flushChange(restIds);
      }
      called = false;
      dirtyJob = void 0;
      if (!isInner) {
        triggerCollector.save();
      }
      triggerCollector.endBatch();
    };

    mutationDepth += 1;

    if (immediately && triggerCollector.waitTriggerComponentIds.length > 0) {
      // flush previous job
      dirtyJob && dirtyJob();
      nextTickQueue.shift();
    }

    if (dirtyJob === void 0) {
      dirtyJob = callback;
    }

    const result = (original as Mutation)(...payload);
    if (isPromise(result)) {
      return (result as Promise<void>).then(() => {
        mutationDepth -= 1;
        keepAliveComputed();
        nextTickCaller();
        return dispatchedAction;
      });
    }

    mutationDepth -= 1;

    keepAliveComputed();

    if (immediately) {
      // immediately execute
      callback();
      return dispatchedAction;
    }

    nextTickCaller();

    return dispatchedAction;
  }

  return {
    dispatch,
    subscribe,
  };
}
