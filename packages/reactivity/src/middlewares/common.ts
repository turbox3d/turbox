import { DispatchedAction, Dispatch } from '../interfaces';
import { isPromise } from '../utils/common';

export function normalNextReturn(next: Dispatch, dispatchedAction: DispatchedAction, callback?: () => void, errorCallback?: (error: string) => void) {
  const result = next(dispatchedAction);
  if (isPromise(result)) {
    return new Promise<any>((resolve, reject) => {
      (result as Promise<any>).then((res) => {
        callback && callback();
        resolve(res);
      }).catch((error: Error) => {
        errorCallback && errorCallback(error.stack || error.message);
        reject(error);
      });
    });
  }
  if (result && result instanceof Error) {
    errorCallback && errorCallback(result.stack || result.message);
  } else {
    callback && callback();
  }
  return result;
}
