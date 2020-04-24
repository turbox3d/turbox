import { includes } from '../utils/common';
import { ctx } from '../const/config';
import { Component } from 'react';
import { store } from './store';
import generateUUID from '../utils/uuid';
import { materialCallStack } from './domain';
import { EMaterialType } from '../interfaces';

export interface KeyToComponentIdsMap {
  [key: string]: Component[];
};

export type TargetToKeysMap = Map<object, string[]>;

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
  public reverseDependencyMap = new WeakMap<Component, TargetToKeysMap>();
  private componentIdStack: Component[] = [];

  private clearCurrentComponentOldDeps(id: Component) {
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

  start(id: Component) {
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

export const enum EOperationTypes {
  SET = 'set',
  ADD = 'add',
  DELETE = 'delete',
  CLEAR = 'clear',
  GET = 'get',
  HAS = 'has',
  ITERATE = 'iterate'
}

export interface KeyToDiffChangeMap {
  [key: string]: {
    beforeUpdate: any;
    didUpdate: any;
  };
}

export type History = WeakMap<object, KeyToDiffChangeMap>;

export type HistoryIdSet = Set<object>;

export interface HistoryNode {
  historyKey: HistoryIdSet;
  history: History;
}

export interface HistoryCollectorPayload {
  type: EOperationTypes;
  beforeUpdate: any;
  didUpdate: any;
}

/**
 * collect prop diff history record
 */
class HistoryCollector {
  public currentHistory?: History;
  /**
   * Considering the memory cost and iteratable, using Set just only keep id.
   */
  public currentHistoryIdSet?: HistoryIdSet;
  public transactionHistories: HistoryNode[] = [];
  public waitTriggerComponentIds: Component[] = [];
  public cursor: number = -1;

  collect(target: object, key: string, payload: HistoryCollectorPayload, isNeedRecord = true) {
    const { beforeUpdate, didUpdate, type } = payload;
    this.collectComponentId(target, key, type);

    if (!ctx.timeTravel.isActive || !isNeedRecord) {
      return;
    }
    if (this.currentHistoryIdSet === void 0) {
      this.currentHistoryIdSet = new Set();
    }
    if (this.currentHistory === void 0) {
      this.currentHistory = new WeakMap();
    }
    const keyToDiffChangeMap = this.currentHistory.get(target);

    if (keyToDiffChangeMap !== void 0) {
      if (keyToDiffChangeMap[key] !== void 0) {
        keyToDiffChangeMap[key].didUpdate = didUpdate;
      } else {
        keyToDiffChangeMap[key] = {
          beforeUpdate,
          didUpdate,
        };
      }
    } else {
      this.currentHistory.set(target, {
        [key]: {
          beforeUpdate,
          didUpdate,
        }
      });
    }

    this.currentHistoryIdSet.add(target);
  }

  collectComponentId(target: object, key: string, type: EOperationTypes) {
    const keyToComponentIdsMap = depCollector.dependencyMap.get(target);
    if (keyToComponentIdsMap === void 0) {
      return;
    }
    const tempKey = type === EOperationTypes.ADD ? (Array.isArray(target) ? 'length' : EOperationTypes.ITERATE) : key;
    const idsArray = keyToComponentIdsMap[tempKey];
    if (idsArray === void 0 || idsArray.length === 0) {
      return;
    }
    this.waitTriggerComponentIds.push(...idsArray);
  }

  endBatch(isClearHistory = true) {
    this.waitTriggerComponentIds = [];
    if (!ctx.timeTravel.isActive || !isClearHistory) {
      return;
    }
    this.currentHistory = void 0;
    this.currentHistoryIdSet = void 0;
  }

  canUndo() {
    return this.cursor >= 0;
  }

  canRedo() {
    return this.cursor < this.transactionHistories.length - 1;
  }

  /**
   * @todo support multiple steps
   * revert to the previous history status
   */
  undo(stepNum: number = 1) {
    if (!this.canUndo()) {
      return;
    }
    const currentHistory = this.transactionHistories[this.cursor];
    const original = () => {
      currentHistory.historyKey.forEach(target => {
        const keyToDiffObj = currentHistory.history.get(target);
        if (keyToDiffObj) {
          const keys = Object.keys(keyToDiffObj);
          for (let i = 0; i < keys.length; i++) {
            const propKey = keys[i];
            target[propKey] = keyToDiffObj[propKey].beforeUpdate;
          }
        }
      });
    };
    materialCallStack.push(EMaterialType.TIME_TRAVEL);
    store.dispatch({
      name: `$timeTravel_${generateUUID()}`,
      payload: [],
      original,
      isInner: true,
    });
    materialCallStack.pop();
    this.cursor -= 1;
  }

  /**
   * @todo support multiple steps
   * apply the next history status
   */
  redo(stepNum: number = 1) {
    if (!this.canRedo()) {
      return;
    }
    this.cursor += 1;
    const currentHistory = this.transactionHistories[this.cursor];
    const original = () => {
      currentHistory.historyKey.forEach(target => {
        const keyToDiffObj = currentHistory.history.get(target);
        if (keyToDiffObj) {
          const keys = Object.keys(keyToDiffObj);
          for (let i = 0; i < keys.length; i++) {
            const propKey = keys[i];
            target[propKey] = keyToDiffObj[propKey].didUpdate;
          }
        }
      });
    };
    materialCallStack.push(EMaterialType.TIME_TRAVEL);
    store.dispatch({
      name: `$timeTravel_${generateUUID()}`,
      payload: [],
      original,
      isInner: true,
    });
    materialCallStack.pop();
  }

  save() {
    if (this.cursor === this.transactionHistories.length - 1) {
      this.transactionHistories.push({
        historyKey: this.currentHistoryIdSet!,
        history: this.currentHistory!,
      });
      this.cursor += 1;
    } else if (this.cursor < this.transactionHistories.length - 1) {
      this.transactionHistories = this.transactionHistories.slice(0, this.cursor + 1);
      this.transactionHistories.push({
        historyKey: this.currentHistoryIdSet!,
        history: this.currentHistory!,
      });
      this.cursor += 1;
    }

    if (this.transactionHistories.length > ctx.timeTravel.maxStepNumber) {
      this.transactionHistories.shift();
      this.cursor -= 1;
    }
  }
}

export const historyCollector = new HistoryCollector();

export const undo = (stepNum: number = 1) => {
  historyCollector.undo(stepNum);
};

export const redo = (stepNum: number = 1) => {
  historyCollector.redo(stepNum);
};

export const getTimeTravelStatus = () => {
  return {
    canUndo: historyCollector.canUndo(),
    canRedo: historyCollector.canRedo(),
  };
}
