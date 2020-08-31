import { ctx } from '../const/config';
import { Component } from 'react';
import { Reaction } from './reactive';
import { HistoryCollectorPayload, TimeTravel, History } from './time-travel';
import { actionTypeChain, ActionType } from './store';
import { EDepState, ECollectType, ESpecialReservedKey } from '../const/enums';
import { Action } from './action';
import { rawCache } from './domain';
import { isDomain } from '../utils/common';

export type ReactionId = Component | Reaction;

export type DepNodeAssembly = Map<any, Set<ReactionId>>;

export type DepNodeStatus = Map<any, EDepState>;

const isInBlackList = (propKey: string) => {
  const blackList = {
    constructor: true,
    properties: true,
    context: true,
    currentTarget: true,
    originalArrayLength: true,
    reactorConfigMap: true,
    computedProperties: true,
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
  public dependencyGraph = new Map<object, DepNodeAssembly>();
  private reactionIdDeps = new Map<ReactionId, Map<object, DepNodeStatus>>();
  private reactionIdStack: ReactionId[] = [];

  start(id: ReactionId) {
    this.reactionIdStack.push(id);
  }

  collect(target: object, propertyKey: any) {
    if (isInBlackList(propertyKey)) {
      return;
    }
    const stackLength = this.reactionIdStack.length;
    if (stackLength === 0) {
      return;
    }
    const currentReactionId = this.reactionIdStack[stackLength - 1];
    const depNodeAssembly = this.dependencyGraph.get(target);
    if (depNodeAssembly !== void 0) {
      const depNode = depNodeAssembly.get(propertyKey);
      if (depNode !== void 0) {
        depNode.add(currentReactionId);
      } else {
        depNodeAssembly.set(propertyKey, new Set([currentReactionId]));
      }
    } else {
      const map = new Map([[propertyKey, new Set([currentReactionId])]]);
      this.dependencyGraph.set(target, map);
    }
    const reactionDeps = this.reactionIdDeps.get(currentReactionId);
    if (reactionDeps !== void 0) {
      const depNodeStatusAssembly = reactionDeps.get(target);
      if (depNodeStatusAssembly !== void 0) {
        depNodeStatusAssembly.set(propertyKey, EDepState.LATEST);
      } else {
        reactionDeps.set(target, new Map([[
          propertyKey, EDepState.LATEST
        ]]));
      }
    } else {
      this.reactionIdDeps.set(currentReactionId, new Map([[target, new Map([[
        propertyKey, EDepState.LATEST
      ]])]]));
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
    map.forEach((depNode, target) => {
      depNode.forEach((value, key) => {
        // remove stale deps
        if (value === EDepState.OBSERVED) {
          const depNodeAssembly = this.dependencyGraph.get(target);
          if (depNodeAssembly) {
            const idSet = depNodeAssembly.get(key);
            idSet && idSet.delete(currentReactionId);
            depNode.set(key, EDepState.NOT_OBSERVED);
          }
        }
        // reset dep status
        if (value === EDepState.LATEST) {
          depNode.set(key, EDepState.OBSERVED);
        }
      });
    });
  }

  clear(id: ReactionId) {
    const map = this.reactionIdDeps.get(id);
    if (!map) {
      return;
    }
    map.forEach((depNode, target) => {
      depNode.forEach((value, key) => {
        const depNodeAssembly = this.dependencyGraph.get(target);
        if (depNodeAssembly) {
          const idSet = depNodeAssembly.get(key);
          idSet && idSet.delete(id);
        }
      });
    });
    this.reactionIdDeps.delete(id);
  }

  isObserved(targetKey: object, propKey: string) {
    const map = this.dependencyGraph.get(targetKey);
    return map !== void 0 && map.has(propKey) && (map.get(propKey) || new Set()).size > 0;
  }
}

export const depCollector = new DepCollector();

class TriggerCollector {
  public waitTriggerIds: Set<ReactionId> = new Set();

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
    const depNodeAssembly = depCollector.dependencyGraph.get(target);
    if (depNodeAssembly !== void 0) {
      const idSet = depNodeAssembly.get(enhanceKey);
      if (idSet !== void 0 && idSet.size > 0) {
        idSet.forEach(id => this.waitTriggerIds.add(id));
      }
    }
  }

  private recordDiff(target: object, enhanceKey: string, beforeUpdate: any, didUpdate: any, history: History) {
    let proxyTarget: object | undefined;
    if (isDomain(target)) {
      proxyTarget = target;
    } else {
      proxyTarget = rawCache.get(target);
    }
    if (!proxyTarget) {
      return;
    }
    const keyToDiffChangeMap = history.get(proxyTarget);
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
      history.set(proxyTarget, {
        [enhanceKey]: {
          beforeUpdate,
          didUpdate,
        }
      });
    }
  }

  endBatch(isClearHistory = true, action?: Action) {
    this.waitTriggerIds.clear();
    if (!ctx.timeTravel.isActive || !TimeTravel.currentTimeTravel || !isClearHistory) {
      return;
    }
    if (action) {
      action.historyNode.actionChain.length = 0;
      action.historyNode.history.clear();
      return;
    }
    actionTypeChain.length = 0;
    TimeTravel.currentTimeTravel.currentHistory.clear();
  }

  private saveHistory(ctt: TimeTravel, actionChain: ActionType[], history?: History) {
    if (!history) {
      return;
    }
    if (history.size === 0) {
      return;
    }
    const clonedChain = actionChain.slice();
    const clonedHistory = new Map(history);
    if (ctt.cursor === ctt.transactionHistories.length - 1) {
      ctt.transactionHistories.push({
        actionChain: clonedChain,
        history: clonedHistory,
      });
      ctt.cursor += 1;
    } else if (ctt.cursor < ctt.transactionHistories.length - 1) {
      ctt.transactionHistories = ctt.transactionHistories.slice(0, ctt.cursor + 1);
      ctt.transactionHistories.push({
        actionChain: clonedChain,
        history: clonedHistory,
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
    this.saveHistory(ctt, actionTypeChain, ctt.currentHistory);
  }
}

export const triggerCollector = new TriggerCollector();
