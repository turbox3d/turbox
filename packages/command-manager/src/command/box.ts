import { BaseCommandBox } from './BaseCommandBox';
import { BaseCommandType } from './create';
import { ComposedCommand, IDeclaredMap } from './type';

/**
 * 构建一个 BaseCommandBox 基类
 */
function box<M extends IDeclaredMap<BaseCommandType> = IDeclaredMap<BaseCommandType>>(declaredMap: M) {
  return class extends BaseCommandBox {
    constructor() {
      super();

      Object.keys(declaredMap).forEach((key) => {
        const command = new declaredMap[key](this);
        this[key] = command;
      });
    }
  } as any as ComposedCommand<BaseCommandBox, BaseCommandType, M>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export { box };
