import { shallowEqual } from '@turbox3d/shared';
import { Element, VirtualNode } from './render';
import { getSceneParent } from './utils';
import { SceneContext } from './scene';

/**
 * graphic render component
 */
export class Component<P = {}> {
  props: P;
  _vNode: VirtualNode;

  get context() {
    const scene = getSceneParent(this);
    if (scene) {
      return scene.sceneContext || ({} as SceneContext<any>);
    }
    return {} as SceneContext<any>;
  }

  constructor(props = {} as P) {
    this.props = props;
  }

  forceUpdate() {
    this._vNode.update(true);
  }

  shouldComponentUpdate(nextProps: Readonly<P> = {} as Readonly<P>) {
    return true;
  }

  componentWillMount(): void | Promise<void> {
    //
  }

  componentWillUpdate(nextProps: Readonly<P> = {} as Readonly<P>): void | Promise<void> {
    //
  }

  render(): Element<P>[] | null {
    return (this.props as any).children || null;
  }

  componentDidMount(): void | Promise<void> {
    //
  }

  componentDidUpdate(prevProps: Readonly<P>): void | Promise<void> {
    //
  }

  componentWillUnmount(): void | Promise<void> {
    //
  }
}

export class PureComponent<P = {}> extends Component<P> {
  shouldComponentUpdate(nextProps: Readonly<P>) {
    return !shallowEqual(this.props, nextProps);
  }
}
