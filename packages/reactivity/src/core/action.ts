import { EMPTY_ACTION_NAME, TURBOX_PREFIX } from '../const/symbol';
import { store } from './store';
import { remove, includes, nextTick, isPromise } from '../utils/common';
import { ActionStatus, EMaterialType } from '../const/enums';
import { HistoryNode, TimeTravel } from './time-travel';
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

  execute(runner: () => void | Promise<void>): void | Promise<void> {
    if (this.status === ActionStatus.ABORT) {
      return;
    }
    Action.context = this;
    const result = runner();
    if (isPromise(result)) {
      return (result as Promise<void>).then(() => {
        Action.context = void 0;
      });
    }
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

  undo(keepHistory = false) {
    if (!this.historyNode.actionChain.length) {
      return;
    }
    const original = () => {
      TimeTravel.undoHandler(this.historyNode.history);
    };
    materialCallStack.push(EMaterialType.UNDO);
    if (!store) {
      fail('store is not ready, please init first.');
    }
    const action = this.historyNode.actionChain[0];
    store.dispatch({
      name: `${TURBOX_PREFIX}UNDO_${action.name}`,
      displayName: `UNDO_${action.displayName}`,
      payload: [],
      original,
      type: EMaterialType.UNDO,
      isInner: true,
    });
    materialCallStack.pop();
    if (keepHistory) {
      return;
    }
    this.historyNode = {
      actionChain: [],
      history: new Map(),
    };
  }

  redo(keepHistory = false) {
    if (!this.historyNode.actionChain.length) {
      return;
    }
    const original = () => {
      TimeTravel.redoHandler(this.historyNode.history);
    };
    materialCallStack.push(EMaterialType.REDO);
    if (!store) {
      fail('store is not ready, please init first.');
    }
    const action = this.historyNode.actionChain[0];
    store.dispatch({
      name: `${TURBOX_PREFIX}REDO_${action.name}`,
      displayName: `REDO_${action.displayName}`,
      payload: [],
      original,
      type: EMaterialType.REDO,
      isInner: true,
    });
    materialCallStack.pop();
    if (keepHistory) {
      return;
    }
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
      this.undo();
    }
    this.status = ActionStatus.ABORT;
    remove(actionPool, this);
  }
}
