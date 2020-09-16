import { DispatchedAction, Dispatch } from '../interfaces';
import { isPromise } from '../utils/common';
import { OriginalRuntimeError } from '../core/store';
import { ORIGINAL_RUNTIME_ERROR } from '../const/symbol';

export function normalNextReturn(next: Dispatch, dispatchedAction: DispatchedAction, callback?: () => void, errorCallback?: (error: string) => void) {
  const result = next(dispatchedAction);
  if (isPromise(result)) {
    return new Promise<any>((resolve, reject) => {
      (result as Promise<any>).then((res) => {
        callback && callback();
        resolve(res);
      }).catch((error: string) => {
        errorCallback && errorCallback(error);
        reject(error);
      });
    });
  }
  if (result && (result as OriginalRuntimeError).type === ORIGINAL_RUNTIME_ERROR) {
    const errorMsg = (result as OriginalRuntimeError).msg;
    errorCallback && errorCallback(errorMsg);
  } else {
    callback && callback();
  }
  return result;
}
