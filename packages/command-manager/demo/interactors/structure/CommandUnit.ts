import { CommandUnitManager } from './Manager';

/**
 * 业务处理模块
 */
abstract class CommandUnit<T = any> {
  constructor(private holder: CommandUnitManager<T>) {}

  /**
   * 激活当前 CommandUnit
   *
   * 激活的 CommandUnit 将会收到场景视图中的交互事件
   *
   * 派生类重写该方法时，需调用 super.active()
   */
  active(...args: any[]) {
    this.holder.addActivatedCommand(this);
  }

  /**
   * 注销当前 CommandUnit
   *
   * CommandUnit 将不会响应场景视图中的交互事件
   *
   * 派生类重写该方法时，需调用 super.dispose()
   */
  dispose(result?: any) {
    this.holder.removeActivatedCommand(this, result);
  }

  // 场景交互回调

  onClick(entity: T) {}

  // onSelected(entity: T) {}

  onHoverIn(entity: T) {}

  onHoverOut(entity: T) {}

  beforeDrag(entity: T) {}

  onDrag(entity: T) {}

  afterDrag(entity: T) {}

  onMouseUp(entity: T) {}

  onMouseDown(entity: T) {}

  onMouseMove(entity: T) {}

  onThrottledDrag(entity: T) {}

  onThrottledMouseMove(entity: T) {}

  // TODO 考虑对视图能力的支持
}

export { CommandUnit };
