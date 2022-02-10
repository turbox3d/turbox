import { nextTick, includes, isPromise, batchRemoveFromSet } from '@turbox3d/shared';
import { Store, DispatchedAction, Mutation } from '../interfaces';
import { ReactionId, triggerCollector } from './collector';
import { EMaterialType } from '../const/enums';
import { Reaction } from './reactive';
import { ctx } from '../const/config';
import { AfterStoreChangeEvent, BeforeStoreChangeEvent, EEventName, emitter } from '../utils/event';
import { materialCallStack } from '../utils/materialCallStack';
import { TimeTravel } from './time-travel';

export let store: Store;

export interface ActionType {
  name: string;
  displayName: string;
}

export const actionTypeChain: ActionType[] = [];

export interface RegisterExternalBatchUpdateParam {
  handler: (callback: () => void, finish?: () => void) => void | Promise<void>;
  idCustomType: string;
}

export interface IdToListenersInfo {
  listeners: Function[];
  idCustomType?: string;
}

const batchedUpdates: RegisterExternalBatchUpdateParam[] = [];

export const registerExternalBatchUpdate = (obj: RegisterExternalBatchUpdateParam) => {
  batchedUpdates.push(obj);
};

export function createStore(enhancer: (createStore: any) => Store) {
  if (enhancer !== void 0) {
    store = enhancer(createStore);
    return store;
  }

  const componentUUIDToListeners: WeakMap<ReactionId, IdToListenersInfo> = new WeakMap();

  function subscribe(listener: Function, uuid: ReactionId, idCustomType?: string) {
    let isSubscribed = true;
    const obj = componentUUIDToListeners.get(uuid);

    if (obj === void 0 || obj.listeners === void 0) {
      componentUUIDToListeners.set(uuid, {
        idCustomType,
        listeners: [listener],
      });
    } else if (!includes(obj.listeners, listener)) {
      componentUUIDToListeners.set(uuid, {
        idCustomType,
        listeners: obj.listeners.concat(listener),
      });
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
    const pendingObjs: IdToListenersInfo[] = [];

    for (let index = 0; index < ids.length; index++) {
      const cid = ids[index];
      const obj = componentUUIDToListeners.get(cid);
      if (obj) {
        pendingObjs.push(obj);
      }
    }

    const flush = (idCustomType?: string) => () => {
      for (let index = 0; index < pendingObjs.length; index++) {
        const obj = pendingObjs[index];
        if (obj.idCustomType === idCustomType) {
          const listeners = obj.listeners;
          for (let j = 0; j < listeners.length; j++) {
            const listener = listeners[j];
            listener(isInner);
          }
        }
      }
    };

    if (useExternalBatchUpdate) {
      batchedUpdates.forEach((obj) => {
        const batchUpdate = obj.handler;
        batchUpdate(flush(obj.idCustomType), () => {
          // finish batchUpdate
          ctx.batchUpdateOnFinish && ctx.batchUpdateOnFinish();
        });
      });
    } else {
      // reverse
      flush()();
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
      forceSaveHistory = false,
      isNeedRecord = true,
    } = dispatchedAction;
    if (isInner) {
      TimeTravel.processing = true;
    }
    const syncStackId = materialCallStack.push({ type: type!, method: name, domain: domain?.constructor.name });

    if (!isInner && (type !== EMaterialType.MUTATION && type !== EMaterialType.UPDATE)) {
      return;
    }

    const callback = () => {
      const ids = [...triggerCollector.waitTriggerIds.values()];
      if (!ids.length && !forceSaveHistory) {
        clean(false);
        return;
      }
      if (!isInner && isNeedRecord) {
        triggerCollector.save();
      }
      const computedReactionIds = ids.filter(id => id instanceof Reaction && id.lazy && id.computed);
      // do lazy computed reaction first，PS：maybe add new trigger ids
      flushChange(computedReactionIds, false, isInner);
      const lazyReactiveIds = [...triggerCollector.waitTriggerIds.values()].filter(id => id instanceof Reaction && !id.computed && !id.immediately);
      const restIds = [...triggerCollector.waitTriggerIds.values()].filter(id => !(id instanceof Reaction));
      clean();
      // do lazy reactive
      flushChange(lazyReactiveIds, false, isInner);
      // do Reactive/ReactReactive/CustomReactive
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
        stackId: materialCallStack.currentStack?.stackId
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
        stackId: materialCallStack.currentStack?.stackId
      };
      emitter.emit(EEventName.afterStoreChange, event);
    }
    if (isPromise(result)) {
      materialCallStack.pop(syncStackId);
      return new Promise((resolve, reject) => {
        let asyncStackId: number;
        Promise.resolve().then(() => {
          asyncStackId = materialCallStack.push({ type: type!, method: name, domain: domain?.constructor.name, syncStackId });
        });
        (result as Promise<void>).then((res) => {
          if (ctx.devTool) {
            emitter.emit(EEventName.asyncAfterStoreChange, {
              domain: domain?.constructor.name ?? 'UNKNOWN',
              method: name,
              args: payload,
              state: domain?.$$turboxProperties,
              async: true,
              time: Date.now(),
              stackId: materialCallStack.currentStack?.stackId
            });
          }
          keepAliveComputed(isInner);
          immediatelyReactive(isInner);
          mutationDepth -= 1;
          if (immediately) {
            // immediately execute
            dirtyJob && dirtyJob();
          } else {
            nextTickCaller();
          }
          materialCallStack.pop(asyncStackId);
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
      TimeTravel.processing = false;
    } else {
      nextTickCaller();
    }

    materialCallStack.pop(syncStackId);

    return result;
  }

  return {
    dispatch,
    subscribe,
  };
}
