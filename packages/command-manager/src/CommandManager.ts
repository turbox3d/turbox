import { ViewEntity, SceneEvent, EventType } from '@turbox3d/event-manager';
import { Command } from './Command';
import { create } from './create';
import { compose } from './compose';
import { manager } from './manager';
import { SceneTool } from './type';

export abstract class CommandManager {
  /**
   * 构建一个 Command 基类
   *
   * 范型类型为激活时的函数参数
   */
  static create = create;
  /**
   * 构建一个组合了其他 Command 的结构（本质依然是一个 Command）
   */
  static compose = compose;
  /**
   * 构建一个 CommandManager 基类
   */
  static manager = manager;
  /**
   * 当前激活的 Command
   */
  protected activeCommand?: Command;

  toggleCommand(command?: Command) {
    this.activeCommand = command;
  }

  clearCommand() {
    this.activeCommand = undefined;
  }

  /**
   * 判断当前激活的 Command 是否为入参 command
   * @param command
   */
  isCommandActive(command: Command) {
    return this.activeCommand === command;
  }

  distributeEvent(eventType: EventType, ev: ViewEntity, event: SceneEvent, tools: SceneTool) {
    if (this.activeCommand) {
      this.activeCommand.distributeEvent(eventType, ev, event, tools);
    }
  }
}
