import { BaseCommandBox } from '@turbox3d/turbox';
import { DefaultCommand } from './default';
import { ClipCommand } from './clip/index';
import { SkewCommand } from './skew/index';
import { MeasureCommand } from './measure/index';

class AppCommandBox extends BaseCommandBox {
  defaultCommand = new DefaultCommand(this);
  clipCommand = new ClipCommand(this);
  skewCommand = new SkewCommand(this);
  measureCommand = new MeasureCommand(this);

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
