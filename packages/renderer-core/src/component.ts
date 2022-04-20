import { IViewEntity } from '@turbox3d/event-manager';
import { shallowEqual } from '@turbox3d/shared';
import { Element, VirtualNode } from './render';
import { getSceneParent } from './utils';
import { SceneContext } from './scene';

export interface PreserveProps {
  key?: string | number;
  children?: Element<any>[];
}

export type ComponentProps<P> = PreserveProps & Partial<IViewEntity> & P;

/**
 * graphic render component
 */
export class Component<P = {}> {
  props: ComponentProps<P>;
  _vNode: VirtualNode;

  get context() {
    const scene = getSceneParent(this);
    if (scene) {
      return scene.sceneContext || ({} as SceneContext<any>);
    }
    return {} as SceneContext<any>;
  }

  constructor(props = {} as ComponentProps<P>) {
    this.props = props;
  }

  forceUpdate() {
    this._vNode.update(true);
  }

  shouldComponentUpdate(nextProps = {} as Readonly<ComponentProps<P>>) {
    return true;
  }

  componentWillMount(): void | Promise<void> {
    //
  }

  componentWillUpdate(nextProps = {} as Readonly<ComponentProps<P>>): void | Promise<void> {
    //
  }

  render() {
    return this.props.children || null;
  }

  componentDidMount(): void | Promise<void> {
    //
  }

  componentDidUpdate(prevProps: Readonly<ComponentProps<P>>): void | Promise<void> {
    //
  }

  componentWillUnmount(): void | Promise<void> {
    //
  }
}

export class PureComponent<P = {}> extends Component<P> {
  shouldComponentUpdate(nextProps: Readonly<ComponentProps<P>>) {
    return !shallowEqual(this.props, nextProps);
  }
}
