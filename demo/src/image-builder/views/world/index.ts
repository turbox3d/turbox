import { Reactive, Component, g, Axis2d, Rect2d, MathUtils, Line2d, Grid2d, Gizmo2d } from '@turbox3d/turbox';

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
    const selected = appCommandManager.default.select.getSelectedEntities()[0];
    const hinted = appCommandManager.default.hint.getHintedEntity();
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
      // g(Image2d, {
      //   x: 0,
      //   y: 0,
      //   key: 'test',
      //   width: 200,
      //   height: 400,
      //   backgroundImage: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/bg_rotate.jpeg',
      //   lineWidth: 5,
      //   lineColor: 0xeeeeee,
      //   fillColor: 0xff00ff,
      //   fillAlpha: 1,
      //   central: true,
      //   // radius: 10,
      //   fit: 'contain',
      //   alignment: 1,
      //   // rotation: MathUtils.DEG2RAD * 45,
      // }),
      // g(Circle2d, {
      //   width: 2,
      //   height: 2,
      //   center: { x: 0, y: 0 },
      //   fillColor: 0x0000,
      //   radius: 1,
      //   // scale: { x: 2, y: 2 },
      // }),
      // g(Text2d, {
      //   text: '1234567890',
      //   style: new PIXI.TextStyle({
      //     fontSize: 16,
      //     lineHeight: 24,
      //     fontFamily: 'Arial',
      //   }),
      //   x: 0,
      //   y: 0,
      //   // width: 200,
      //   // height: 200,
      //   central: false,
      //   zIndex: 100,
      //   // rotation: MathUtils.DEG2RAD * 45,
      //   // scale: { x: 2, y: 2 },
      // }),
      // g(Line2d, {
      //   lineWidth: 10,
      //   lineColor: 0x000,
      //   start: { x: 0, y: 0 },
      //   end: { x: 200, y: 0 },
      //   zIndex: 100,
      //   rotation: MathUtils.DEG2RAD * 45,
      // }),
      // g(Polygon, {
      //   path: [
      //     { x: 0, y: 0 },
      //     { x: 100, y: 0 },
      //     { x: 100, y: 100 },
      //     { x: 0, y: 100 },
      //   ],
      //   lineWidth: 10,
      //   lineColor: 0x000,
      //   fillColor: 0xff00ff,
      //   zIndex: 100,
      //   rotation: MathUtils.DEG2RAD * 45,
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
          x: hinted.position.x,
          y: hinted.position.y,
          width: hinted.size.x,
          height: hinted.size.y,
          central: true,
          lineWidth: 1,
          lineColor: PRIMARY_COLOR,
          fillAlpha: 0,
          alignment: 1,
          rotation: hinted.rotation.z * MathUtils.DEG2RAD,
          zIndex: RenderOrder.GIZMO,
        }),
      selected &&
        g(Gizmo2d, {
          key: 'gizmo2d',
          width: selected.size.x,
          height: selected.size.y,
          x: selected.position.x,
          y: selected.position.y,
          central: true,
          rotation: selected.rotation.z * MathUtils.DEG2RAD,
          zIndex: RenderOrder.GIZMO,
          color: PRIMARY_COLOR,
          deleteIcon: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/delete.svg',
          deleteIconSize: 18,
          adjustIcon: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/adjust2.svg',
          adjustIconSize: 18,
          deleteHandler: () => {
            appCommandManager._shared.entity.deleteEntity([selected]);
          },
          adjustHandler: (...args) => appCommandManager._shared.adjust.adjustHandler(...args),
          xLeftHandler: (...args) => appCommandManager._shared.adjust.xStretchHandler(...args),
          xRightHandler: (...args) => appCommandManager._shared.adjust.xStretchHandler(...args),
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
