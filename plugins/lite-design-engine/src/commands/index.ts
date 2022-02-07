import { BaseCommandBox } from '@turbox3d/turbox3d';
import { DefaultCommand } from './default';

class AppCommandBox extends BaseCommandBox {
  defaultCommand = new DefaultCommand(this);

  constructor() {
    super();
    this.defaultCommand.apply();
  }

  disposeAll() {
    this.defaultCommand.select.clearAllSelected();
  }
}

export const appCommandBox = new AppCommandBox();
