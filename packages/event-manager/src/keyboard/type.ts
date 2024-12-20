import { HotKeyEventType } from './listener/util';

export type Key = string | string[];

export type Handler = (keyEventType: HotKeyEventType) => void;
export type Condition = () => boolean;

export interface HotKeyConfig {
  /**
   * 快捷键字符
   *
   * 单个：'ctrl+a'
   *
   * 多个：['ctrl+a', 'ctrl+b', 'meta+a']
   */
  key: Key;
  /**
   * 快捷功能名称
   */
  name?: string;
  /**
   * 快捷键功能描述
   */
  description?: string;
  /**
   * 快捷键是否露出
   *
   * @default false
   */
  show?: boolean;
  /**
   * 快捷键的额外信息（当快捷键冲突时会提示该信息）
   */
  info?: string;
  /**
   * 快捷键回调函数
   */
  handler: Handler;
  /**
   * 快捷键触发回调的条件函数
   *
   * @default () => true
   */
  condition?: Condition;
}

export interface HotKeyData {
  key: string;
  name?: string;
  description?: string;
}
