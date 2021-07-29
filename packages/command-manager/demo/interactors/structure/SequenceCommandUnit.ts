import { isArray } from "util";
import { CommandUnit } from "./CommandUnit";
import { CommandUnitManager } from "./Manager";

interface Item {
    unit: CommandUnit;
    transformParam?: (...args: any) => any;
}

abstract class SequenceCommandUnit {
    private sequence: Item[] = [];

    private index: number = -1;

    private current: Item;

    private cacheParam: any[] = [];

    private lastResult?: any;

    constructor(private manager: CommandUnitManager) {}

    active(...args: any[]) {
        // 向 manager 中注入 dispose 回调
        this.manager.addDisposeListener(this.onDisposeCommandUnit);
        // 重置 index
        this.resetIndex();

        this.cacheParam = args;
        this.sequence = this.onActive(...args);
        this.next();
    }

    /**
     * TODO 考虑是否需要提供 子CommandUnit 停止/取消整个流程的能力
     */
    private dispose() {
        this.manager.removeDisposeListener(this.onDisposeCommandUnit);
        if (this.current) {
            this.current.unit.dispose();
        }
    }

    abstract onActive(...args: any): Item[];

    private resetIndex() {
        this.index = -1;
    }

    private onDisposeCommandUnit = (command: CommandUnit, result?: any) => {
        if (this.current && this.current.unit === command) {
            this.lastResult = result;
            this.next();
        }
    }

    private next() {
        this.index += 1;
        this.current = this.sequence[this.index];

        if (!this.current) {
            this.dispose();
        }

        const { unit, transformParam } = this.current;

        const param = transformParam ? (this.index === 0 ? transformParam(...this.cacheParam) : transformParam(this.lastResult, ...this.cacheParam)) : this.cacheParam;
        
        if (Array.isArray(param)) {
            unit.active(...param);
        } else {
            unit.active(param);
        }
    }


}

export { SequenceCommandUnit };