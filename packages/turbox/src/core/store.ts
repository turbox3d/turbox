import { Store, DispatchedAction, Mutation, EMaterialType } from '../interfaces';
import { invariant } from '../utils/error';
import { historyCollector } from './collector';
import { nextTick, deduplicate, includes } from '../utils/common';
import * as ReactDOM from 'react-dom';
import { Component } from 'react';
import { ctx } from '../const/config';
import { materialCallStack } from './domain';

export let store: Store;

export function createStore(enhancer: (createStore: any) => Store) {
  if (enhancer !== void 0) {
    store = enhancer(createStore);
    return store;
  }

  const componentUUIDToListeners: WeakMap<Component, Function[]> = new WeakMap();
  let isUpdating: boolean = false;

  function subscribe(listener: Function, uuid: Component) {
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

    invariant(!isUpdating, 'Cannot trigger other mutation while the current mutation is executing.');

    const callback = () => {
      if (historyCollector.waitTriggerComponentIds.length > 0) {
        const ids = deduplicate(historyCollector.waitTriggerComponentIds);
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
        historyCollector.endBatch(false);
        return;
      }
      if (ctx.timeTravel.isActive && !isInner) {
        historyCollector.save();
      }
      historyCollector.endBatch();
    }

    if (!isInBatch && dirtyJob === void 0) {
      dirtyJob = callback;
    }

    if (isAtom) {
      if (historyCollector.waitTriggerComponentIds.length > 0) {
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
