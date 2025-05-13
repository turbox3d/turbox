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
  clickable?: boolean;
  hoverable?: boolean;
  draggable?: boolean;
  pinchable?: boolean;
  rotatable?: boolean;
  pressable?: boolean;
}

export type ComponentProps<P> = PreserveProps & Partial<ViewEntity> & P;

const dummyPreserveProps: PreserveProps & Partial<ViewEntity> = {
  key: void 0,
  children: void 0,
  onClick: void 0,
  onDBClick: void 0,
  onRightClick: void 0,
  onDragStart: void 0,
  onDragMove: void 0,
  onDragEnd: void 0,
  onPinchStart: void 0,
  onPinch: void 0,
  onPinchEnd: void 0,
  onRotateStart: void 0,
  onRotate: void 0,
  onRotateEnd: void 0,
  onPress: void 0,
  onPressUp: void 0,
  onHoverIn: void 0,
  onHoverOut: void 0,
  clickable: void 0,
  hoverable: void 0,
  draggable: void 0,
  pinchable: void 0,
  rotatable: void 0,
  pressable: void 0,
  id: void 0,
  type: void 0,
};

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

  shouldComponentInteractiveUpdate(nextProps = {} as Readonly<ComponentProps<P>>) {
    return !shallowEqual({
      clickable: this.props.clickable,
      hoverable: this.props.hoverable,
      draggable: this.props.draggable,
      pinchable: this.props.pinchable,
      rotatable: this.props.rotatable,
      pressable: this.props.pressable,
    }, {
      clickable: nextProps.clickable,
      hoverable: nextProps.hoverable,
      draggable: nextProps.draggable,
      pinchable: nextProps.pinchable,
      rotatable: nextProps.rotatable,
      pressable: nextProps.pressable,
    });
  }

  shouldComponentCustomPropsUpdate(nextProps = {} as Readonly<ComponentProps<P>>) {
    const preserveKeys = Object.keys(dummyPreserveProps);
    return !shallowEqual(this.props, nextProps, preserveKeys);
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
    const interactiveKeys = new Set(['clickable', 'hoverable', 'draggable', 'pinchable', 'rotatable', 'pressable']);
    const preserveKeys = Object.keys(dummyPreserveProps).filter(key => !interactiveKeys.has(key));
    return !shallowEqual(this.props, nextProps, preserveKeys);
  }
}
