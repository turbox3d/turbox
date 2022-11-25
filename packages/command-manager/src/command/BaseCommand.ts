/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { ViewEntity, SceneEvent } from '@turbox3d/event-manager';
import { BaseCommandBox } from './BaseCommandBox';
import { BaseInteraction } from './BaseInteraction';
import { CommandEventType, SceneTool } from './type';

export abstract class BaseCommand extends BaseInteraction {
  protected $children: { [key: string]: BaseCommand } = {};
  private activeChildren: BaseCommand[] = [];

  constructor(protected holder: BaseCommandBox, private parent?: BaseCommand) {
    super();
    const activeFunc = this.active.bind(this);
    const disposeFunc = this.dispose.bind(this);

    this.active = (...args) => {
      if (this.parent && !this.holder.isCommandActive(this)) {
        // 仅作为激活的子 Command 记录在父 Command 上
        this.parent.onChildActive(this);
      }
      // 先执行自定义的 active 的相关工作
      activeFunc(...args);
    };
    this.dispose = (...args) => {
      // 如果自身是应用在 Box 上的 Command，则要清理掉
      if (this.holder.isCommandActive(this)) {
        this.holder.clearCommand();
      } else {
        // 将自己改为注销状态
        this.parent?.onChildDispose(this);
      }
      // 便利激活的子节点，置为注销状态
      [...this.activeChildren].forEach(child => child.dispose(...args));
      // 处理自定义工作
      disposeFunc(...args);
    };
  }

  /**
   * 应用当前 Command 来处理场景中的交互行为
   * CommandBox 上永远只能有一个 Command 处于应用状态
   * 永远不用重写该方法，相关初始化逻辑请在 active 接口中编码
   */
  apply(...args: any[]) {
    this.holder.toggleCommand(this);
    this.active(...args);
  }

  /**
   * 激活当前 Command ，将会收到场景视图中的交互事件
   */
  active(...args: any[]): void {
    // 将子 command 也激活
    Object.values(this.$children).forEach(command => command.active(...args));
  }

  /**
   * 注销当前 Command
   * Command 将停止响应场景视图中的交互事件
   */
  dispose(...args: any[]) {
    //
  }

  distributeEvent(eventType: CommandEventType, ev: ViewEntity, event: SceneEvent, tools: SceneTool) {
    // step 1 先让子 Commands 处理事件
    // Object.values(this.$children).forEach(command => command.distributeEvent(eventType, ev, event));
    this.activeChildren.forEach(command => command.distributeEvent(eventType, ev, event, tools));
    // step2 自身处理事件
    this.distributeToSelf(eventType, ev, event, tools);
  }

  private onChildActive(command: BaseCommand) {
    if (this.activeChildren.indexOf(command) === -1) {
      this.activeChildren.push(command);
    }
  }

  private onChildDispose(command: BaseCommand) {
    const index = this.activeChildren.indexOf(command);
    if (index !== -1) {
      this.activeChildren.splice(index, 1);
    }
  }
}
