import * as THREE from 'three';

import { Reactive, Mesh3D, MathUtils, g } from '@byted-tx3d/turbox';

// import { appCommandManager } from '../../../commands/index';
// import { WireFrame } from '../helper/index';
import { BackgroundEntity } from '../../../models/entity/background';

interface IProps {
  model: BackgroundEntity;
}

@Reactive
export class BackgroundViewEntity extends Mesh3D<IProps> {
  protected reactivePipeLine = [this.updatePosition, this.updateRotation, this.updateScale];

  protected onClickable() {
    return false;
  }

  protected onHoverable() {
    return false;
  }

  protected onDraggable() {
    return false;
  }

  protected onPinchable() {
    return false;
  }

  protected onRotatable() {
    return false;
  }

  protected onPressable() {
    return false;
  }

  render() {
    const { model } = this.props;
    // const isSelected = appCommandManager.defaultCommand.select
    //   .getSelectedEntities()
    //   .includes(model);
    return [
      g(Background, {
        model,
      }),
    ];
  }

  private updatePosition() {
    const { model } = this.props;
    this.view.position.set(model.position.x, model.position.y, model.position.z);
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
  protected reactivePipeLine = [this.updateMaterial, this.updateGeometry, this.updateRenderOrder];
  protected view = new THREE.Mesh();

  private updateMaterial() {
    const { model } = this.props;
    if (model.url) {
      const map = new THREE.Texture(model.urlImage);
      map.needsUpdate = true;
      this.assignTexture(map);
    }
  }

  private assignTexture(map: THREE.Texture) {
    this.view.material = new THREE.MeshBasicMaterial({ map });
    this.view.material.transparent = true;
    this.view.material.depthTest = false;
  }

  private updateGeometry() {
    const { model } = this.props;
    this.view.geometry = new THREE.PlaneGeometry(model.size.x, model.size.y);
  }

  private updateRenderOrder() {
    const { model } = this.props;
    this.view.renderOrder = model.renderOrder;
  }
}
