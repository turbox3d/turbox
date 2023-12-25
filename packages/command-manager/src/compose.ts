import { Command } from './Command';
import { CommandManager } from './CommandManager';
import { CommandType } from './create';
import { ComposedCommand, IDeclaredMap } from './type';

/**
 * 构建一个组合了其他 Command 的结构（本质依然是一个 Command）
 */
function compose<M extends IDeclaredMap<CommandType> = IDeclaredMap<CommandType>>(declaredMap: M) {
  return class extends Command {
    constructor(holer: CommandManager, parent?: Command) {
      super(holer, parent);

      // 构建 $children
      Object.keys(declaredMap).forEach((key) => {
        const command = new declaredMap[key](this.holder, this);
        this[key] = command;
        this.$children[key] = command as Command;
      });
    }
  } as any as ComposedCommand<Command, CommandType, M>;
}

export { compose };
