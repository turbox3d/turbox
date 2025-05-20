import { Reactive, Component, g, Grid2d } from '@turbox3d/turbox';
import { GRAY } from '../../../common/consts/color';
import { RenderOrder } from '../../../common/consts/scene';

@Reactive
export class Grid extends Component {
  render() {
    return [
      // g(Axis2d),
      g(Grid2d, {
        gridWidth: 250000,
        cellSize: 50,
        lineColor: GRAY,
        lineWidth: 1,
        zIndex: RenderOrder.GRID,
      }),
      // g(Image2d, {
      //   x: 500,
      //   y: 500,
      //   key: 'test',
      //   width: 200,
      //   height: 400,
      //   backgroundImage: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/bg_rotate.jpeg',
      //   lineWidth: 10,
      //   lineColor: 0xeeeeee,
      //   fillColor: 0xff00ff,
      //   fillAlpha: 1,
      //   central: true,
      //   // radius: 10,
      //   fit: 'none',
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
    ];
  }
}
