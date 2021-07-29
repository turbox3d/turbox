import { box } from './box';
import { compose } from './compose';
import { create } from './create';

/**
 * Command 命名空间
 */
export const Command = {
  /**
   * 构建一个 BaseCommand 基类
   *
   * 范型类型为激活时的函数参数
   */
  create,
  /**
   * 构建一个组合了其他 BaseCommand 的结构（本质依然是一个 BaseCommand）
   */
  compose,
  /**
   * 构建一个 BaseCommandBox 基类
   */
  box,
};
