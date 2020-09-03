import * as React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { store } from '../core/store';
import { depCollector } from '../core/collector';
import { fail } from '../utils/error';
import { REACTIVE_COMPONENT_NAME, UNSUBSCRIBE_HANDLER } from '../const/symbol';

export function Reactive<P extends object>(arg: React.ComponentType<P>): React.ComponentType<P>;
export function Reactive(): <P extends object>(Target: React.ComponentType<P>) => React.ComponentType<P>;

/**
 * Returns a high order component with auto refresh feature.
 */
export function Reactive<P extends object>(arg?: React.ComponentType<P> | Function) {
  const decorator = <P extends object>(Target: React.ComponentType<P>): React.ComponentType<P> => {
    const displayName: string = Target.displayName || Target.name || '<TURBOX_COMPONENT>';
    let _this: React.Component;

    if (
      typeof Target === 'function' &&
      (!Target.prototype || !Target.prototype.render) &&
      !Target.prototype.isReactClass &&
      !React.Component.isPrototypeOf(Target)
    ) {
      // Function component do not have this context
      const ObservableTarget: React.FunctionComponent = (props: P) => {
        depCollector.start(_this);
        const fn = Target as React.FunctionComponent<P>;
        // target component don't use react.memo
        const result = fn(props);
        depCollector.end();
        return result;
      };

      class Wrapper extends React.Component<P> {
        unsubscribeHandler?: () => void;

        componentDidMount() {
          if (!store) {
            fail('store is not ready, please init first.');
          }
          this.unsubscribeHandler = store.subscribe(() => {
            this.forceUpdate();
          }, this);
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
      depCollector.start(this);
      const result = baseRender.call(this);
      depCollector.end();
      return result;
    };

    target.componentDidMount = function () {
      baseComponentDidMount && baseComponentDidMount.call(this);
      if (!store) {
        fail('store is not ready, please init first.');
      }
      this[UNSUBSCRIBE_HANDLER] = store.subscribe(() => {
        this.forceUpdate();
      }, this);
    }

    target.componentWillUnmount = function () {
      if (this[UNSUBSCRIBE_HANDLER] !== void 0) {
        this[UNSUBSCRIBE_HANDLER]();
      }
      depCollector.clear(this);
      baseComponentWillUnmount && baseComponentWillUnmount.call(this);
    }

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

// based on https://github.com/mridgway/hoist-non-react-statics/blob/master/src/index.js
const hoistBlackList: any = {
  $$typeof: true,
  render: true,
  compare: true,
  type: true,
};

function copyStaticProperties(base: any, target: any) {
  const keys = Object.keys(base);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (hoistBlackList[key] === void 0) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(base, key)!);
    }
  }
}
