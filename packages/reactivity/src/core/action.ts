import { remove, includes, isPromise, nextTick, fail } from '@turbox3d/shared';
import { EMPTY_ACTION_NAME, TURBOX_PREFIX } from '../const/symbol';
import { store } from './store';
import { ActionStatus, EMaterialType } from '../const/enums';
import { HistoryNode, TimeTravel } from './time-travel';
import { triggerCollector } from './collector';
import { mutation, MutationConfig } from '../decorators/mutation';

export const actionPool: Action[] = [];

export class Action {
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

  static abortAll(revert = true) {
    actionPool.forEach((action) => {
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

  name: string;
  displayName = EMPTY_ACTION_NAME;
  status = ActionStatus.WORKING;
  historyNode: HistoryNode = {
    actionChain: [],
    history: new Map(),
  };

  execute(runner: (...payload: any[]) => void | Promise<void>, payload: any[] = [], isWrapMutation = true, options?: MutationConfig): Promise<void> | void {
    if (this.status === ActionStatus.ABORT) {
      return;
    }
    Action.context = this;
    let wp: (...payload: any[]) => void | Promise<void>;
    if (isWrapMutation) {
      wp = mutation(this.name, runner, options);
    } else {
      wp = runner;
    }
    const result = wp(...payload);
    if (isPromise(result)) {
      return (result as Promise<void>).then(() => {
        Action.context = void 0;
      }, () => {
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
    triggerCollector.save(this);
    triggerCollector.endBatch(true, this);
    remove(actionPool, this);
  }

  undo(keepHistory = false) {
    const original = () => {
      TimeTravel.undoHandler(this.historyNode.history);
    };
    if (!store) {
      fail('store is not ready, please init first.');
    }
    const action = this.historyNode.actionChain[0] || {
      name: '',
      displayName: '',
    };
    store.dispatch({
      name: `${TURBOX_PREFIX}UNDO_${action.name}`,
      displayName: `UNDO_${action.displayName}`,
      payload: [],
      original,
      type: EMaterialType.UNDO,
      isInner: true,
    });
    if (keepHistory) {
      return;
    }
    this.historyNode = {
      actionChain: [],
      history: new Map(),
    };
    nextTick(() => {
      const ctt = TimeTravel.currentTimeTravel;
      ctt && ctt.onChange(ctt.undoable, ctt.redoable, 'undo', this);
    });
  }

  redo(keepHistory = false) {
    const original = () => {
      TimeTravel.redoHandler(this.historyNode.history);
    };
    if (!store) {
      fail('store is not ready, please init first.');
    }
    const action = this.historyNode.actionChain[0] || {
      name: '',
      displayName: '',
    };
    store.dispatch({
      name: `${TURBOX_PREFIX}REDO_${action.name}`,
      displayName: `REDO_${action.displayName}`,
      payload: [],
      original,
      type: EMaterialType.REDO,
      isInner: true,
    });
    if (keepHistory) {
      return;
    }
    this.historyNode = {
      actionChain: [],
      history: new Map(),
    };
    nextTick(() => {
      const ctt = TimeTravel.currentTimeTravel;
      ctt && ctt.onChange(ctt.undoable, ctt.redoable, 'redo', this);
    });
  }

  abort(revert = true) {
    if (revert) {
      this.undo();
    }
    this.status = ActionStatus.ABORT;
    triggerCollector.endBatch(true, this);
    remove(actionPool, this);
  }
}
