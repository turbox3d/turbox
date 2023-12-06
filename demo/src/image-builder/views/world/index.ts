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
      // g(Text2d, {
      //   text: 'hello world',
      //   style: new PIXI.TextStyle({
      //     fontSize: 16,
      //     fontFamily: 'Arial',
      //   }),
      //   position: { x: 200, y: 200 },
      // }),
      g(Container2d, {
        position: { x: 100, y: 100 },
        width: 600,
        height: 400,
        central: false,
        lineWidth: 5,
        lineColor: 0x000,
        fillColor: 0xff00ff,
        backgroundImage: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/bg_rotate.jpeg',
        children: [
          g(Image2d, {
            margin: '10,0,0,20',
            width: 200,
            height: 200,
            backgroundImage: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/bg_rotate.jpeg',
          }),
          g(Text2d, {
            text: 'hello world',
            style: new PIXI.TextStyle({
              fontSize: 16,
              fontFamily: 'Arial',
            }),
            margin: '10,0,0,30',
          }),
        ],
      }),
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
