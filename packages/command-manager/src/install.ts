import { CommandManager } from './CommandManager';
import { CommandType } from './create';
import { ComposedCommand, IDeclaredMap } from './type';

function install<M extends IDeclaredMap<CommandType> = IDeclaredMap<CommandType>>(declaredMap: M) {
  return class extends CommandManager {
    constructor() {
      super();
      Object.keys(declaredMap).forEach(key => {
        const command = new declaredMap[key](this);
        this[key] = command;
      });
      this.installed();
    }
  } as any as ComposedCommand<CommandManager, CommandType, M>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export { install };
