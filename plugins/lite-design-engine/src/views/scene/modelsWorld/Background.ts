import { IViewEntity, Mesh3D, Reactive, ViewEntity3D, MathUtils } from '@turbox3d/turbox3d';
import * as THREE from 'three';
// import { appCommandBox } from '../../../commands/index';
// import { WireFrame } from '../helper/index';
import { BackgroundEntity } from '../../../models/entity/background';

interface IProps extends IViewEntity {
  model: BackgroundEntity;
}

@Reactive
export class BackgroundViewEntity extends ViewEntity3D<IProps> {
  protected reactivePipeLine = [
    this.updatePosition,
    this.updateRotation,
    this.updateScale,
  ];

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
  protected reactivePipeLine = [this.updateMaterial, this.updateGeometry, this.updatePosition, this.updateRenderOrder];
  protected view = new THREE.Sprite();

  private updateMaterial() {
    const { model } = this.props;
    if (model.url) {
      const map = new THREE.Texture(model.urlImage);
      map.needsUpdate = true;
      this.assignTexture(map);
    }
  }

  private assignTexture(map: THREE.Texture) {
    this.view.material = new THREE.SpriteMaterial({ map });
    this.view.material.depthTest = false;
  }

  private updateGeometry() {
    const { model } = this.props;
    this.view.scale.set(model.size.x, model.size.y, model.size.z);
  }

  private updatePosition() {
    const { model } = this.props;
    this.view.position.set(model.position.x, model.position.y, model.position.z);
  }

  private updateRenderOrder() {
    const { model } = this.props;
    this.view.renderOrder = model.renderOrder;
  }
}
