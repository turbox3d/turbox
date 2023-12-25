import { fail } from '@turbox3d/shared';
import { ctx } from '../const/config';
import { ECollectType } from '../const/enums';
import { KeyPathType } from '../core/domain';
import { MaterialCallStackRecord } from './materialCallStack';

export enum EEventName {
  storeOnActive = 'storeOnActive',
  beforeStoreChange = 'beforeStoreChange',
  afterStoreChange = 'afterStoreChange',
  asyncAfterStoreChange = 'asyncAfterStoreChange',
  setProperty = 'setProperty',
  materialCallStackChange = 'materialCallStackChange',
}
export interface SetPropertyEvent {
  stackId?: number;
  domain: string;
  keyPath: Array<{ type: KeyPathType; value: string }>;
  newValue: any;
  oldValue: any;
  time: number;
  type: ECollectType;
}
export interface BeforeStoreChangeEvent {
  domain?: string;
  method: string;
  args: any[];
  state: any;
  time: number;
  stackId?: number;
}
export interface AfterStoreChangeEvent {
  domain?: string;
  method: string;
  args: any[];
  state: any;
  async: boolean;
  time: number;
  stackId?: number;
}
export interface MaterialCallStackChangeEvent {
  stack: MaterialCallStackRecord[];
  action: 'POP' | 'PUSH';
  time: number;
  currentStack?: MaterialCallStackRecord;
}

class Emitter {
  private listeners = {};

  on(eventName: EEventName.storeOnActive, callback: () => void): void;
  on(eventName: EEventName.setProperty, callback: (event: SetPropertyEvent) => void): void;
  on(eventName: EEventName.beforeStoreChange, callback: (event: BeforeStoreChangeEvent) => void): void;
  on(eventName: EEventName.afterStoreChange, callback: (event: AfterStoreChangeEvent) => void): void;
  on(eventName: EEventName.asyncAfterStoreChange, callback: (event: AfterStoreChangeEvent) => void): void;
  on(eventName: EEventName.materialCallStackChange, callback: (event: MaterialCallStackChangeEvent) => void): void;
  on(eventName: EEventName, callback: (...args: any[]) => void) {
    const listeners = this.listeners[eventName] || [];
    listeners.push(callback);
    this.listeners[eventName] = listeners;
  }

  emit(eventName: EEventName.storeOnActive): void;
  emit(eventName: EEventName.setProperty, args: SetPropertyEvent): void;
  emit(eventName: EEventName.beforeStoreChange, args: BeforeStoreChangeEvent): void;
  emit(eventName: EEventName.afterStoreChange, args: AfterStoreChangeEvent): void;
  emit(eventName: EEventName.asyncAfterStoreChange, args: AfterStoreChangeEvent): void;
  emit(eventName: EEventName.materialCallStackChange, args: MaterialCallStackChangeEvent): void;
  emit(eventName: EEventName, args?: any): void {
    if (ctx.devTool && window && (window as any).__TURBOX_DEVTOOL_GLOBAL_HOOKS__) {
      (window as any).__TURBOX_DEVTOOL_GLOBAL_HOOKS__.emit(eventName, args);
    }

    const listeners = this.listeners[eventName];
    if (!Array.isArray(listeners)) return;
    listeners.forEach(callback => {
      try {
        callback.apply(this, [args]);
      } catch (e) {
        fail(e);
      }
    });
  }

  off(eventName: EEventName) {
    if (!this.listeners[eventName]) {
      return;
    }
    this.listeners[eventName] = [];
  }
}

export const emitter = new Emitter();
