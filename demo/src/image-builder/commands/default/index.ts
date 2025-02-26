import { CommandManager, SelectionCommand, HintCommand } from '@turbox3d/turbox';

import { MoveCommand } from './move';

/**
 * 画布默认激活的全局事件指令集
 */
class DefaultCommand extends CommandManager.compose({
  hint: HintCommand,
  select: SelectionCommand,
  move: MoveCommand,
}) {
  active() {
    this.select.active({
      hint: this.hint,
    });
    this.hint.active(this.select);
    this.move.active();
  }
}

export { DefaultCommand };
