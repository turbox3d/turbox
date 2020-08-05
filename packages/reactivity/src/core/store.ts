import { Store, DispatchedAction, Mutation } from '../interfaces';
import { ReactionId, triggerCollector } from './collector';
import { nextTick, includes, isPromise, batchRemoveFromSet } from '../utils/common';
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
    const computedReactionIds = [...triggerCollector.waitTriggerIds.values()].filter(id => id instanceof Reaction && !id.lazy && id.computed);
    if (!computedReactionIds.length) {
      return;
    }
    flushChange(computedReactionIds, false);
    // clean wait queue keep alive
    batchRemoveFromSet(triggerCollector.waitTriggerIds, computedReactionIds);
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
          nextTickQueue.shift();
          return;
        }
        if (nextTickQueue.length === 0) {
          return;
        }
        dirtyJob && dirtyJob();
      });
    };
    nextTickQueue.push(func);
    func();
  };

  const clean = (needClearHistory = true) => {
    called = false;
    dirtyJob = void 0;
    nextTickQueue.shift();
    needClearHistory && triggerCollector.endBatch();
  };

  function dispatch(dispatchedAction: DispatchedAction) {
    const {
      payload,
      type,
      original,
      immediately,
      isInner = false,
    } = dispatchedAction;

    if (!isInner && (type !== EMaterialType.MUTATION && type !== EMaterialType.UPDATE)) {
      return;
    }

    const callback = () => {
      const ids = [...triggerCollector.waitTriggerIds.values()];
      if (!ids.length) {
        clean(false);
        return;
      }
      if (!isInner) {
        triggerCollector.save();
      }
      const computedReactionIds = ids.filter(id => id instanceof Reaction && id.lazy && id.computed);
      // do computed reaction first
      flushChange(computedReactionIds, false);
      const restIds = ids.filter(id => !(id instanceof Reaction && id.computed));
      clean();
      flushChange(restIds);
    };

    mutationDepth += 1;

    if (isInner || (immediately && triggerCollector.waitTriggerIds.size > 0)) {
      // flush previous job
      dirtyJob && dirtyJob();
    }

    if (dirtyJob === void 0) {
      dirtyJob = callback;
    }

    const result = (original as Mutation)(...payload);
    if (isPromise(result)) {
      return (result as Promise<void>).then((res) => {
        mutationDepth -= 1;
        keepAliveComputed();
        nextTickCaller();
        return res;
      });
    }

    mutationDepth -= 1;

    keepAliveComputed();

    if (isInner || immediately) {
      // immediately execute
      dirtyJob && dirtyJob();
      return result;
    }

    nextTickCaller();

    return result;
  }

  return {
    dispatch,
    subscribe,
  };
}
