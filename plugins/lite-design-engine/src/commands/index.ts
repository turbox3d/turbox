import { BaseCommandBox } from '@turbox3d/turbox3d';
import { DefaultCommand } from './default';
import { ClipCommand } from './clip/index';
import { SkewCommand } from './skew/index';

class AppCommandBox extends BaseCommandBox {
  defaultCommand = new DefaultCommand(this);
  clipCommand = new ClipCommand(this);
  skewCommand = new SkewCommand(this);

  constructor() {
    super();
    this.defaultCommand.apply();
  }

  disposeAll() {
    this.defaultCommand.select.clearAllSelected();
    this.defaultCommand.dispose();
    this.clipCommand.dispose();
    this.skewCommand.dispose();
  }
}

export const appCommandBox = new AppCommandBox();
