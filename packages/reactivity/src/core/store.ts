import { Store, DispatchedAction, Mutation } from '../interfaces';
import { ReactionId, triggerCollector } from './collector';
import { nextTick, deduplicate, includes } from '../utils/common';
import * as ReactDOM from 'react-dom';
import { EMaterialType } from '../const/enums';
import { Reaction } from './reactive';

export let store: Store;
export let isUpdating: boolean = false;

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

  let isInBatch: boolean = false;
  let dirtyJob: Function | undefined;
  let needCreateRestSyncJobTrigger: boolean = true;

  function dispatch(dispatchedAction: DispatchedAction) {
    const {
      name,
      displayName,
      payload,
      type,
      domain,
      original,
      isAtom,
      isInner = false,
    } = dispatchedAction;

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

    const callback = () => {
      const ids = deduplicate(triggerCollector.waitTriggerComponentIds);
      if (ids.length > 0) {
        const computedReactionIds = ids.filter(id => id instanceof Reaction && id.lazy && id.computed);
        // do computed reaction first
        flushChange(computedReactionIds, false);
        const restIds = deduplicate(triggerCollector.waitTriggerComponentIds).filter(id => !(id instanceof Reaction && id.computed));
        flushChange(restIds);
      }
      isInBatch = false;
      dirtyJob = void 0;
      if (!isInner) {
        triggerCollector.save();
      }
      triggerCollector.endBatch();
    }

    if (!isInBatch && dirtyJob === void 0) {
      dirtyJob = callback;
    }

    if (isAtom) {
      if (triggerCollector.waitTriggerComponentIds.length > 0) {
        // flush previous job
        dirtyJob && dirtyJob();
      }
    }

    try {
      isUpdating = true;
      if (!isInner && (type !== EMaterialType.MUTATION && type !== EMaterialType.UPDATE)) {
        return;
      }
      const currentMutation = original as Mutation;
      currentMutation(...payload);
      // keep alive computed
      const computedReactionIds = triggerCollector.waitTriggerComponentIds.filter(id => id instanceof Reaction && !id.lazy && id.computed);
      if (computedReactionIds.length > 0) {
        flushChange(deduplicate(computedReactionIds), false);
      }
    } catch (error) {
      throw new Error(error);
    } finally {
      isUpdating = false;
    }

    if (!isInBatch) {
      isInBatch = true;
      if (isAtom) {
        // immediately execute
        callback();
      }
      if (needCreateRestSyncJobTrigger) {
        nextTick(() => {
          dirtyJob && dirtyJob();
          needCreateRestSyncJobTrigger = true;
        });
        needCreateRestSyncJobTrigger = false;
      }
    }

    return dispatchedAction;
  }

  return {
    dispatch,
    subscribe,
  };
}
