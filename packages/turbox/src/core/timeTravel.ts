import { materialCallStack } from './domain';
import { EMaterialType } from '../interfaces';
import { store } from './store';
import generateUUID from '../utils/uuid';
import { ctx } from '../const/config';

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
  name: string;
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
export class TimeTravel {
  currentHistory?: History;
  /**
   * Considering the memory cost and iteratable, using Set just only keep id.
   */
  currentHistoryIdSet?: HistoryIdSet;
  transactionHistories: HistoryNode[] = [];
  cursor: number = -1;
  static currentTimeTravel?: TimeTravel;

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
      name: `@@TURBOX__UNDO_${generateUUID()}`,
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
      name: `@@TURBOX__REDO_${generateUUID()}`,
      payload: [],
      original,
      isInner: true,
    });
    materialCallStack.pop();
  }

  clear() {
    this.currentHistory = void 0;
    this.currentHistoryIdSet = void 0;
    this.transactionHistories = [];
    this.cursor = -1;
  }
}
