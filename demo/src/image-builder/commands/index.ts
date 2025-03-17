import { CommandManager } from '@turbox3d/turbox';

import { SharedCommand } from './shared';
import { DefaultCommand } from './default';

/**
 * 除公共函数指令集，其他顶层全局事件指令集之间是互斥的，即一次只能激活一组指令集，非当前指令集的事件会被自动禁用
 */
class AppCommandManager extends CommandManager.install({
  default: DefaultCommand,
  _shared: SharedCommand,
}) {
  installed() {
    this.default.apply(); // 激活默认指令集
  }

  disposeAll() {
    this.default.select.clearAllSelected();
    this.default.dispose();
    this._shared.dispose();
  }
}

export const appCommandManager = new AppCommandManager();
