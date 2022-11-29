import { Command } from '../src/Command';
import { CommandManager } from '../src/CommandManager';
import { manager } from '../src/manager';
import { compose } from '../src/compose';
import { create } from '../src/create';

class ACommand extends Command {}

class BCommand extends Command {
  constructor(holder: CommandManager, parent?: Command) {
    super(holder, parent);
  }
}

class DCommand extends Command {}

class ECommand extends Command {}

// 组合单个Command
class ABCommand extends compose({
  aCommand: ACommand,
  bCommand: BCommand,
}) {
  active(name: string, age: number) {
    this.aCommand.active(name);
  }
}

// 组合以后的 Command 依然可以被组合
// 不等同于 compose([ACommand, BCommand, DCommand])
class ABDCommand extends compose({
  abCommand: ABCommand,
  dCommand: DCommand,
}) {}

class WCommand extends create<{ a: string }>() {
  active(param: { a: '10' }) {}
}

const w = new WCommand();
// w.apply()

// 创建应用唯一的 Box
class DemoCommandBox extends CommandManager {
  // 使用独立的 Command
  aCommand = new ACommand(this);

  eCommand = new ECommand(this);

  // 使用合成的 Command
  abdCommand = new ABDCommand(this);
}

const demoCommandBox = new DemoCommandBox();

class AWCommand extends compose({
  a: ACommand,
  w: WCommand,
}) {}

const awCommand = new AWCommand();
// awCommand.w.active();

class Demo2 extends manager({
  a: ACommand,
  w: WCommand,
}) {}

const a: CommandManager = new Demo2();

const demo2 = new Demo2();
// demo2.w.apply()

class View {
  onClick() {
    demoCommandBox.aCommand.active();

    demoCommandBox.abdCommand.abCommand.active('', 18);
  }
}

export { demoCommandBox };
