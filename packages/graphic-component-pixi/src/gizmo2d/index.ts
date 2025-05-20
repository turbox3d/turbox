import { SceneEvent, ViewEntity } from '@turbox3d/event-manager';
import { SceneTool } from '@turbox3d/command-manager';
import { Mesh2D, g } from '@turbox3d/renderer-pixi';
import Rect2d from '../rect2d';
import Image2d from '../image2d';

interface IGizmo2dProps {
  x?: number;
  y?: number;
  width: number;
  height: number;
  rotation?: number;
  central?: boolean;
  zIndex?: number;
  color?: number;
  deleteIcon?: string;
  deleteIconSize?: number;
  copyIcon?: string;
  copyIconSize?: number;
  adjustIcon?: string;
  adjustIconSize?: number;
  stretchRectSize?: number;
  stretchHandler?: (
    actionKey: 'x-left' | 'x-right' | 'y-top' | 'y-bottom',
    op: 'start' | 'move' | 'end',
    viewEntity: Partial<ViewEntity>,
    event: SceneEvent<any>,
    tools: SceneTool,
  ) => void;
  deleteHandler?: () => void;
  copyHandler?: () => void;
  adjustHandler?: (
    op: 'start' | 'move' | 'end',
    viewEntity: Partial<ViewEntity>,
    event: SceneEvent<any>,
    tools: SceneTool
  ) => void;
}

enum StretchKey {
  X_LEFT = 'x-left',
  X_RIGHT = 'x-right',
  Y_TOP = 'y-top',
  Y_BOTTOM = 'y-bottom',
}

export default class Gizmo2d extends Mesh2D<IGizmo2dProps> {
  deleteHandler = () => {
    this.props.deleteHandler && this.props.deleteHandler();
  }

  copyHandler = () => {
    this.props.copyHandler && this.props.copyHandler();
  }

  dragHandler = (op: 'start' | 'move' | 'end') => (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
    this.props.adjustHandler && this.props.adjustHandler(op, viewEntity, event, tools);
  }

  stretchHandler = (actionKey: 'x-left' | 'x-right' | 'y-top' | 'y-bottom', op: 'start' | 'move' | 'end') => (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
    this.props.stretchHandler && this.props.stretchHandler(actionKey, op, viewEntity, event, tools);
  }

  render() {
    const {
      x = 0,
      y = 0,
      width,
      height,
      rotation = 0,
      central = false,
      zIndex = 1000,
      color = 0xffffff,
      deleteIcon = '',
      copyIcon = '',
      adjustIcon = '',
      deleteIconSize = 10,
      copyIconSize = 10,
      adjustIconSize = 10,
      stretchRectSize = 8,
    } = this.props;
    const [posX, posY] = central ? [-width / 2, -height / 2] : [0, 0];
    this.view.zIndex = zIndex;
    this.view.position.set(x, y);
    this.view.rotation = rotation;

    return [
      g(Rect2d, {
        key: 'wireframe',
        x: posX,
        y: posY,
        width,
        height,
        central: false,
        lineWidth: 1,
        lineColor: color,
        fillAlpha: 0,
        alignment: 1,
      }),
      g(Rect2d, {
        key: StretchKey.X_LEFT,
        draggable: true,
        x: posX,
        y: posY + height / 2,
        width: stretchRectSize,
        height: stretchRectSize,
        central: true,
        lineWidth: 1,
        lineColor: color,
        fillColor: 0xffffff,
        fillAlpha: 0.01,
        alignment: 1,
        onDragStart: this.stretchHandler(StretchKey.X_LEFT, 'start'),
        onDragMove: this.stretchHandler(StretchKey.X_LEFT, 'move'),
        onDragEnd: this.stretchHandler(StretchKey.X_LEFT, 'end'),
      }),
      g(Rect2d, {
        key: StretchKey.X_RIGHT,
        draggable: true,
        x: posX + width,
        y: posY + height / 2,
        width: stretchRectSize,
        height: stretchRectSize,
        central: true,
        lineWidth: 1,
        lineColor: color,
        fillColor: 0xffffff,
        fillAlpha: 0.01,
        alignment: 1,
        onDragStart: this.stretchHandler(StretchKey.X_RIGHT, 'start'),
        onDragMove: this.stretchHandler(StretchKey.X_RIGHT, 'move'),
        onDragEnd: this.stretchHandler(StretchKey.X_RIGHT, 'end'),
      }),
      g(Rect2d, {
        key: StretchKey.Y_TOP,
        draggable: true,
        x: posX + width / 2,
        y: posY,
        width: stretchRectSize,
        height: stretchRectSize,
        central: true,
        lineWidth: 1,
        lineColor: color,
        fillColor: 0xffffff,
        fillAlpha: 0.01,
        alignment: 1,
        onDragStart: this.stretchHandler(StretchKey.Y_TOP, 'start'),
        onDragMove: this.stretchHandler(StretchKey.Y_TOP, 'move'),
        onDragEnd: this.stretchHandler(StretchKey.Y_TOP, 'end'),
      }),
      g(Rect2d, {
        key: StretchKey.Y_BOTTOM,
        draggable: true,
        x: posX + width / 2,
        y: posY + height,
        width: stretchRectSize,
        height: stretchRectSize,
        central: true,
        lineWidth: 1,
        lineColor: color,
        fillColor: 0xffffff,
        fillAlpha: 0.01,
        alignment: 1,
        onDragStart: this.stretchHandler(StretchKey.Y_BOTTOM, 'start'),
        onDragMove: this.stretchHandler(StretchKey.Y_BOTTOM, 'move'),
        onDragEnd: this.stretchHandler(StretchKey.Y_BOTTOM, 'end'),
      }),
      g(Image2d, {
        key: 'delete',
        clickable: true,
        x: posX,
        y: posY,
        central: true,
        width: deleteIconSize,
        height: deleteIconSize,
        radius: deleteIconSize / 2,
        lineWidth: 2,
        lineColor: color,
        fillColor: color,
        fillAlpha: 1,
        fit: 'cover',
        backgroundImage: deleteIcon,
        onClick: this.deleteHandler,
      }),
      g(Image2d, {
        key: 'copy',
        clickable: true,
        x: posX + width,
        y: posY,
        central: true,
        width: copyIconSize,
        height: copyIconSize,
        radius: copyIconSize / 2,
        lineWidth: 2,
        lineColor: color,
        fillColor: color,
        fillAlpha: 1,
        fit: 'cover',
        backgroundImage: copyIcon,
        onClick: this.copyHandler,
      }),
      g(Image2d, {
        key: 'adjust',
        draggable: true,
        x: central ? width / 2 : width,
        y: central ? height / 2 : height,
        central: true,
        width: adjustIconSize,
        height: adjustIconSize,
        radius: adjustIconSize / 2,
        lineWidth: 2,
        lineColor: color,
        fillColor: color,
        fillAlpha: 1,
        fit: 'cover',
        backgroundImage: adjustIcon,
        onDragStart: this.dragHandler('start'),
        onDragMove: this.dragHandler('move'),
        onDragEnd: this.dragHandler('end'),
      }),
    ];
  }
}
