import { compose, SelectionCommand, HintCommand } from '@turbox3d/turbox3d';
import { MoveCommand } from './move/index';
import { ScaleCommand } from './scale/index';
import { RotateCommand } from './rotate/index';
import { ClipCommand } from './clip';

class DefaultCommand extends compose({
  hint: HintCommand,
  select: SelectionCommand,
  move: MoveCommand,
  scale: ScaleCommand,
  rotate: RotateCommand,
  clip: ClipCommand,
}) {
  active() {
    this.select.active({
      hint: this.hint,
    });
    this.hint.active(this.select);
    this.move.active();
    this.rotate.active();
    this.scale.active();
    this.clip.active();
  }
}

export { DefaultCommand };
