import { CommandManager } from '@turbox3d/turbox';

import { ActionsCommand } from './actions';
import { DefaultCommand } from './default';

class AppCommandManager extends CommandManager.install({
  defaultCommand: DefaultCommand,
  actionsCommand: ActionsCommand,
}) {
  installed() {
    this.defaultCommand.apply();
  }

  disposeAll() {
    this.defaultCommand.select.clearAllSelected();
    this.defaultCommand.dispose();
    this.actionsCommand.dispose();
  }
}

export const appCommandManager = new AppCommandManager();
