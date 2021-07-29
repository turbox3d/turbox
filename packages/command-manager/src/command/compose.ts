import { BaseCommand } from './BaseCommand';
import { BaseCommandBox } from './BaseCommandBox';
import { BaseCommandType } from './create';
import { ComposedCommand, IDeclaredMap } from './type';

/**
 * 构建一个组合了其他 BaseCommand 的结构（本质依然是一个 BaseCommand）
 */
function compose<M extends IDeclaredMap<BaseCommandType> = IDeclaredMap<BaseCommandType>>(declaredMap: M) {
  return class extends BaseCommand {
    constructor(holer: BaseCommandBox, parent?: BaseCommand) {
      super(holer, parent);

      // 构建 $children
      Object.keys(declaredMap).forEach((key) => {
        const command = new declaredMap[key](this.holder, this);
        this[key] = command;
        this.$children[key] = command as BaseCommand;
      });
    }
  } as any as ComposedCommand<BaseCommand, BaseCommandType, M>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export { compose };
