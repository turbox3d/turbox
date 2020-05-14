import * as React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { store } from '../core/store';
import { depCollector } from '../core/collector';

export function Reactive<P extends object>(arg: React.ComponentType<P>): React.ComponentType<P>;
export function Reactive(): <P extends object>(Target: React.ComponentType<P>) => React.ComponentType<P>;

/**
 * Returns a high order component with auto refresh feature.
 */
export function Reactive<P extends object>(arg?: React.ComponentType<P> | Function) {
  const decorator = <P extends object>(Target: React.ComponentType<P>): React.ComponentType<P> => {
    // const displayName: string = Target.displayName || Target.name || '<TURBOX_COMPONENT>';
    let _this: React.Component;
    // Function component do not have this context
    const ObservableTarget: React.FunctionComponent = (props: P) => {
      depCollector.start(_this);
      const fn = Target as React.FunctionComponent<P>;
      // target component don't use react.memo
      const result = fn(props);
      depCollector.end();
      return result;
    };

    if (
      typeof Target === 'function' &&
      (!Target.prototype || !Target.prototype.render) &&
      !Target.prototype.isReactClass &&
      !React.Component.isPrototypeOf(Target)
    ) {
      class Wrapper extends React.PureComponent<P> {
        unsubscribeHandler?: () => void;

        componentDidMount() {
          this.unsubscribeHandler = store.subscribe(() => {
            this.forceUpdate();
          }, _this);
        }

        componentWillUnmount() {
          if (this.unsubscribeHandler !== void 0) {
            this.unsubscribeHandler();
          }
        }

        render() {
          return (
            <ErrorBoundary>
              <ObservableTarget {...this.props as P} />
            </ErrorBoundary>
          )
        }
      }

      const baseRender = Wrapper.prototype.render;

      Wrapper.prototype.render = function () {
        _this = this;
        return baseRender.call(this);
      }

      copyStaticProperties(Target, Wrapper);

      return Wrapper;
    }

    // class component
    const target = Target.prototype || Target;
    const baseRender = target.render;
    let callback: () => void;

    function refreshChildComponentView() {
      return () => React.Component.prototype.forceUpdate.call(this);
    }

    target.render = function () {
      _this = this;
      callback = refreshChildComponentView.call(this);
      depCollector.start(this);
      const result = baseRender.call(this);
      depCollector.end();
      return result;
    }

    class ObservableTargetComponent extends React.PureComponent<P> {
      unsubscribeHandler?: () => void;

      componentDidMount() {
        this.unsubscribeHandler = store.subscribe(() => {
          callback();
        }, _this);
      }

      componentWillUnmount() {
        if (this.unsubscribeHandler !== void 0) {
          this.unsubscribeHandler();
        }
      }

      render() {
        return (
          <ErrorBoundary>
            <Target {...this.props as P} />
          </ErrorBoundary>
        )
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
  type: true
}

function copyStaticProperties(base: any, target: any) {
  const keys = Object.keys(base);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (hoistBlackList[key] === void 0) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(base, key)!)
    }
  }
}
