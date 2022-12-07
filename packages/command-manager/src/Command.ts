/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { ViewEntity, SceneEvent, EventType } from '@turbox3d/event-manager';
import { CommandManager } from './CommandManager';
import { Interaction } from './Interaction';
import { SceneTool } from './type';

export abstract class Command extends Interaction {
  protected $children: { [key: string]: Command } = {};
  private activeChildren: Command[] = [];

  constructor(protected holder: CommandManager, private parent?: Command) {
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
      // 如果自身是应用在 Mgr 上的 Command，则要清理掉
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
   * 应用当前 Command 及其子级，该方法不仅会强制激活当前 Command 及其子级，还会使它们的交互事件生效
   * 同时只能有一个 Command 节点处于应用状态（兄弟节点的交互事件是互斥的）
   * 永远不用重写该方法，相关初始化逻辑请在 active 接口中编码
   */
  apply(...args: any[]) {
    this.holder.toggleCommand(this);
    this.active(...args);
  }

  /**
   * 激活当前 Command 及其子级，为即将到来的交互事件做好准备
   */
  active(...args: any[]): void {
    // 将子 command 也激活
    Object.values(this.$children).forEach(command => command.active(...args));
  }

  /**
   * 注销当前 Command 及其子级，同时将停止响应该指令及子级的交互事件
   */
  dispose(...args: any[]) {
    //
  }

  distributeEvent(eventType: EventType, ev: ViewEntity, event: SceneEvent, tools: SceneTool) {
    // step 1 先让子 Commands 处理事件
    // Object.values(this.$children).forEach(command => command.distributeEvent(eventType, ev, event));
    this.activeChildren.forEach(command => command.distributeEvent(eventType, ev, event, tools));
    // step2 自身处理事件
    this.distributeToSelf(eventType, ev, event, tools);
  }

  private onChildActive(command: Command) {
    if (this.activeChildren.indexOf(command) === -1) {
      this.activeChildren.push(command);
    }
  }

  private onChildDispose(command: Command) {
    const index = this.activeChildren.indexOf(command);
    if (index !== -1) {
      this.activeChildren.splice(index, 1);
    }
  }
}
