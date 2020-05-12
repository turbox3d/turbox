import { Store, DispatchedAction, Mutation, EMaterialType } from '../interfaces';
import { ReactionId, triggerCollector } from './collector';
import { nextTick, deduplicate, includes } from '../utils/common';
import * as ReactDOM from 'react-dom';
import { ctx } from '../const/config';
import { materialCallStack } from './domain';

export let store: Store;
export let isUpdating: boolean = false;
export const actionNames: string[] = [];

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

  function dispatch(action: DispatchedAction) {
    const {
      name,
      payload,
      type,
      domain,
      original,
      isAtom,
      isInner = false,
    } = action;

    const callback = () => {
      if (triggerCollector.waitTriggerComponentIds.length > 0) {
        const ids = deduplicate(triggerCollector.waitTriggerComponentIds);
        const pendingListeners: Function[] = [];

        for (let index = 0; index < ids.length; index++) {
          const cid = ids[index];
          const listeners = componentUUIDToListeners.get(cid) || [];
          pendingListeners.push(...listeners);
        }

        ReactDOM.unstable_batchedUpdates(() => {
          for (let index = 0; index < pendingListeners.length; index++) {
            const listener = pendingListeners[index];
            listener();
          }
        });
      }
      isInBatch = false;
      dirtyJob = void 0;
      if (ctx.timeTravel.isActive && includes(materialCallStack, EMaterialType.EFFECT)) {
        triggerCollector.endBatch(false);
        return;
      }
      if (!isInner) {
        const chain = actionNames.join('.');
        triggerCollector.save(chain);
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
    } finally {
      isUpdating = false;
      actionNames.push(name);
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

    return action;
  }

  return {
    dispatch,
    subscribe,
  };
}
