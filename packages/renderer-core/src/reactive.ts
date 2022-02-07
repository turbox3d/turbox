import { fail, IConstructorOf } from '@turbox3d/shared';
import { store, depCollector, UNSUBSCRIBE_HANDLER } from '@turbox3d/reactivity';
import { Component } from './component';
import { IdCustomType } from './common';

export const TURBOX_PREFIX = '@@TURBOX__';
const IS_INNER = `${TURBOX_PREFIX}isInner`;

/**
 * Returns a high order component with auto refresh feature.
 */
export function Reactive<T extends Function>(arg: T): T;
export function Reactive(): <T extends Function>(Target: T) => T;
export function Reactive<P extends object>(arg?: IConstructorOf<Component<P>>) {
  const decorator = <P extends object>(Target: IConstructorOf<Component<P>>): IConstructorOf<Component<P>> => {
    // class component
    const target = Target.prototype;
    const baseRender = target.render;
    const baseComponentDidMount = target.componentDidMount;
    const baseComponentWillUnmount = target.componentWillUnmount;

    target.render = function () {
      let result: any;
      try {
        depCollector.start(this);
        result = baseRender.call(this);
        depCollector.end();
      } catch (error) {
        if (!this[IS_INNER]) {
          throw error;
        }
        return null;
      }
      return result;
    };

    target.componentDidMount = function () {
      baseComponentDidMount && baseComponentDidMount.call(this);
      if (!store) {
        fail('store is not ready, please init first.');
      }
      this[UNSUBSCRIBE_HANDLER] = store.subscribe((isInner: boolean) => {
        this[IS_INNER] = isInner;
        this.forceUpdate();
      }, this, IdCustomType);
    };

    target.componentWillUnmount = function () {
      if (this[UNSUBSCRIBE_HANDLER] !== void 0) {
        this[UNSUBSCRIBE_HANDLER]();
      }
      depCollector.clear(this);
      baseComponentWillUnmount && baseComponentWillUnmount.call(this);
    };

    return target.constructor;
  };

  if (arg === void 0) {
    // @reactive()
    return decorator;
  }
  // @reactive
  return decorator.call(null, arg);
}
