import { Key } from '../keyCode';

export enum HotKeyEventType {
  KeyDown = 'key-down',
  KeyUp = 'key-up',
}

export const Modifiers = {
  Node: {
    key: 'none',
    code: 0b0000,
  },
  Shift: {
    key: 'shift',
    code: 0b0001,
  },
  Ctrl: {
    key: 'ctrl',
    code: 0b0010,
  },
  Control: {
    key: 'control',
    code: 0b0010,
  },
  Alt: {
    key: 'alt',
    code: 0b0100,
  },
  Meta: {
    key: 'meta',
    code: 0b1000,
  },
};

const { Node, Shift, Ctrl, Control, Alt, Meta } = Modifiers;

/**
 * 根据快捷键构建 标示key
 */
export function createKeyByHotKey(hotkey: string) {
  const keys = hotkey.replace(/[ +]*\+[ +]*/g, '+').toLowerCase().split('+');
  const length = keys.length;

  let modifiers = Node.code;

  for (let i = 0; i < length; i++) {
    const key = keys[i];
    if (key === Shift.key) {
      modifiers |= Shift.code;
    } else if (key === Ctrl.key) {
      modifiers |= Ctrl.code;
    } else if (key === Control.key) {
      modifiers |= Control.code;
    } else if (key === Alt.key) {
      modifiers |= Alt.code;
    } else if (key === Meta.key) {
      modifiers |= Meta.code;
    }
  }

  const currentKey = keys[length - 1];
  if (currentKey === Key.Ctrl.toLowerCase()) {
    return `${Key.Control.toLowerCase()}@${modifiers}`;
  }

  return `${currentKey}@${modifiers}`;
}

/**
 * 根据键盘事件构建 标示key
 */
export function createKeyByEvent(event: KeyboardEvent) {
  let modifiers = Node.code;

  if (event.shiftKey) {
    modifiers |= Shift.code;
  }

  if (event.altKey) {
    modifiers |= Alt.code;
  }

  if (event.ctrlKey) {
    modifiers |= Ctrl.code;
  }

  if (event.metaKey) {
    modifiers |= Meta.code;
  }

  const key = event.key.toLowerCase();

  return `${key}@${modifiers}`;
}

export function createKeyByUpEvent(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  let modifiers = Node.code;

  if (event.shiftKey) {
    modifiers |= Shift.code;
  } else if (key === Key.Shift.toLowerCase()) {
    modifiers |= Shift.code;
    return `${Key.Shift.toLowerCase()}@${modifiers}`;
  }

  if (event.altKey) {
    modifiers |= Alt.code;
  } else if (key === Key.Alt.toLowerCase()) {
    modifiers |= Alt.code;
    return `${Key.Alt.toLowerCase()}@${modifiers}`;
  }

  if (event.ctrlKey) {
    modifiers |= Ctrl.code;
  } else if (key === Key.Control.toLowerCase()) {
    modifiers |= Ctrl.code;
    return `${Key.Control.toLowerCase()}@${modifiers}`;
  }

  if (event.metaKey) {
    modifiers |= Meta.code;
  } else if (key === Key.Meta.toLowerCase()) {
    modifiers |= Meta.code;
    return `${Key.Meta.toLowerCase()}@${modifiers}`;
  }

  return `${key}@${modifiers}`;
}

export function isValidEvent(event: KeyboardEvent) {
  // const key = event.key;
  // 忽略 'shift' 'alt' 'ctrl' 'meta' 等辅助按键
  // if (key === Key.Shift ||
  //   key === Key.Alt ||
  //   key === Key.Control ||
  //   key === Key.Meta) {
  //   return false;
  // }

  const target = event.target;
  // 忽略要改变输入的表单元素
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return false;
  }

  return true;
}
