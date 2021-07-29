import { createKeyByEvent, createKeyByHotKey, isValidEvent } from './util';

interface Listener {
  (hotkey: string): void;
}

/**
 * 快捷键注册器
 */
class HotKeyListener {
  private dom: HTMLDocument;

  private listener: Listener;

  /**
   * 存储所有快捷键的映射
   *
   * key: hotkey
   */
  private keyMap: { [key: string]: string } = {};

  constructor(dom: HTMLDocument, listener: Listener) {
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

  private addListener(dom: HTMLDocument) {
    // todo 考虑 keydown keypress keyup 的补充场景
    dom.addEventListener('keydown', this.onKeyDown);
    // dom.addEventListener('keypress', this.onKeyPress);
    // dom.addEventListener('keyup', this.onKeyUp);
  }

  private removeListener(dom: HTMLDocument) {
    dom.removeEventListener('keydown', this.onKeyDown);
    // dom.removeEventListener('keypress', this.onKeyPress);
    //   dom.removeEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (!isValidEvent(event)) {
      // eslint-disable-next-line no-useless-return
      return;
    }

    const key = createKeyByEvent(event);

    if (typeof this.keyMap[key] === 'string') {
      const listener = this.listener;
      // 触发快捷键
      listener(this.keyMap[key]);
    }
  };

  private onKeyPress = (event: KeyboardEvent) => {
    //
  };

  private onKeyUp = (event: KeyboardEvent) => {
    //
  };
}

export { HotKeyListener };
