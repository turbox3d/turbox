import { isSupportSymbol } from '@turbox3d/shared';

export const TURBOX_PREFIX = '@@TURBOX__';

export function compatibleSymbol(key: string) {
  return isSupportSymbol() ? Symbol(key) : `${TURBOX_PREFIX}${key}`;
}

export const NAMESPACE = compatibleSymbol('namespace');
export const REACTIVE_COMPONENT_NAME = compatibleSymbol('reactive-component-name');
export const UNSUBSCRIBE_HANDLER = compatibleSymbol('unsubscribe-handler');
export const MATERIAL_TYPE = `${TURBOX_PREFIX}materialType`;
export const EMPTY_ACTION_NAME = `${TURBOX_PREFIX}empty`;
export const DEFAULT_FIELD_NAME = `${TURBOX_PREFIX}field`;
