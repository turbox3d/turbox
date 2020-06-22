import { materialCallStack } from './domain';
import { store, actionTypeChain, ActionType } from './store';
import generateUUID from '../utils/uuid';
import { ctx } from '../const/config';
import { triggerCollector } from './collector';
import { invariant, fail } from '../utils/error';
import { nextTick } from '../utils/common';
import { EMPTY_ACTION_NAME } from '../const/symbol';
import { ECollectType, EMaterialType } from '../const/enums';

export interface KeyToDiffChangeMap {
  [key: string]: {
    beforeUpdate: any;
    didUpdate: any;
  };
}

export type History = Map<object, KeyToDiffChangeMap>;

export interface HistoryNode {
  actionChain: ActionType[];
  history: History;
}

export interface HistoryCollectorPayload {
  type: ECollectType;
  beforeUpdate: any;
  didUpdate: any;
}

/**
 * collect prop diff history record
 */
export class TimeTravel {
  currentHistory?: History;
  transactionHistories: HistoryNode[] = [];
  cursor: number = -1;
  static currentTimeTravel?: TimeTravel;
  static freeze: boolean = false;

  static switch = (instance: TimeTravel) => {
    TimeTravel.currentTimeTravel = instance;
    TimeTravel.resume();
  };

  static create = () => {
    const tt = new TimeTravel();
    return tt;
  };

  static pause = () => {
    ctx.timeTravel.isActive = false;
  };

  static resume = () => {
    ctx.timeTravel.isActive = true;
  };

  static undo = () => {
    TimeTravel.currentTimeTravel && TimeTravel.currentTimeTravel.undo();
  }

  static redo = () => {
    TimeTravel.currentTimeTravel && TimeTravel.currentTimeTravel.redo();
  }

  static clear = () => {
    TimeTravel.currentTimeTravel && TimeTravel.currentTimeTravel.clear();
  }

  static start = (name: string, displayName?: string) => {
    invariant(!TimeTravel.freeze, 'Already started, please complete first.');
    if (TimeTravel.freeze) {
      return;
    }
    TimeTravel.resume();
    actionTypeChain.push({
      name,
      displayName: displayName || EMPTY_ACTION_NAME,
    });
    TimeTravel.freeze = true;
  }

  static complete = () => {
    if (!TimeTravel.freeze) {
      return;
    }
    nextTick(() => {
      TimeTravel.freeze = false;
      triggerCollector.save(actionTypeChain);
      triggerCollector.endBatch();
    });
  }

  static get undoable() {
    return TimeTravel.currentTimeTravel && TimeTravel.currentTimeTravel.undoable;
  }

  static get redoable() {
    return TimeTravel.currentTimeTravel && TimeTravel.currentTimeTravel.redoable;
  }

  get undoable() {
    return this.cursor >= 0;
  }

  get redoable() {
    return this.cursor < this.transactionHistories.length - 1;
  }

  /**
   * @todo support multiple steps
   * revert to the previous history status
   */
  undo(stepNum: number = 1) {
    if (!this.undoable) {
      return;
    }
    const currentHistory = this.transactionHistories[this.cursor];
    const original = () => {
      currentHistory.history.forEach((keyToDiffObj, target) => {
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
      name: `@@TURBOX__UNDO_${generateUUID()}`,
      displayName: EMPTY_ACTION_NAME,
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
    if (!this.redoable) {
      return;
    }
    this.cursor += 1;
    const currentHistory = this.transactionHistories[this.cursor];
    const original = () => {
      currentHistory.history.forEach((keyToDiffObj, target) => {
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
    if (!store) {
      fail('store is not ready, please init first.');
    }
    store.dispatch({
      name: `@@TURBOX__REDO_${generateUUID()}`,
      displayName: EMPTY_ACTION_NAME,
      payload: [],
      original,
      isInner: true,
    });
    materialCallStack.pop();
  }

  clear() {
    this.currentHistory = void 0;
    this.transactionHistories = [];
    this.cursor = -1;
  }
}
