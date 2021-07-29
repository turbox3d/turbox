import { nextTick, includes, isPromise, batchRemoveFromSet } from '@turbox3d/shared';
import { Store, DispatchedAction, Mutation } from '../interfaces';
import { ReactionId, triggerCollector } from './collector';
import { EMaterialType } from '../const/enums';
import { Reaction } from './reactive';
import { ctx } from '../const/config';
import { AfterStoreChangeEvent, BeforeStoreChangeEvent, EEventName, emitter } from '../utils/event';

export let store: Store;

export interface ActionType {
  name: string;
  displayName: string;
}

export const actionTypeChain: ActionType[] = [];

let batchedUpdates: Function | undefined;

export const registerExternalBatchUpdate = (externalMethod: Function) => {
  batchedUpdates = externalMethod;
};

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
    } else if (!includes(listeners, listener)) {
      componentUUIDToListeners.set(uuid, listeners.concat(listener));
    }

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      if (componentUUIDToListeners.has(uuid)) {
        componentUUIDToListeners.delete(uuid);
      }
    };
  }

  let dirtyJob: Function | undefined;
  let mutationDepth = 0;
  let called = false;

  const flushChange = (ids: ReactionId[], useExternalBatchUpdate: boolean, isInner: boolean) => {
    if (!ids.length || ctx.disableReactive) {
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
        listener(isInner);
      }
    };

    if (useExternalBatchUpdate) {
      if (batchedUpdates) {
        batchedUpdates(flush);
      } else {
        flush();
      }
    } else {
      // reverse
      flush();
    }
  };

  const keepAliveComputed = (isInner: boolean) => {
    const computedReactionIds = [...triggerCollector.waitTriggerIds.values()]
      .filter(id => id instanceof Reaction && !id.lazy && id.computed);
    if (!computedReactionIds.length) {
      return;
    }
    flushChange(computedReactionIds, false, isInner);
    // clean wait queue keep alive
    batchRemoveFromSet(triggerCollector.waitTriggerIds, computedReactionIds);
  };

  const immediatelyReactive = (isInner: boolean) => {
    const immediatelyReactionIds = [...triggerCollector.waitTriggerIds.values()]
      .filter(id => id instanceof Reaction && !id.computed && id.immediately);
    if (!immediatelyReactionIds.length) {
      return;
    }
    // clean wait queue
    batchRemoveFromSet(triggerCollector.waitTriggerIds, immediatelyReactionIds);
    flushChange(immediatelyReactionIds, false, isInner);
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
    actionTypeChain.length = 0;
    needClearHistory && triggerCollector.endBatch();
  };

  function dispatch(dispatchedAction: DispatchedAction) {
    const {
      payload,
      type,
      original,
      immediately,
      isInner = false,
      domain,
      name,
      stackId
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
      // do lazy computed reaction first，PS：maybe add new trigger ids
      flushChange(computedReactionIds, false, isInner);
      const restIds = [...triggerCollector.waitTriggerIds.values()].filter(id => !(id instanceof Reaction && id.computed));
      clean();
      flushChange(restIds, true, isInner);
    };

    mutationDepth += 1;

    if (isInner || (immediately && triggerCollector.waitTriggerIds.size > 0)) {
      // flush previous job
      dirtyJob && dirtyJob();
    }

    if (dirtyJob === void 0) {
      dirtyJob = callback;
    }

    let result: any;

    if (ctx.devTool) {
      const event: BeforeStoreChangeEvent = {
        domain: domain?.constructor.name ?? 'UNKNOWN',
        method: name,
        args: payload,
        state: domain?.$$turboxProperties,
        time: Date.now(),
        stackId
      };
      emitter.emit(EEventName.beforeStoreChange, event);
    }

    try {
      result = (original as Mutation)(...payload);
    } catch (error) {
      return error;
    }

    if (ctx.devTool) {
      const event: AfterStoreChangeEvent = {
        domain: domain?.constructor.name ?? 'UNKNOWN',
        method: name,
        args: payload,
        state: domain?.$$turboxProperties,
        async: false,
        time: Date.now(),
        stackId
      };
      emitter.emit(EEventName.afterStoreChange, event);
    }

    if (isPromise(result)) {
      return new Promise((resolve, reject) => {
        (result as Promise<void>).then((res) => {
          if (ctx.devTool) {
            emitter.emit(EEventName.asyncAfterStoreChange, {
              domain: domain?.constructor.name ?? 'UNKNOWN',
              method: name,
              args: payload,
              state: domain?.$$turboxProperties,
              async: true,
              time: Date.now(),
              stackId
            });
          }
          keepAliveComputed(isInner);
          immediatelyReactive(isInner);
          mutationDepth -= 1;
          nextTickCaller();
          resolve(res);
        }).catch((error) => {
          reject(error);
        });
      });
    }

    keepAliveComputed(isInner);
    immediatelyReactive(isInner);
    mutationDepth -= 1;

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
