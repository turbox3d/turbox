/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
import { IConstructorOf } from '@turbox3d/shared';
import { BaseCommand } from './BaseCommand';

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

export type BaseCommandType = Omit<BaseCommand, 'active' | 'apply'>;

// type E = keyof BaseCommand;

// type P = Pick<BaseCommand, 'dispose' | 'distributeEvent' | '$children'>;

/**
 * 构建一个 BaseCommand 基类
 *
 * 范型类型为激活时的函数参数
 */
function create<P extends {} = string>() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return BaseCommand as any as IConstructorOf<LifeCircleClass<P> & BaseCommandType>;
}

export { create };
