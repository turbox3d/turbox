import * as PIXI from 'pixi.js';

import { Reactive, Component, g, Axis2d, Text2d, Container2d, Image2d, Rect2d, MathUtils, Line2d, Grid2d, Gizmo2d, Box2 } from '@turbox3d/turbox';

import { FrameEntity } from '../../models/entity/frame';
import { ItemEntity } from '../../models/entity/item';

import { FrameViewEntity } from './frame/index';
import { ItemViewEntity } from './item/index';
import { imageBuilderStore } from '../../models/index';
import { appCommandManager } from '../../commands';
import { RenderOrder } from '../../common/consts/scene';
import { GRAY, PRIMARY_COLOR, RED } from '../../common/consts/color';

@Reactive
export class World extends Component {
  render() {
    const selected = appCommandManager.defaultCommand.select.getSelectedEntities()[0];
    const hinted = appCommandManager.defaultCommand.hint.getHintedEntity();
    const frames = imageBuilderStore.document.getFrameEntities();
    const items = imageBuilderStore.document.getItemEntities();
    const showInvalidRangeFrame = imageBuilderStore.scene.isShowInvalidRangeFrame();

    return [
      g(Axis2d),
      g(Grid2d, {
        gridWidth: 250000,
        cellSize: 50,
        lineColor: GRAY,
        zIndex: RenderOrder.GRID,
      }),
      // g(Container2d, {
      //   position: { x: 100, y: 100 },
      //   width: 600,
      //   height: 400,
      //   central: false,
      //   lineWidth: 5,
      //   lineColor: 0x000,
      //   fillColor: 0xff00ff,
      //   backgroundImage: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/bg_rotate.jpeg',
      //   children: [
      //     g(Text2d, {
      //       text: 'hello world',
      //       key: 1,
      //       style: new PIXI.TextStyle({
      //         fontSize: 20,
      //         fontFamily: 'cursive',
      //       }),
      //       margin: '50,0,0,10',
      //     }),
      //     g(Text2d, {
      //       text: 'hello world2',
      //       key: 2,
      //       style: new PIXI.TextStyle({
      //         fontSize: 30,
      //         fontFamily: 'Arial',
      //       }),
      //       margin: '50,0,0,10',
      //     }),
      //     g(Image2d, {
      //       width: 200,
      //       height: 200,
      //       backgroundImage: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/bg_rotate.jpeg',
      //       margin: '10,0,0,20',
      //     }),
      //   ],
      // }),
      ...frames.map(m =>
        g(FrameViewEntity, {
          key: m.id,
          model: m as FrameEntity,
        })
      ),
      ...items.map(m =>
        g(ItemViewEntity, {
          key: m.id,
          model: m as ItemEntity,
        })
      ),
      hinted &&
        g(Rect2d, {
          key: 'wireframe',
          width: hinted.size.x,
          height: hinted.size.y,
          x: hinted.position.x,
          y: hinted.position.y,
          rotation: hinted.rotation.z * MathUtils.DEG2RAD,
          zIndex: RenderOrder.GIZMO,
          central: true,
          lineWidth: 1,
          lineColor: PRIMARY_COLOR,
          fillAlpha: 0,
          alignment: 1,
        }),
      selected &&
        g(Gizmo2d, {
          key: 'gizmo2d',
          width: selected.size.x,
          height: selected.size.y,
          x: selected.position.x,
          y: selected.position.y,
          rotation: selected.rotation.z * MathUtils.DEG2RAD,
          zIndex: RenderOrder.GIZMO,
          color: PRIMARY_COLOR,
          deleteIcon: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/delete.svg',
          deleteIconSize: 18,
          adjustIcon: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/adjust2.svg',
          adjustIconSize: 18,
          deleteHandler: () => {
            appCommandManager.actionsCommand.deleteEntity([selected]);
          },
          adjustHandler: (op, v, e, t) => {
            if (op === 'start') {
              appCommandManager.actionsCommand.adjust.onAdjustStartHandler(v, e, t);
            } else if (op === 'move') {
              appCommandManager.actionsCommand.adjust.onAdjustMoveHandler(v, e, t);
            } else {
              appCommandManager.actionsCommand.adjust.onAdjustEndHandler(v, e, t);
            }
          },
          xLeftHandler: (op, v, e, t) => {
            if (op ==='start') {
              appCommandManager.actionsCommand.adjust.onXLeftStartHandler(v, e, t);
            } else if (op ==='move') {
              appCommandManager.actionsCommand.adjust.onXLeftMoveHandler(v, e, t);
            } else {
              appCommandManager.actionsCommand.adjust.onXLeftEndHandler(v, e, t);
            }
          },
          xRightHandler: (op, v, e, t) => {
            if (op ==='start') {
              appCommandManager.actionsCommand.adjust.onXRightStartHandler(v, e, t);
            } else if (op ==='move') {
              appCommandManager.actionsCommand.adjust.onXRightMoveHandler(v, e, t);
            } else {
              appCommandManager.actionsCommand.adjust.onXRightEndHandler(v, e, t);
            }
          }
        }),
      ...imageBuilderStore.scene.snapLines.map((sl, index) => g(Line2d, {
        key: `snapLine-${index}`,
        start: sl[0],
        end: sl[1],
        lineWidth: 1,
        lineColor: RED,
      })),
      showInvalidRangeFrame &&
        g(Rect2d, {
          key: 'range-wireframe',
          width: frames[0].size.x,
          height: frames[0].size.y,
          x: frames[0].position.x,
          y: frames[0].position.y,
          rotation: frames[0].rotation.z * MathUtils.DEG2RAD,
          zIndex: RenderOrder.GIZMO,
          central: true,
          lineWidth: 1,
          lineColor: RED,
          fillAlpha: 0,
          alignment: 1,
        }),
    ];
  }
}
