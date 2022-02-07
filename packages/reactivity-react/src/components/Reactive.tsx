import { fail } from '@turbox3d/shared';
import { store, depCollector, REACTIVE_COMPONENT_NAME, UNSUBSCRIBE_HANDLER } from '@turbox3d/reactivity';
import * as React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { copyStaticProperties, IdCustomType } from '../utils/index';

export const TURBOX_PREFIX = '@@TURBOX__';
const IS_INNER = `${TURBOX_PREFIX}isInner`;

/**
 * Returns a high order component with auto refresh feature.
 */
export function Reactive<T extends Function>(arg: T): T;
export function Reactive(): <T extends Function>(Target: T) => T;
export function Reactive<P extends object>(arg?: React.ComponentType<P> | Function) {
  const decorator = <P extends object>(Target: React.ComponentType<P>): React.ComponentType<P> => {
    const displayName: string = Target.displayName || Target.name || '<TURBOX_COMPONENT>';
    let _this: React.Component;

    if (
      typeof Target === 'function' &&
      (!Target.prototype || !Target.prototype.render) &&
      (!Target.prototype || !Target.prototype.isReactClass) &&
      !React.Component.isPrototypeOf(Target)
    ) {
      // Function component do not have this context
      const ObservableTarget: React.FunctionComponent = (props: P) => {
        let result: any;
        try {
          depCollector.start(_this);
          const fn = Target as React.FunctionComponent<P>;
          // target component don't use react.memo
          result = fn(props);
          depCollector.end();
        } catch (error) {
          if (!_this[IS_INNER]) {
            throw error;
          }
          return null;
        }
        return result;
      };

      class Wrapper extends React.Component<P> {
        unsubscribeHandler?: () => void;

        componentDidMount() {
          if (!store) {
            fail('store is not ready, please init first.');
          }
          this.unsubscribeHandler = store.subscribe((isInner: boolean) => {
            _this[IS_INNER] = isInner;
            this.forceUpdate();
          }, this, IdCustomType);
        }

        componentWillUnmount() {
          if (this.unsubscribeHandler !== void 0) {
            this.unsubscribeHandler();
          }
          depCollector.clear(this);
        }

        render() {
          _this = this;
          _this[REACTIVE_COMPONENT_NAME] = displayName;
          return (
            <ErrorBoundary>
              <ObservableTarget {...this.props as P} />
            </ErrorBoundary>
          );
        }
      }

      copyStaticProperties(Target, Wrapper);

      return Wrapper;
    }

    // class component
    const target = Target.prototype || Target;
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

    class ObservableTargetComponent extends React.Component<P> {
      render() {
        return (
          <ErrorBoundary>
            <Target {...this.props as P} />
          </ErrorBoundary>
        );
      }
    }

    copyStaticProperties(Target, ObservableTargetComponent);

    return ObservableTargetComponent;
  };

  if (arg === void 0) {
    // @reactive()
    return decorator;
  }
  // @reactive
  return decorator.call(null, arg);
}
