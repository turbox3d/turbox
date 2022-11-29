import { CommandUnit } from './CommandUnit';
import { CommandUnitManager } from './Manager';

interface Item {
  unit: CommandUnit;
  transformParam?: (...args: any[]) => any;
}

/**
 * 具有分发能力的 CommandUnit
 *
 * 根据参数筛选要激活的 CommandUnit
 */
abstract class DistributeCommandUnit extends CommandUnit {
  private activeCommand: CommandUnit;

  active(...args: any[]) {
    // 如果存在未销毁的 CommandUnit , 请先销毁
    // this.dispose();

    const { unit, transformParam } = this.onActive(...args);

    const param = transformParam ? transformParam(...args) : args;
    this.activeCommand = unit;
    if (Array.isArray(param)) {
      this.activeCommand.active(...param);
    } else {
      this.activeCommand.active(param);
    }
  }

  dispose() {
    if (this.activeCommand) {
      this.activeCommand.dispose();
    }
  }

  /**
   * 用户需在该方法中实现分发逻辑
   *
   * @param args active 方法的入参
   */
  abstract onActive(...args: any[]): Item;
}

export { DistributeCommandUnit };
