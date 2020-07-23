import { DispatchedAction, Dispatch } from '../interfaces';
import { isPromise } from '../utils/common';

export function normalNextReturn(next: Dispatch, dispatchedAction: DispatchedAction, callback?: Function) {
  const result = next(dispatchedAction);
  if (isPromise(result)) {
    return new Promise<DispatchedAction>((resolve) => {
      (result as Promise<DispatchedAction>).then((res) => {
        callback && callback();
        resolve(res);
      });
    });
  }
  callback && callback();
  return result;
}
