import * as PIXI from 'pixi.js';

import { Mesh2D, DrawUtils } from '@turbox3d/turbox';

import { FrameEntity } from '../../../../models/entity/frame';

export interface IFrameViewEntityProps {
  model: FrameEntity;
}

export class FrameViewEntity extends Mesh2D<IFrameViewEntityProps> {
  protected view = new PIXI.Graphics();
  protected reactivePipeLine = [this.updateGeometry, this.updateMaterial];

  updateGeometry() {
    const { model } = this.props;
    this.view.clear();
    this.view.zIndex = model.renderOrder;
    DrawUtils.drawRect(this.view, {
      x: model.position.x,
      y: model.position.y,
      width: model.size.x,
      height: model.size.y,
      central: true,
      fillColor: model.bgColor,
      fillAlpha: 1,
    });
  }

  updateMaterial() {
    const { model } = this.props;
    if (model.imageData) {
      this.view.clear();
      DrawUtils.drawRect(this.view, {
        x: model.position.x,
        y: model.position.y,
        width: model.size.x,
        height: model.size.y,
        central: true,
        backgroundImage: model.imageData.src,
      });
    }
  }
}
