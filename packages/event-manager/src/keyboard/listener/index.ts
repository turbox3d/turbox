import { createKeyByEvent, createKeyByHotKey, isValidEvent, HotKeyEventType } from './util';

interface Listener {
  (hotkey: string, keyEventType: HotKeyEventType): void;
}

/**
 * 快捷键注册器
 */
class HotKeyListener {
  private dom: Document;

  private listener: Listener;

  /**
   * 存储所有快捷键的映射
   *
   * key: hotkey
   */
  private keyMap: { [key: string]: string } = {};

  constructor(dom: Document, listener: Listener) {
    this.dom = dom;
    this.listener = listener;

    this.addListener(this.dom);
  }

  /**
   * 添加快捷键
   * @param hotkey
   */
  register(hotkey: string) {
    const key = createKeyByHotKey(hotkey);
    this.keyMap[key] = hotkey;
    return true;
  }

  /**
   * 移除快捷键
   * @param hotkey
   */
  deregister(hotkey: string) {
    const key = createKeyByHotKey(hotkey);
    delete this.keyMap[key];
    return true;
  }

  private addListener(dom: Document) {
    // todo 考虑 keydown keypress keyup 的补充场景
    dom.addEventListener('keydown', this.onKeyDown);
    // dom.addEventListener('keypress', this.onKeyPress);
    dom.addEventListener('keyup', this.onKeyUp);
  }

  private removeListener(dom: Document) {
    dom.removeEventListener('keydown', this.onKeyDown);
    // dom.removeEventListener('keypress', this.onKeyPress);
    dom.removeEventListener('keyup', this.onKeyUp);
  }

  private triggerHandler(event: KeyboardEvent, keyEventType: HotKeyEventType) {
    if (!isValidEvent(event)) {
      // eslint-disable-next-line no-useless-return
      return;
    }

    const key = createKeyByEvent(event);

    if (typeof this.keyMap[key] === 'string') {
      const listener = this.listener;
      // 触发快捷键
      listener(this.keyMap[key], keyEventType);
    }
  }

  private onKeyDown = (event: KeyboardEvent) => {
    this.triggerHandler(event, HotKeyEventType.KeyDown);
  };

  private onKeyPress = (event: KeyboardEvent) => {
    //
  };

  private onKeyUp = (event: KeyboardEvent) => {
    this.triggerHandler(event, HotKeyEventType.KeyUp);
  };
}

export { HotKeyListener };
