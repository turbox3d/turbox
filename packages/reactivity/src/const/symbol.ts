import { isSupportSymbol } from '../utils/lang';

export const TURBOX_PREFIX = '@@TURBOX__';

export function compatibleSymbol(key: string) {
  return isSupportSymbol() ? Symbol(key) : `${TURBOX_PREFIX}${key}`;
}

export const CURRENT_MATERIAL_TYPE = compatibleSymbol('material-type');
export const NAMESPACE = compatibleSymbol('namespace');
export const REACTIVE_COMPONENT_NAME = compatibleSymbol('reactive-component-name');
export const UNSUBSCRIBE_HANDLER = compatibleSymbol('unsubscribe-handler');
export const EMPTY_ACTION_NAME = `${TURBOX_PREFIX}empty`;
