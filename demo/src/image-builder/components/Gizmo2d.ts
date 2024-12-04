import { Mesh2D, g, Rect2d, Container2d, ViewEntity, SceneEvent, SceneTool } from '@turbox3d/turbox';

import { PRIMARY_COLOR } from '../common/consts/color';

interface IProps {
  x?: number;
  y?: number;
  width: number;
  height: number;
  rotation?: number;
  central?: boolean;
  zIndex?: number;
  deleteHandler?: () => void;
  adjustHandler?: (
    op: 'start' | 'move' | 'end',
    viewEntity: Partial<ViewEntity>,
    event: SceneEvent<any>,
    tools: SceneTool
  ) => void;
}

export class Gizmo2d extends Mesh2D<IProps> {
  render() {
    const { x = 0, y = 0, width, height, rotation = 0, central = true, zIndex = 1000, deleteHandler, adjustHandler } = this.props;
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
        lineColor: PRIMARY_COLOR,
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
        lineColor: PRIMARY_COLOR,
        fillColor: PRIMARY_COLOR,
        fit: 'contain',
        backgroundImage: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/delete.svg',
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
        lineColor: PRIMARY_COLOR,
        fillColor: PRIMARY_COLOR,
        fit: 'contain',
        backgroundImage: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/adjust2.svg',
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
