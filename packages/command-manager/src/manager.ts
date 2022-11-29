import { CommandManager } from './CommandManager';
import { CommandType } from './create';
import { ComposedCommand, IDeclaredMap } from './type';

/**
 * 构建一个 CommandManager 基类
 */
function manager<M extends IDeclaredMap<CommandType> = IDeclaredMap<CommandType>>(declaredMap: M) {
  return class extends CommandManager {
    constructor() {
      super();

      Object.keys(declaredMap).forEach((key) => {
        const command = new declaredMap[key](this);
        this[key] = command;
      });
    }
  } as any as ComposedCommand<CommandManager, CommandType, M>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export { manager };
