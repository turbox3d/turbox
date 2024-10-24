import * as PIXI from 'pixi.js';

import { Reactive, Component, g, Axis2d, Text2d, Container2d, Image2d } from '@turbox3d/turbox';

import { Grid } from '../../components/Grid';
import { FrameEntity } from '../../models/entity/frame';
import { ItemEntity } from '../../models/entity/item';

import { FrameViewEntity } from './frame/index';
import { ItemViewEntity } from './item/index';
import { imageBuilderStore } from '../../models/index';

@Reactive
export class World extends Component {
  render() {
    return [
      g(Axis2d),
      g(Grid, {
        gridWidth: 250000,
        cellSize: 50,
        lineColor: 0xdddddd,
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
      ...[...imageBuilderStore.document.models.values()]
        .filter(m => m instanceof FrameEntity)
        .map(m =>
          g(FrameViewEntity, {
            key: m.id,
            model: m as FrameEntity,
          })
        ),
      ...[...imageBuilderStore.document.models.values()]
        .filter(m => m instanceof ItemEntity)
        .map(m =>
          g(ItemViewEntity, {
            key: m.id,
            model: m as ItemEntity,
          })
        ),
    ];
  }
}
