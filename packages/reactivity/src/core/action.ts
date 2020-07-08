import { EMPTY_ACTION_NAME } from '../const/symbol';
import { store } from './store';
import { remove, includes, nextTick } from '../utils/common';
import { ActionStatus, EMaterialType } from '../const/enums';
import { HistoryNode } from './time-travel';
import { triggerCollector } from './collector';
import { materialCallStack } from './domain';
import { fail } from '../utils/error';

export const actionPool: Action[] = [];

export class Action {
  name: string;
  displayName = EMPTY_ACTION_NAME;
  status = ActionStatus.WORKING;
  historyNode: HistoryNode = {
    actionChain: [],
    history: new Map(),
  };
  static context?: Action;

  static create(name: string, displayName?: string) {
    const action = new Action();
    action.name = name;
    displayName && (action.displayName = displayName);
    action.historyNode.actionChain.push({
      name,
      displayName: action.displayName,
    });
    actionPool.push(action);

    return action;
  }

  execute(runner: () => void) {
    if (this.status === ActionStatus.ABORT) {
      return;
    }
    Action.context = this;
    runner();
    Action.context = void 0;
  }

  complete() {
    if (this.status === ActionStatus.ABORT) {
      return;
    }
    this.status = ActionStatus.COMPLETED;
    nextTick(() => {
      triggerCollector.save(this);
      triggerCollector.endBatch(true, this);
      remove(actionPool, this);
    });
  }

  revert() {
    const original = () => {
      this.historyNode.history.forEach((keyToDiffObj, target) => {
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
    if (!store) {
      fail('store is not ready, please init first.');
    }
    store.dispatch({
      name: `@@TURBOX__UNDO_${this.name}`,
      displayName: EMPTY_ACTION_NAME,
      payload: [],
      original,
      isInner: true,
    });
    materialCallStack.pop();
    this.historyNode = {
      actionChain: [],
      history: new Map(),
    };
  }

  static abortAll(revert = true) {
    actionPool.forEach(action => {
      action.abort(revert);
    });
  }

  static get(...args: string[]) {
    if (!args.length) {
      return actionPool;
    }
    if (args.length === 1) {
      return actionPool.filter(action => action.name === args[0]);
    }
    return actionPool.filter(action => includes(args, action.name));
  }

  abort(revert = true) {
    if (revert) {
      this.revert();
    }
    this.status = ActionStatus.ABORT;
    remove(actionPool, this);
  }
}
