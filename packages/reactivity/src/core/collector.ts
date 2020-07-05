import { ctx } from '../const/config';
import { Component } from 'react';
import { Reaction } from './reactive';
import { HistoryCollectorPayload, TimeTravel, History } from './time-travel';
import { actionTypeChain, ActionType } from './store';
import { EDepState, ECollectType, ESpecialReservedKey } from '../const/enums';
import { Action } from './action';

export type ReactionId = Component | Reaction;

export interface DepNodeAssembly {
  [prop: string]: Set<ReactionId>;
}

export interface DepNodeStatus {
  [prop: string]: EDepState;
}

const isInBlackList = (propKey: string) => {
  const blackList = {
    constructor: true,
    properties: true,
    context: true,
    currentTarget: true,
    originalArrayLength: true,
    reactorConfigMap: true,
    propertyGet: true,
    propertySet: true,
    proxyDeleteProperty: true,
    proxyOwnKeys: true,
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
 * collect relation map of the dep key and the reaction ids
 */
class DepCollector {
  public dependencyMap = new WeakMap<object, DepNodeAssembly>();
  private reactionIdDeps = new WeakMap<ReactionId, Map<object, DepNodeStatus>>();
  private reactionIdStack: ReactionId[] = [];

  start(id: ReactionId) {
    this.reactionIdStack.push(id);
  }

  collect(target: object, propertyKey: string) {
    if (isInBlackList(propertyKey)) {
      return;
    }
    const stackLength = this.reactionIdStack.length;
    if (stackLength === 0) {
      return;
    }
    const currentReactionId = this.reactionIdStack[stackLength - 1];
    const depNodeAssembly = this.dependencyMap.get(target);
    if (depNodeAssembly !== void 0) {
      const depNode = depNodeAssembly[propertyKey];
      if (depNode !== void 0) {
        depNode.add(currentReactionId);
      } else {
        depNodeAssembly[propertyKey] = new Set([currentReactionId]);
      }
    } else {
      this.dependencyMap.set(target, {
        [propertyKey]: new Set([currentReactionId]),
      });
    }
    const reactionDeps = this.reactionIdDeps.get(currentReactionId);
    if (reactionDeps !== void 0) {
      const depNodeStatusAssembly = reactionDeps.get(target);
      if (depNodeStatusAssembly !== void 0) {
        depNodeStatusAssembly[propertyKey] = EDepState.LATEST;
      } else {
        reactionDeps.set(target, {
          [propertyKey]: EDepState.LATEST,
        });
      }
    } else {
      this.reactionIdDeps.set(currentReactionId, new Map([[target, {
        [propertyKey]: EDepState.LATEST,
      }]]));
    }
  }

  end() {
    const currentReactionId = this.reactionIdStack.pop();
    if (!currentReactionId) {
      return;
    }
    const map = this.reactionIdDeps.get(currentReactionId);
    if (!map) {
      return;
    }
    map.forEach((value, target) => {
      const keys = Object.keys(value);
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        // remove stale deps
        if (value[key] === EDepState.OBSERVED) {
          const depNodeAssembly = this.dependencyMap.get(target);
          if (depNodeAssembly) {
            const idSet = depNodeAssembly[key];
            idSet.delete(currentReactionId);
            value[key] = EDepState.NOT_OBSERVED;
          }
        }
        // reset dep status
        if (value[key] === EDepState.LATEST) {
          value[key] = EDepState.OBSERVED;
        }
      }
    });
  }

  clear(id: ReactionId) {
    const map = this.reactionIdDeps.get(id);
    if (!map) {
      return;
    }
    map.forEach((value, target) => {
      const keys = Object.keys(value);
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const depNodeAssembly = this.dependencyMap.get(target);
        if (depNodeAssembly) {
          const idSet = depNodeAssembly[key];
          idSet.delete(id);
        }
      }
    });
    this.reactionIdDeps.delete(id);
  }

  isObserved(targetKey: object, propKey: string) {
    const map = this.dependencyMap.get(targetKey);
    return map !== void 0 && propKey in map && map[propKey].size > 0;
  }
}

export const depCollector = new DepCollector();

class TriggerCollector {
  public waitTriggerComponentIds: ReactionId[] = [];

  trigger(target: object, key: string, payload: HistoryCollectorPayload, isNeedRecord = true) {
    const { beforeUpdate, didUpdate, type } = payload;
    const enhanceKey = type === ECollectType.ADD ? ESpecialReservedKey.ITERATE : key;
    this.collectComponentId(target, enhanceKey);
    if (
      !ctx.timeTravel.isActive ||
      !TimeTravel.currentTimeTravel ||
      !isNeedRecord ||
      enhanceKey === ESpecialReservedKey.ITERATE ||
      enhanceKey === ESpecialReservedKey.COMPUTED
    ) {
      return;
    }
    if (Action.context) {
      this.recordDiff(target, enhanceKey, beforeUpdate, didUpdate, Action.context.historyNode.history);
      return;
    }
    this.recordDiff(target, enhanceKey, beforeUpdate, didUpdate, TimeTravel.currentTimeTravel.currentHistory);
  }

  private collectComponentId(target: object, enhanceKey: string) {
    const depNodeAssembly = depCollector.dependencyMap.get(target);
    if (depNodeAssembly !== void 0) {
      const idSet = depNodeAssembly[enhanceKey];
      if (idSet !== void 0 && idSet.size > 0) {
        this.waitTriggerComponentIds.push(...Array.from(idSet));
      }
    }
  }

  private recordDiff(target: object, enhanceKey: string, beforeUpdate: any, didUpdate: any, history?: History) {
    if (history === void 0) {
      history = new Map();
    }
    const keyToDiffChangeMap = history.get(target);
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
      history.set(target, {
        [enhanceKey]: {
          beforeUpdate,
          didUpdate,
        }
      });
    }
  }

  endBatch(isClearHistory = true, action?: Action) {
    this.waitTriggerComponentIds = [];
    if (!ctx.timeTravel.isActive || !TimeTravel.currentTimeTravel || !isClearHistory) {
      return;
    }
    if (action) {
      action.historyNode.actionChain.length = 0;
      action.historyNode.history = new Map();
      return;
    }
    actionTypeChain.length = 0;
    TimeTravel.currentTimeTravel.currentHistory = void 0;
  }

  private saveHistory(ctt: TimeTravel, actionChain: ActionType[], history?: History) {
    if (!history) {
      return;
    }
    if (history.size === 0) {
      return;
    }
    if (ctt.cursor === ctt.transactionHistories.length - 1) {
      ctt.transactionHistories.push({
        actionChain,
        history,
      });
      ctt.cursor += 1;
    } else if (ctt.cursor < ctt.transactionHistories.length - 1) {
      ctt.transactionHistories = ctt.transactionHistories.slice(0, ctt.cursor + 1);
      ctt.transactionHistories.push({
        actionChain,
        history,
      });
      ctt.cursor += 1;
    }

    if (ctt.transactionHistories.length > ctx.timeTravel.maxStepNumber!) {
      ctt.transactionHistories.shift();
      ctt.cursor -= 1;
    }
  }

  save(action?: Action) {
    if (!ctx.timeTravel.isActive || !TimeTravel.currentTimeTravel) {
      return;
    }
    const ctt = TimeTravel.currentTimeTravel;
    if (action) {
      this.saveHistory(ctt, action.historyNode.actionChain, action.historyNode.history);
      return;
    }
    this.saveHistory(ctt, actionTypeChain.concat(), ctt.currentHistory);
  }
}

export const triggerCollector = new TriggerCollector();
