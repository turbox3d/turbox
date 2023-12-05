import { CommandManager } from '@turbox3d/turbox';

import { ClipCommand } from './clip/index';
import { DefaultCommand } from './default';
import { MeasureCommand } from './measure/index';
import { SkewCommand } from './skew/index';

class AppCommandManager extends CommandManager {
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

export const appCommandManager = new AppCommandManager();
