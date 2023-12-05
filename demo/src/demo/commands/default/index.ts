import { CommandManager, SelectionCommand, HintCommand } from '@turbox3d/turbox';

import { MoveCommand } from './move/index';
import { RotateCommand } from './rotate/index';
import { ScaleCommand } from './scale/index';

class DefaultCommand extends CommandManager.compose({
  hint: HintCommand,
  select: SelectionCommand,
  move: MoveCommand,
  scale: ScaleCommand,
  rotate: RotateCommand,
}) {
  active() {
    this.select.active({
      hint: this.hint,
    });
    this.hint.active(this.select);
    this.move.active();
    this.rotate.active();
    this.scale.active();
  }
}

export { DefaultCommand };
