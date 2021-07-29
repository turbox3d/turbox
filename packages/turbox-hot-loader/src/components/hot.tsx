import * as React from 'react';
import { fail, copyStaticProperties } from '../utils/index';

const hotModules: { [id: string]: { instances: React.Component[] } } = {};

function hotModule(moduleId: string) {
  if (!hotModules[moduleId]) {
    hotModules[moduleId] = {
      instances: [],
    };
  }
  return hotModules[moduleId];
}

export function hot(sourceModule: NodeModule): <T extends Function>(Target: T) => T;
export function hot<P extends object>(sourceModule: NodeModule): (Target: React.ComponentType<P>) => React.ComponentType<P> {
  if (!sourceModule) {
    fail('`hot` was called without any argument provided');
  }
  const moduleId = sourceModule.id || sourceModule.i || sourceModule.filename;
  if (!moduleId) {
    fail('`hot` could not find the `name` of the `module` you have provided');
  }
  const newModule = hotModule(moduleId);
  if (sourceModule.hot) {
    sourceModule.hot.accept((err) => {
      fail(err.message);
    });
    sourceModule.hot.dispose((data) => {
      data.instances = newModule.instances;
      if (process.env.NODE_ENV === 'development') {
        window.$$turbox_hot = true;
      }
    });
  }
  // @hot
  return (Target) => {
    if (sourceModule.hot && sourceModule.hot.data) {
      const instances = sourceModule.hot.data.instances as React.Component[];
      instances && instances.forEach((ins) => {
        const oldTarget = Object.getPrototypeOf(ins) as React.Component;
        oldTarget.render = Target.prototype.render;
        oldTarget.componentDidMount = Target.prototype.componentDidMount;
        oldTarget.componentDidUpdate = Target.prototype.componentDidUpdate;
        oldTarget.componentDidCatch = Target.prototype.componentDidCatch;
        oldTarget.componentWillUnmount = Target.prototype.componentWillUnmount;
        oldTarget.shouldComponentUpdate = Target.prototype.shouldComponentUpdate;
        oldTarget.getSnapshotBeforeUpdate = Target.prototype.getSnapshotBeforeUpdate;
        copyStaticProperties(Target, oldTarget);
        ins.forceUpdate();
      });
    }
    class Wrapper extends React.Component<P> {
      componentDidMount() {
        newModule.instances.push(this);
      }

      componentWillUnmount() {
        newModule.instances = newModule.instances.filter(ins => ins !== this);
      }

      render() {
        return (
          <Target {...this.props as P} />
        );
      }
    }

    copyStaticProperties(Target, Wrapper);

    return Wrapper;
  };
}
