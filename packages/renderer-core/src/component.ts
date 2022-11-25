import { ViewEntity, SceneEvent } from '@turbox3d/event-manager';
import { shallowEqual } from '@turbox3d/shared';
import { SceneTool } from '@turbox3d/command-manager';
import { Element, VirtualNode } from './render';
import { getSceneParent } from './utils';
import { SceneContext } from './scene';

export interface PreserveProps {
  key?: string | number;
  children?: Element<any>[];
  onClick?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
  onDBClick?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
  onRightClick?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
  onDragStart?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
  onDragMove?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
  onDragEnd?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
  onPinchStart?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
  onPinch?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
  onPinchEnd?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
  onRotateStart?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
  onRotate?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
  onRotateEnd?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
  onPress?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
  onPressUp?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
  onHoverIn?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
  onHoverOut?: (viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) => void;
}

export type ComponentProps<P> = PreserveProps & Partial<ViewEntity> & P;

/**
 * graphic render component
 */
export class Component<P extends object = {}> {
  props: ComponentProps<P>;
  _vNode: VirtualNode;

  get context(): SceneContext {
    const scene = getSceneParent(this);
    if (scene) {
      return ((scene as any).sceneContext || {}) as SceneContext;
    }
    return {} as SceneContext;
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

export class PureComponent<P extends object = {}> extends Component<P> {
  shouldComponentUpdate(nextProps: Readonly<ComponentProps<P>>) {
    return !shallowEqual(this.props, nextProps);
  }
}
