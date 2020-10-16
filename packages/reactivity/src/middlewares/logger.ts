import { Middleware } from '../interfaces';
import { deepMerge } from '../utils/deep-merge';
import { EMPTY_ACTION_NAME } from '../const/symbol';
import { normalNextReturn } from './common';
import { Action } from '../core/action';
import { ctx } from '../const/config';
import { TimeTravel, History } from '../core/time-travel';
import { materialCallStack, Domain } from '../core/domain';
import { isDomain } from '../utils/common';

interface DiffLog {
  name: any;
  target: any;
  property: any;
  before: any;
  after: any;
}

function createLoggerMiddleware(): Middleware {
  return () => (next) => (dispatchedAction) => {
    const { name, displayName, domain } = dispatchedAction;

    if (!domain) {
      return normalNextReturn(next, dispatchedAction);
    }

    const length = materialCallStack.length;
    if (ctx.middleware.skipNestLog && length !== 1) {
      return normalNextReturn(next, dispatchedAction);
    }
    if (!ctx.middleware.diffLogger) {
      console.group(
        `%c[TURBOX LOG]: PREV ${domain.constructor.name} ${name} ${displayName !== EMPTY_ACTION_NAME ? displayName : ''}`,
        'background: #929493; color: #fff; font-weight: bold; padding: 3px 5px;'
      );
      console.dir(deepMerge({}, domain.$$turbox_properties, { clone: true })); // deep copy，logger current state before change.
      console.groupEnd();

      return normalNextReturn(next, dispatchedAction, () => {
        if (!domain) {
          return;
        }
        console.group(
          `%c[TURBOX LOG]: NEXT ${domain.constructor.name} ${name} ${displayName !== EMPTY_ACTION_NAME ? displayName : ''}`,
          'background: #218D41; color: #fff; font-weight: bold; padding: 3px 5px;'
        );
        console.dir(deepMerge({}, domain.$$turbox_properties, { clone: true })); // deep copy，logger current state after change.
        console.groupEnd();
      });
    }

    return normalNextReturn(next, dispatchedAction, () => {
      if (!domain) {
        return;
      }
      let diffHistory: History = new Map();
      if (Action.context) {
        diffHistory = new Map(Action.context.historyNode.history);
      } else {
        if (TimeTravel.currentTimeTravel) {
          diffHistory = new Map(TimeTravel.currentTimeTravel.currentHistory);
        }
      }
      const logArr: DiffLog[] = [];
      diffHistory.forEach((keyToDiffChangeMap, target) => {
        keyToDiffChangeMap.forEach((diffInfo, key) => {
          logArr.push({
            name: target.constructor.name,
            target: isDomain(target) ? (target as Domain).properties : target,
            property: key,
            before: diffInfo.beforeUpdate,
            after: diffInfo.didUpdate
          });
        });
      });
      if (logArr.length) {
        console.group(
          `%c[TURBOX LOG]: DIFF ${domain.constructor.name} ${name} ${displayName !== EMPTY_ACTION_NAME ? displayName : ''}`,
          'background: #FF5F0F; color: #fff; font-weight: bold; padding: 3px 5px;'
        );
        console.table(logArr);
        console.groupEnd();
      }
    });
  }
}

export default createLoggerMiddleware();
