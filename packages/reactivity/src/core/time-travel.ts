import { fail, nextTick } from '@turbox3d/shared';
import { MapType, SetType } from './domain';
import { store, ActionType } from './store';
import { ctx } from '../const/config';
import { ECollectType, EMaterialType } from '../const/enums';
import { TURBOX_PREFIX } from '../const/symbol';
import { HistoryOperationType } from '../interfaces';
import { Action } from './action';

export interface DiffInfo {
  type: ECollectType;
  beforeUpdate: any;
  didUpdate: any;
}

export type KeyToDiffChangeMap = Map<any, DiffInfo>;

export type History = Map<object, KeyToDiffChangeMap>;

export interface HistoryNode {
  actionChain: ActionType[];
  history: History;
}

export interface HistoryCollectorPayload {
  type: ECollectType;
  beforeUpdate?: any;
  didUpdate?: any;
}

/**
 * collect prop diff history record
 */
export class TimeTravel {
  static currentTimeTravel?: TimeTravel;
  static processing = false;

  static switch = (instance: TimeTravel) => {
    TimeTravel.currentTimeTravel = instance;
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

  static undoHandler(history: History) {
    history.forEach((keyToDiffObj, target) => {
      if (!keyToDiffObj) {
        return;
      }
      keyToDiffObj.forEach((value, key) => {
        if (!value) {
          return;
        }
        if (value.beforeUpdate === value.didUpdate) {
          return;
        }
        if (value.type === ECollectType.MAP_SET || value.type === ECollectType.MAP_DELETE) {
          if (value.beforeUpdate === void 0) {
            (target as MapType).delete(key);
          } else {
            (target as MapType).set(key, value.beforeUpdate);
          }
        } else if (value.type === ECollectType.SET_ADD) {
          (target as SetType).delete(key);
        } else if (value.type === ECollectType.SET_DELETE) {
          (target as SetType).add(key);
        } else if (Array.isArray(target) && value.beforeUpdate === void 0) {
          delete target[key];
        } else {
          target[key] = value.beforeUpdate;
        }
      });
    });
  }

  static redoHandler(history: History) {
    history.forEach((keyToDiffObj, target) => {
      if (!keyToDiffObj) {
        return;
      }
      keyToDiffObj.forEach((value, key) => {
        if (!value) {
          return;
        }
        if (value.beforeUpdate === value.didUpdate) {
          return;
        }
        if (value.type === ECollectType.MAP_SET) {
          (target as MapType).set(key, value.didUpdate);
        } else if (value.type === ECollectType.SET_ADD) {
          (target as SetType).add(key);
        } else if (value.type === ECollectType.SET_DELETE) {
          (target as SetType).delete(key);
        } else if (value.type === ECollectType.MAP_DELETE) {
          (target as MapType).delete(key);
        } else {
          target[key] = value.didUpdate;
        }
      });
    });
  }

  get undoable() {
    return this.cursor >= 0;
  }

  get redoable() {
    return this.cursor < this.transactionHistories.length - 1;
  }

  currentHistory: History = new Map();
  transactionHistories: HistoryNode[] = [];
  cursor = -1;

  onChange(undoable: boolean, redoable: boolean, type: HistoryOperationType, action?: Action) {
    //
  }

  /**
   * @todo support multiple steps
   * revert to the previous history status
   */
  undo() {
    if (!this.undoable) {
      return;
    }
    const currentHistory = this.transactionHistories[this.cursor];
    const original = () => {
      TimeTravel.undoHandler(currentHistory.history);
    };
    if (!store) {
      fail('store is not ready, please init first.');
    }
    const action = currentHistory.actionChain[0] || {
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
    this.cursor -= 1;
    nextTick(() => {
      this.onChange(this.undoable, this.redoable, 'undo');
    });
  }

  /**
   * @todo support multiple steps
   * apply the next history status
   */
  redo() {
    if (!this.redoable) {
      return;
    }
    this.cursor += 1;
    const currentHistory = this.transactionHistories[this.cursor];
    const original = () => {
      TimeTravel.redoHandler(currentHistory.history);
    };
    if (!store) {
      fail('store is not ready, please init first.');
    }
    const action = currentHistory.actionChain[0] || {
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
    nextTick(() => {
      this.onChange(this.undoable, this.redoable, 'redo');
    });
  }

  clear() {
    this.currentHistory = new Map();
    this.transactionHistories.length = 0;
    this.cursor = -1;
    nextTick(() => {
      this.onChange(this.undoable, this.redoable, 'clear');
    });
  }
}
