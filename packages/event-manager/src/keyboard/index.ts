/* eslint-disable no-console */
import { HotKeyListener } from './listener';
import { Handler, HotKeyConfig, HotKeyData, Key } from './type';

interface IKeyMap {
  [key: string]: HotKeyConfig;
}

/**
 * 快捷键系统
 */
class HotKeyController {
  /** 键盘事件监听器 */
  private listener: HotKeyListener;

  private keyMap: IKeyMap = {};

  constructor() {
    this.listener = new HotKeyListener(document, this.onPress);
  }

  /**
   * 添加快捷键
   *
   * 快捷键冲突会给 Warn 并添加失败
   */
  on(config: HotKeyConfig) {
    const hotkeys = Array.isArray(config.key) ? config.key : [config.key];
    hotkeys.forEach((hotkey) => {
      this.listener.register(hotkey);
      if (this.keyMap[hotkey]) {
        const oldConfig = this.keyMap[hotkey];
        console.warn('conflicted hot key detected，please check again：');
        console.table({ hotkey, name: oldConfig.name || '', info: oldConfig.info || '' });
      } else {
        this.keyMap[hotkey] = config;
      }
    });

    return this;
  }

  /**
   * 移除快捷键
   */
  off(key: Key, handler: Handler) {
    const hotkeys = Array.isArray(key) ? key : [key];
    hotkeys.forEach((hotkey) => {
      this.listener.deregister(hotkey);
      const config = this.keyMap[hotkey];
      if (config && config.handler === handler) {
        delete this.keyMap[hotkey];
      }
    });

    return this;
  }

  // enable() {
  //   // todo: 1. 启用整个 context 2. 启用某个 key 3. key 是否需要增加匹配模式
  // }

  // disable() {
  //   //
  // }

  /**
   * 获取展示热键列表（仅返回 show 字段设置为 true 的数据）
   *
   * 该接口设计用来给展示快捷键的地方用
   */
  getHotKeyData() {
    const data: HotKeyData[] = [];
    // todo 这样数据可能一个被拆成了多个返回
    Object.keys(this.keyMap).forEach(hotkey => {
      const config = this.keyMap[hotkey];
      if (config.show) {
        data.push({
          key: hotkey,
          name: config.name,
          description: config.description,
        });
      }
    });

    return data;
  }

  /**
   * 触发快捷键回调
   */
  private onPress = (hotkey: string) => {
    if (this.keyMap[hotkey]) {
      const handler = this.keyMap[hotkey].handler;
      handler();
    }
  }
}

const HotKey = new HotKeyController();

export {
  HotKey, HotKeyController, HotKeyConfig, HotKeyData
};
