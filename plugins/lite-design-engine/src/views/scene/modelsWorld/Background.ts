import { IViewEntity, Mesh3D, Reactive, ViewEntity3D, MathUtils } from '@turbox3d/turbox3d';
import * as THREE from 'three';
import * as React from 'react';
// import { appCommandBox } from '../../../commands/index';
// import { WireFrame } from '../helper/index';
import { BackgroundEntity } from '../../../models/entity/background';
import { convertUrl } from '../../../utils/image';

interface IProps extends IViewEntity {
  model: BackgroundEntity;
}

@Reactive
export class BackgroundViewEntity extends ViewEntity3D<IProps> {
  protected reactivePipeLine = [
    this.updatePosition,
    this.updateRotation,
    this.updateScale
  ];

  render() {
    const { model } = this.props;
    // const isSelected = appCommandBox.defaultCommand.select
    //   .getSelectedEntities()
    //   .includes(model);
    return [{
      component: Background,
      props: {
        model,
      },
    }];
  }

  private updatePosition() {
    const { model } = this.props;
    this.view.position.set(
      model.position.x,
      model.position.y,
      model.position.z
    );
  }

  private updateRotation() {
    const { model } = this.props;
    this.view.rotation.set(
      model.rotation.x * MathUtils.DEG2RAD,
      model.rotation.y * MathUtils.DEG2RAD,
      model.rotation.z * MathUtils.DEG2RAD
    );
  }

  private updateScale() {
    const { model } = this.props;
    this.view.scale.set(model.scale.x, model.scale.y, model.scale.z);
  }
}

interface IBackgroundProps {
  model: BackgroundEntity;
}

export class Background extends Mesh3D<IBackgroundProps> {
  protected reactivePipeLine = [this.updateMaterial, this.updateGeometry, this.updatePosition];
  protected view = new THREE.Sprite();

  async updateMaterial() {
    const { model } = this.props;
    if (model.url) {
      // const url = model.url instanceof Blob ? URL.createObjectURL(model.url) : model.url;
      const loader = new THREE.TextureLoader();
      loader.setWithCredentials(true);
      const map = await loader.loadAsync(convertUrl(model.url)).catch((err) => {
        console.error(err);
      });
      // model.url instanceof Blob && URL.revokeObjectURL(url);
      if (!map) {
        return;
      }
      this.assignTexture(map);
    }
  }

  private assignTexture(map: THREE.Texture) {
    this.view.material = new THREE.SpriteMaterial({ map });
  }

  updateGeometry() {
    const { model } = this.props;
    this.view.scale.set(model.size.x, model.size.y, model.size.z);
  }

  private updatePosition() {
    const { model } = this.props;
    this.view.position.set(
      model.position.x,
      model.position.y,
      model.position.z
    );
  }
}
