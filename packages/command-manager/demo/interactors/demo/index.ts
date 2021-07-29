import { Inject, Injectable, InjectCommandUnit } from "../ioc";
/**
 * 新 Command 应用举例
 */

import { CommandUnit, CommandUnitManager, DistributeCommandUnit, SequenceCommandUnit } from "../structure";

const manager = CommandUnitManager.create();

// 视图层

class ReactView {
    // @Inject() moveCommand: MoveCommandProxy;
    @InjectCommandUnit(manager) moveCommand: MoveCommand;

    @InjectCommandUnit(manager) addProduct: AddProductCommand;

    @InjectCommandUnit(manager) moveFrameCommand: MoveFrameCommand;

    render() {
        // ...
    }

    onClick() {
        this.moveCommand.active();
    }
}

// Command 层

/**
 * 业务类似，但是实现有差距时，推荐实现多个 Command 保持业务内聚
 */
@Injectable()
class MoveFrameCommand extends CommandUnit {
    beforeDrag(entityId: string) {
        // ...
    }

    onDrag(entityId: string) {
        // ...
    }

    afterDrag(entity: string) {
        // ...
    }
}

@Injectable()
class MoveBoardCommand extends CommandUnit {
    beforeDrag(entityId: string) {
        // ...
    }

    onDrag(entityId: string) {
        // ...
    }

    afterDrag(entity: string) {
        // ...
    }
}

/**
 * Command 之上可实现一个代理层
 */
@Injectable()
class MoveCommand extends DistributeCommandUnit {
    @InjectCommandUnit(manager) frame: MoveFrameCommand;
    @InjectCommandUnit(manager) board: MoveBoardCommand;

    onActive(param: any) {
        switch(param.type) {
            case 'frame':
                return {
                    unit: this.frame,
                    transformParam: function(param) {
                        // ...
                    }
                };
            case 'borad':
                return {
                    unit: this.board,
                }
            default:
                return {
                    unit: this.frame,
                    transformParam: function(param) {
                        // ...
                    }
                };
        }
    } 
}

@Injectable()
class AddProductCommand extends SequenceCommandUnit {
    @InjectCommandUnit(manager) add: MoveFrameCommand;
    @InjectCommandUnit(manager) move: MoveBoardCommand;

    onActive(param: any) {
        return [
            {
                unit: this.add,
                transformParam(param: any) {
                    // ...
                }
            },
            {
                unit: this.move,
                transformParam(lastResult: any, param: any) {
                    // ...
                }
            }
        ]
    }
}
