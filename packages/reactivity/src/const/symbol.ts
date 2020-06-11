import { isSupportSymbol } from '../utils/lang';

export function compatibleSymbol(key: string) {
  return isSupportSymbol() ? Symbol(key) : `@@TURBOX__${key}`;
}

export const CURRENT_MATERIAL_TYPE = compatibleSymbol('material-type');
export const NAMESPACE = compatibleSymbol('namespace');
export const EMPTY_ACTION_NAME = '@@TURBOX__empty';
