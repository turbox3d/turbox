import { SceneEvent, ViewEntity } from '@turbox3d/event-manager';
import { SceneTool } from '@turbox3d/command-manager';
import { Mesh2D, g } from '@turbox3d/renderer-pixi';
import Rect2d from '../rect2d';
import Container2d from '../container2d';

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
  adjustIcon?: string;
  deleteHandler?: () => void;
  adjustHandler?: (
    op: 'start' | 'move' | 'end',
    viewEntity: Partial<ViewEntity>,
    event: SceneEvent<any>,
    tools: SceneTool
  ) => void;
}

export default class Gizmo2d extends Mesh2D<IGizmo2dProps> {
  render() {
    const { x = 0, y = 0, width, height, rotation = 0, central = true, zIndex = 1000, deleteHandler, adjustHandler, color = 0xffffff, deleteIcon = '', adjustIcon = '' } = this.props;
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
      g(Container2d, {
        key: 'delete',
        clickable: true,
        x: posX,
        y: posY,
        central: true,
        width: 20,
        height: 20,
        radius: 10,
        lineWidth: 2,
        lineColor: color,
        fillColor: color,
        fit: 'contain',
        backgroundImage: deleteIcon,
        onClick: () => {
          deleteHandler && deleteHandler();
        },
      }),
      g(Container2d, {
        key: 'adjust',
        draggable: true,
        x: central ? width / 2 : width,
        y: central ? height / 2 : height,
        central: true,
        width: 20,
        height: 20,
        radius: 10,
        lineWidth: 2,
        lineColor: color,
        fillColor: color,
        fit: 'contain',
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
