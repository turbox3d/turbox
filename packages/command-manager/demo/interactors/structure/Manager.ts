import { throttleInAFrame } from '@turbox3d/shared';
import { CommandUnit } from './CommandUnit';
import { EventType } from './type';

interface DisposeListener {
    (command: CommandUnit, result?: any): void;
}

/**
 * CommandUnit 管理器
 */
class CommandUnitManager<T = any> {
    static create<T = any>() {
        return new CommandUnitManager<T>();
    }

    /**
     * 存放已激活的 CommandUnit
     *
     * 激活的 CommandUnit 将会响应场景中的交互回调
     */
    private activatedCommand: CommandUnit<T>[] = [];

    addActivatedCommand(cu: CommandUnit<T>) {
        if (!this.hasCommand(cu)) {
            this.activatedCommand.push(cu);
        }
    }

    removeActivatedCommand(cu: CommandUnit<T>, result?: any) {
        const index = this.activatedCommand.indexOf(cu);
        if (index !== -1) {
            this.activatedCommand.splice(index, 1)
            this.disposeListener.forEach(listener => {
                listener(cu, result);
            });
        }
    }

    private hasCommand(cu: CommandUnit<T>) {
        return this.activatedCommand.includes(cu);
    }

    private disposeListener: DisposeListener[] = []

    addDisposeListener(listener: DisposeListener) {
        if (!this.disposeListener.includes(listener)) {
            this.disposeListener.push(listener);
        }
    }

    removeDisposeListener(listener: DisposeListener) {
        const index = this.disposeListener.indexOf(listener);
        if (index !== -1) {
            this.disposeListener.splice(index, 1);
        }
    }

    // 调用已激活的 Command 交互回调

    private onClick(entity: T) {
        this.activatedCommand.forEach(command => {
            command.onClick(entity);
        });
    }

    // private onSelected(entity: T) {
    //     this.activatedCommand.forEach(command => {
    //         command.onSelected(entity);
    //     });
    // }

    private onHoverIn(entity: T) {
        this.activatedCommand.forEach(command => {
            command.onHoverIn(entity);
        });
    }

    private onHoverOut(entity: T) {
        this.activatedCommand.forEach(command => {
            command.onHoverOut(entity);
        });
    }

    private beforeDrag(entity: T) {
        this.activatedCommand.forEach(command => {
            command.beforeDrag(entity);
        });
    }

    private onDrag(entity: T) {
        this.activatedCommand.forEach(command => {
            command.onDrag(entity);
        });
    }

    private afterDrag(entity: T) {
        this.activatedCommand.forEach(command => {
            command.afterDrag(entity);
        });
    }

    private onMouseUp(entity: T) {
        this.activatedCommand.forEach(command => {
            command.onMouseUp(entity);
        });
    }

    private onMouseDown(entity: T) {
        this.activatedCommand.forEach(command => {
            command.onMouseDown(entity);
        });
    }

    private onMouseMove(entity: T) {
        this.activatedCommand.forEach(command => {
            command.onMouseMove(entity);
        });
    }

    private onThrottledDrag = throttleInAFrame((entity: T) => {
        this.activatedCommand.forEach(command => {
            command.onThrottledDrag(entity);
        });
    })

    private onThrottledMouseMove = throttleInAFrame((entity: T) => {
        this.activatedCommand.forEach(command => {
            command.onThrottledMouseMove(entity);
        });
    })

    /**
     * 响应场景中模型的交互事件
     * @param type 事件类型
     * @param entity 模型数据
     */
    dispatch(type: EventType, entity: T) {
        switch(type) {
            case EventType.CLICK:
                this.onClick(entity);
                break;
            case EventType.MOUSEOVER:
                this.onHoverIn(entity);
                break;
            case EventType.MOUSEOUT:
                this.onHoverOut(entity);
                break;
            case EventType.DRAGSTART:
                this.beforeDrag(entity);
                break;
            case EventType.DRAGMOVE:
                this.onDrag(entity);
                this.onThrottledDrag(entity);
                break;
            case EventType.DRAGEND:
                this.afterDrag(entity);
                break;
            case EventType.MOUSEUP:
                this.onMouseUp(entity);
                break;
            case EventType.MOUSEDOWN:
                this.onMouseDown(entity);
                break;
            case EventType.MOUSEMOVE:
                this.onMouseMove(entity);
                this.onThrottledMouseMove(entity);
                break;
            default:
                return;
        }
    }
}

// 以单例的方式导出，保证全应用只有一个实例
export const unitManager = CommandUnitManager.create();

export { CommandUnitManager };
