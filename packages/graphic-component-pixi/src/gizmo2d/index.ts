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

export default class Gizmo2d extends Mesh2D<IGizmo2dProps> {
  render() {
    const {
      x = 0,
      y = 0,
      width,
      height,
      rotation = 0,
      central = false,
      zIndex = 1000,
      stretchHandler,
      deleteHandler,
      copyHandler,
      adjustHandler,
      color = 0xffffff,
      deleteIcon = '',
      copyIcon = '',
      adjustIcon = '',
      deleteIconSize = 10,
      copyIconSize = 10,
      adjustIconSize = 10,
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
        key: 'x-left',
        draggable: true,
        x: posX,
        y: posY + height / 2,
        width: 10,
        height: 10,
        central: true,
        lineWidth: 1,
        lineColor: color,
        fillColor: 0xffffff,
        fillAlpha: 0.01,
        alignment: 1,
        onDragStart: (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
          stretchHandler && stretchHandler('x-left', 'start', viewEntity, event, tools);
        },
        onDragMove: (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
          stretchHandler && stretchHandler('x-left', 'move', viewEntity, event, tools);
        },
        onDragEnd: (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
          stretchHandler && stretchHandler('x-left', 'end', viewEntity, event, tools);
        },
      }),
      g(Rect2d, {
        key: 'x-right',
        draggable: true,
        x: posX + width,
        y: posY + height / 2,
        width: 10,
        height: 10,
        central: true,
        lineWidth: 1,
        lineColor: color,
        fillColor: 0xffffff,
        fillAlpha: 0.01,
        alignment: 1,
        onDragStart: (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
          stretchHandler && stretchHandler('x-right', 'start', viewEntity, event, tools);
        },
        onDragMove: (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
          stretchHandler && stretchHandler('x-right', 'move', viewEntity, event, tools);
        },
        onDragEnd: (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
          stretchHandler && stretchHandler('x-right', 'end', viewEntity, event, tools);
        },
      }),
      g(Rect2d, {
        key: 'y-top',
        draggable: true,
        x: posX + width / 2,
        y: posY,
        width: 10,
        height: 10,
        central: true,
        lineWidth: 1,
        lineColor: color,
        fillColor: 0xffffff,
        fillAlpha: 0.01,
        alignment: 1,
        onDragStart: (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
          stretchHandler && stretchHandler('y-top', 'start', viewEntity, event, tools);
        },
        onDragMove: (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
          stretchHandler && stretchHandler('y-top', 'move', viewEntity, event, tools);
        },
        onDragEnd: (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
          stretchHandler && stretchHandler('y-top', 'end', viewEntity, event, tools);
        },
      }),
      g(Rect2d, {
        key: 'y-bottom',
        draggable: true,
        x: posX + width / 2,
        y: posY + height,
        width: 10,
        height: 10,
        central: true,
        lineWidth: 1,
        lineColor: color,
        fillColor: 0xffffff,
        fillAlpha: 0.01,
        alignment: 1,
        onDragStart: (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
          stretchHandler && stretchHandler('y-bottom', 'start', viewEntity, event, tools);
        },
        onDragMove: (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
          stretchHandler && stretchHandler('y-bottom', 'move', viewEntity, event, tools);
        },
        onDragEnd: (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
          stretchHandler && stretchHandler('y-bottom', 'end', viewEntity, event, tools);
        },
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
        onClick: () => {
          deleteHandler && deleteHandler();
        },
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
        onClick: () => {
          copyHandler && copyHandler();
        },
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
        onDragStart: (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
          adjustHandler && adjustHandler('start', viewEntity, event, tools);
        },
        onDragMove: (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
          adjustHandler && adjustHandler('move', viewEntity, event, tools);
        },
        onDragEnd: (viewEntity: Partial<ViewEntity>, event: SceneEvent<any>, tools: SceneTool) => {
          adjustHandler && adjustHandler('end', viewEntity, event, tools);
        },
      }),
    ];
  }
}
