import { includes } from '../utils/common';
import { ctx } from '../const/config';
import { Component } from 'react';
import { Reaction } from './reactive';
import { HistoryCollectorPayload, TimeTravel, EOperationTypes } from './time-travel';
import { actionNames } from './store';
import { rawCache } from './domain';

export type ReactionId = Component | Reaction;
export interface KeyToComponentIdsMap {
  [key: string]: ReactionId[];
};

export type TargetToKeysMap = Map<object, string[]>;

export const ARRAY_LENGTH_KEY = 'length';

const isInBlackList = (propKey: string) => {
  const blackList = {
    constructor: true,
    properties: true,
    reactorConfigMap: true,
    propertyGet: true,
    propertySet: true,
    proxySet: true,
    proxyGet: true,
    proxyReactive: true,
    $update: true,
    illegalAssignmentCheck: true,
    dispatch: true,
  };

  return !!blackList[propKey];
};

/**
 * collect relation map of the dep key and the component ids
 */
class DepCollector {
  public dependencyMap = new WeakMap<object, KeyToComponentIdsMap>();
  /**
   * Using a small amount of memory to improve execute performance
   */
  public reverseDependencyMap = new WeakMap<ReactionId, TargetToKeysMap>();
  private componentIdStack: ReactionId[] = [];

  private clearCurrentComponentOldDeps(id: ReactionId) {
    const targetToKeysMap = this.reverseDependencyMap.get(id);
    if (targetToKeysMap !== void 0) {
      targetToKeysMap.forEach((propKeys, targetKey) => {
        const keyToComponentIdsMap = this.dependencyMap.get(targetKey);
        if (keyToComponentIdsMap !== void 0 && Object.keys(keyToComponentIdsMap).length > 0) {
          for (let index = 0; index < propKeys.length; index++) {
            const propKey = propKeys[index];
            let componentIds = keyToComponentIdsMap[propKey];
            if (componentIds !== void 0 && componentIds.length > 0) {
              keyToComponentIdsMap[propKey] = componentIds.filter(cid => cid !== id);
            } else if (componentIds === void 0 || componentIds.length === 0) {
              delete keyToComponentIdsMap[propKey];
            }
          }
        } else if (keyToComponentIdsMap === void 0 || Object.keys(keyToComponentIdsMap).length === 0) {
          this.dependencyMap.delete(targetKey);
        }
      });
    }
  }

  start(id: ReactionId) {
    this.clearCurrentComponentOldDeps(id);
    this.reverseDependencyMap.delete(id);
    this.componentIdStack.push(id);
  }

  collect(targetKey: object, propKey: string) {
    if (isInBlackList(propKey)) {
      return;
    }
    const stackLength = this.componentIdStack.length;
    if (stackLength === 0) {
      return;
    }
    const currentComponentId = this.componentIdStack[stackLength - 1];
    const targetToKeysMap = this.reverseDependencyMap.get(currentComponentId);
    if (targetToKeysMap !== void 0) {
      const keys = targetToKeysMap.get(targetKey);
      if (keys !== void 0) {
        if (!includes(keys, propKey)) keys.push(propKey);
      } else {
        targetToKeysMap.set(targetKey, [propKey]);
      }
    } else {
      const wm: TargetToKeysMap = new Map();
      wm.set(targetKey, [propKey]);
      this.reverseDependencyMap.set(currentComponentId, wm);
    }
    const keyToComponentIdsMap = this.dependencyMap.get(targetKey);
    if (keyToComponentIdsMap !== void 0) {
      let idsArray = keyToComponentIdsMap[propKey];
      if (idsArray !== void 0) {
        if (!includes(idsArray, currentComponentId)) idsArray.push(currentComponentId);
      } else {
        keyToComponentIdsMap[propKey] = [currentComponentId];
      }
    } else {
      this.dependencyMap.set(targetKey, {
        [propKey]: [currentComponentId],
      });
    }
  }

  end() {
    this.componentIdStack.pop();
  }

  isObserved(targetKey: object, propKey: string) {
    const map = this.dependencyMap.get(targetKey);
    return map !== void 0 && propKey in map;
  }
}

export const depCollector = new DepCollector();

class TriggerCollector {
  public waitTriggerComponentIds: ReactionId[] = [];

  trigger(target: object, key: string, payload: HistoryCollectorPayload, isNeedRecord = true) {
    const { beforeUpdate, didUpdate, type } = payload;
    const enhanceKey = type === EOperationTypes.ADD ? EOperationTypes.ITERATE : key;
    this.collectComponentId(target, enhanceKey);

    if (!ctx.timeTravel.isActive || !TimeTravel.currentTimeTravel || !isNeedRecord || enhanceKey === EOperationTypes.ITERATE) {
      return;
    }
    const ctt = TimeTravel.currentTimeTravel;
    if (ctt.currentHistoryIdSet === void 0) {
      ctt.currentHistoryIdSet = new Set();
    }
    if (ctt.currentHistory === void 0) {
      ctt.currentHistory = new WeakMap();
    }
    const proxyTarget = rawCache.get(target);
    if (!proxyTarget) {
      return;
    }
    const keyToDiffChangeMap = ctt.currentHistory.get(proxyTarget);

    if (keyToDiffChangeMap !== void 0) {
      if (keyToDiffChangeMap[enhanceKey] !== void 0) {
        keyToDiffChangeMap[enhanceKey].didUpdate = didUpdate;
      } else {
        keyToDiffChangeMap[enhanceKey] = {
          beforeUpdate,
          didUpdate,
        };
      }
    } else {
      ctt.currentHistory.set(proxyTarget, {
        [enhanceKey]: {
          beforeUpdate,
          didUpdate,
        }
      });
    }

    ctt.currentHistoryIdSet.add(proxyTarget);
  }

  collectComponentId(target: object, enhanceKey: string) {
    const keyToComponentIdsMap = depCollector.dependencyMap.get(target);
    if (keyToComponentIdsMap !== void 0) {
      const idsArray = keyToComponentIdsMap[enhanceKey];
      if (idsArray !== void 0 && idsArray.length > 0) {
        this.waitTriggerComponentIds.push(...idsArray);
      }
    }
  }

  endBatch(isClearHistory = true) {
    this.waitTriggerComponentIds = [];
    if (!ctx.timeTravel.isActive || !TimeTravel.currentTimeTravel || !isClearHistory) {
      return;
    }
    actionNames.length = 0;
    TimeTravel.currentTimeTravel.currentHistory = void 0;
    TimeTravel.currentTimeTravel.currentHistoryIdSet = void 0;
  }

  save(chain: string) {
    if (!ctx.timeTravel.isActive || !TimeTravel.currentTimeTravel) {
      return;
    }
    const ctt = TimeTravel.currentTimeTravel;
    if (ctt.cursor === ctt.transactionHistories.length - 1) {
      ctt.transactionHistories.push({
        name: chain,
        historyKey: ctt.currentHistoryIdSet!,
        history: ctt.currentHistory!,
      });
      ctt.cursor += 1;
    } else if (ctt.cursor < ctt.transactionHistories.length - 1) {
      ctt.transactionHistories = ctt.transactionHistories.slice(0, ctt.cursor + 1);
      ctt.transactionHistories.push({
        name: chain,
        historyKey: ctt.currentHistoryIdSet!,
        history: ctt.currentHistory!,
      });
      ctt.cursor += 1;
    }

    if (ctt.transactionHistories.length > ctx.timeTravel.maxStepNumber) {
      ctt.transactionHistories.shift();
      ctt.cursor -= 1;
    }
  }
}

export const triggerCollector = new TriggerCollector();
