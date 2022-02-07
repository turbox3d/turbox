import { IViewEntity, SceneEvent } from '@turbox3d/event-manager';
import { BaseCommand } from './BaseCommand';
import { CommandEventType, ITool } from './type';

export abstract class BaseCommandBox {
  /**
   * 当前激活的 Command
   */
  protected activeCommand?: BaseCommand;

  toggleCommand(command?: BaseCommand) {
    this.activeCommand = command;
  }

  clearCommand() {
    this.activeCommand = undefined;
  }

  /**
   * 判断当前激活的 Command 是否为入参 command
   * @param command
   */
  isCommandActive(command: BaseCommand) {
    return this.activeCommand === command;
  }

  distributeEvent(eventType: CommandEventType, ev: IViewEntity, event: SceneEvent, tools: ITool) {
    if (this.activeCommand) {
      this.activeCommand.distributeEvent(eventType, ev, event, tools);
    }
  }
}
