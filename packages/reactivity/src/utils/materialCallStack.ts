import { EMaterialType } from '../const/enums';
import { ctx } from '../const/config';
import { EEventName, emitter } from './event';

export interface MaterialCallStackRecord {
  type: EMaterialType;
  method: string;
  domain?: string;
  syncStackId?: number;
  stackId: number;
}

export class MaterialCallStack {
  public stack: MaterialCallStackRecord[] = [];

  public currentStack?: MaterialCallStackRecord;

  private pendingToPopStack: number[] = [];

  private stackId = 0;

  public push(item: Omit<MaterialCallStackRecord, 'stackId'>) {
    this.stackId += 1;

    const record: MaterialCallStackRecord = { ...item, stackId: this.stackId };
    this.currentStack = record;
    this.stack.push(record);
    if (ctx.devTool) {
      emitter.emit(EEventName.materialCallStackChange, {
        stack: [...this.stack],
        action: 'PUSH',
        time: Date.now(),
        currentStack: record,
      });
    }
    return this.stackId;
  }

  public pop(stackId: number) {
    if (this.stack.length === 0) {
      return;
    }
    if (this.stack[this.stack.length - 1].stackId !== stackId) {
      this.pendingToPopStack.unshift(stackId);
    } else {
      this.currentStack = undefined;
      const data = this.stack.pop();
      if (ctx.devTool) {
        emitter.emit(EEventName.materialCallStackChange, { stack: [...this.stack], action: 'POP', time: Date.now(), currentStack: data });
      }
    }
    const newPendingToPopStack = [...this.pendingToPopStack];
    for (let index = 0; index < this.pendingToPopStack.length; index += 1) {
      const id = this.pendingToPopStack[index];
      if (this.stack[this.stack.length - 1]?.stackId === id) {
        const data = this.stack.pop();
        newPendingToPopStack.splice(index, 1);
        this.currentStack = this.stack[this.stack.length - 1];
        if (ctx.devTool) {
          emitter.emit(EEventName.materialCallStackChange, { stack: [...this.stack], action: 'POP', time: Date.now(), currentStack: data });
        }
      } else {
        break;
      }
    }
    this.pendingToPopStack = newPendingToPopStack;
    if (this.pendingToPopStack.length === 0) {
      this.currentStack = undefined;
    }
  }
}

export const materialCallStack = new MaterialCallStack();
