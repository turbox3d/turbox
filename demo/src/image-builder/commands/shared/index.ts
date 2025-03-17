import { CommandManager } from '@turbox3d/turbox';
import { AdjustCommand } from './adjust';
import { EntityCommand } from './entity';

/**
 * 公共函数指令集（不存在全局事件，以函数收敛通用交互逻辑，可随时调用）
 */
class SharedCommand extends CommandManager.compose({
  adjust: AdjustCommand,
  entity: EntityCommand,
}) {
  active() {
    this.adjust.active();
    this.entity.active();
  }
}

export { SharedCommand };
