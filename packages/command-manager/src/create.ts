/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
import { IConstructorOf } from '@turbox3d/shared';
import { Command } from './Command';

// 仅作为类型标示无参数的 Command 生命周期函数
class INoParamCommand {
  apply() {
    //
  }

  active() {
    //
  }
}

// 仅作为类型标示有参数的 Command 生命周期函数
class IParamCommand<P extends {}> {
  apply(param: P) {
    //
  }

  active(param: P) {
    //
  }
}

type LifeCircleClass<P extends {} = string> = P extends {} ? IParamCommand<P> : INoParamCommand;

export type CommandType = Omit<Command, 'active' | 'apply'>;

// type E = keyof Command;

// type P = Pick<Command, 'dispose' | 'distributeEvent' | '$children'>;

/**
 * 构建一个 Command 基类
 *
 * 范型类型为激活时的函数参数
 */
function create<P extends {} = string>() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Command as any as IConstructorOf<LifeCircleClass<P> & CommandType>;
}

export { create };
