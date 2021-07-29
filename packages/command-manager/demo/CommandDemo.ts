import { BaseCommand } from "../src/command/BaseCommand";
import { BaseCommandBox } from "../src/command/BaseCommandBox";
import { box } from '../src/command/box';
import { compose } from "../src/command/compose";
import { create } from '../src/command/create';

class ACommand extends BaseCommand {
}

class BCommand extends BaseCommand {
    constructor(holder: BaseCommandBox, parent?: BaseCommand) {
        super(holder, parent);

        console.log(this.document);
    }
}

class DCommand extends BaseCommand {}

class ECommand extends BaseCommand {}

// 组合单个Command
class ABCommand extends compose({
    aCommand: ACommand,
    bCommand: BCommand,
}) {
    active(name: string, age: number) {
        this.aCommand.active(name)
    }
}

// 组合以后的 Command 依然可以被组合
// 不等同于 compose([ACommand, BCommand, DCommand])
class ABDCommand extends compose({
    abCommand: ABCommand,
    dCommand: DCommand,
}) {

}

class WCommand extends create<{ a: string }>() {
    active(param: { a: '10' }) {

    }
}

const w = new WCommand();
// w.apply()


// 创建应用唯一的 Box
class DemoCommandBox extends BaseCommandBox {
    // 使用独立的 Command
    aCommand = new ACommand(this);

    eCommand = new ECommand(this);

    // 使用合成的 Command
    abdCommand =  new ABDCommand(this)
}

const document = {};

const demoCommandBox = new DemoCommandBox(document);

class AWCommand extends compose({
    a: ACommand,
    w: WCommand,
}) {

}

const awCommand = new AWCommand();
// awCommand.w.active();

class Demo2 extends box({
    a: ACommand,
    w: WCommand,
}) {

}

const a: BaseCommandBox = new Demo2();

const demo2 = new Demo2();
// demo2.w.apply()

class View {
    onClick() {
        demoCommandBox.aCommand.active();

        demoCommandBox.abdCommand.abCommand.active('', 18);
    }
}

export { demoCommandBox };
