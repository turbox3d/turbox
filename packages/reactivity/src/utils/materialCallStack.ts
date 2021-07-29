import { EMaterialType } from '../const/enums';
import { ctx } from '../const/config';
import { EEventName, emitter } from './event';

export interface MaterialCallStackRecord {
  type: EMaterialType;
  method: string;
  domain?: string;
  beforeState?: any;
  afterState?: any;
  stackId: number;
}

export class MaterialCallStack {
  public stack: MaterialCallStackRecord[] = [];

  private stackId = 0;

  public push(item: Omit<MaterialCallStackRecord, 'stackId'>) {
    this.stackId += 1;

    const record: MaterialCallStackRecord = { ...item, stackId: this.stackId };
    this.stack.push(record);
    if (ctx.devTool) {
      emitter.emit(EEventName.materialCallStackChange, {
        stack: this.stack,
        action: 'PUSH',
        time: Date.now(),
        currentStack: record,
      });
    }

    return this.stackId;
  }

  public pop() {
    const data = this.stack.pop();
    if (ctx.devTool) {
      emitter.emit(EEventName.materialCallStackChange, { stack: this.stack, action: 'POP', time: Date.now(), currentStack: data });
    }
  }
}

export const materialCallStack = new MaterialCallStack();
