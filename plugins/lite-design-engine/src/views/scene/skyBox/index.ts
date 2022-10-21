import * as THREE from 'three';
import { Reactive, EntityObject, ViewEntity3D, Mesh3D, MathUtils, g } from '@turbox3d/turbox';
import { SkyBoxEntity } from '../../../models/entity/skyBox';
import { RenderOrder } from '../../../consts/scene';

interface ISkyBoxProps {
  model: SkyBoxEntity;
}

@Reactive
export class SkyBoxViewEntity extends ViewEntity3D<ISkyBoxProps> {
  protected reactivePipeLine = [this.updatePosition, this.updateRotation, this.updateScale];

  protected onClickable() {
    const { model } = this.props;
    return model.isClickable;
  }

  protected onHoverable() {
    const { model } = this.props;
    return model.isHoverable;
  }

  protected onDraggable() {
    const { model } = this.props;
    return model.isDraggable;
  }

  protected onPinchable() {
    const { model } = this.props;
    return model.isPinchable;
  }

  protected onRotatable() {
    const { model } = this.props;
    return model.isRotatable;
  }

  protected onPressable() {
    const { model } = this.props;
    return model.isPressable;
  }

  render() {
    return [
      g(SkyBox, {
        model: this.props.model,
        color: 0xbf975b,
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

interface ICubeProps {
  model: EntityObject;
  color?: number;
}

export class SkyBox extends Mesh3D<ICubeProps> {
  protected reactivePipeLine = [this.updateGeometry, this.updateVisible];
  protected view = new THREE.Group();

  updateGeometry() {
    const faces = [
      {
        name: 'top',
        geometry: new THREE.PlaneGeometry(this.props.model.size.x, this.props.model.size.z),
        position: { x: 0, y: this.props.model.size.y / 2, z: 0 },
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        material: new THREE.MeshPhongMaterial({
          color: 0x0000ff,
          transparent: true,
          side: THREE.DoubleSide,
        }),
      },
      {
        name: 'bottom',
        geometry: new THREE.PlaneGeometry(this.props.model.size.x, this.props.model.size.z),
        position: { x: 0, y: -this.props.model.size.y / 2, z: 0 },
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
        material: new THREE.MeshPhongMaterial({
          color: 0x333333,
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide,
        }),
      },
      {
        name: 'left',
        geometry: new THREE.PlaneGeometry(this.props.model.size.z, this.props.model.size.y),
        position: { x: -this.props.model.size.x / 2, y: 0, z: 0 },
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        material: new THREE.MeshPhongMaterial({
          color: 0xffff00,
          transparent: true,
          side: THREE.DoubleSide,
        }),
      },
      {
        name: 'right',
        geometry: new THREE.PlaneGeometry(this.props.model.size.z, this.props.model.size.y),
        position: { x: this.props.model.size.x / 2, y: 0, z: 0 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        material: new THREE.MeshPhongMaterial({
          color: 0xf00000,
          transparent: true,
          side: THREE.DoubleSide,
        }),
      },
      // {
      //   name: 'front',
      //   geometry: new THREE.PlaneGeometry(this.props.model.size.x, this.props.model.size.y),
      //   position: { x: 0, y: 0, z: this.props.model.size.z / 2 },
      //   rotation: { x: 0, y: 0, z: 0 },
      //   material: new THREE.MeshPhongMaterial({
      //     color: 0x00ffff,
      //     transparent: true,
      //     side: THREE.DoubleSide,
      //   }),
      // },
      {
        name: 'back',
        geometry: new THREE.PlaneGeometry(this.props.model.size.x, this.props.model.size.y),
        position: { x: 0, y: 0, z: -this.props.model.size.z / 2 },
        rotation: { x: 0, y: 0, z: 0 },
        material: new THREE.MeshPhongMaterial({
          color: 0x00f000,
          transparent: true,
          side: THREE.DoubleSide,
        }),
      },
    ];
    faces.forEach(face => {
      const mesh = new THREE.Mesh();
      mesh.geometry = face.geometry;
      mesh.material = face.material;
      mesh.name = face.name;
      mesh.position.set(face.position.x, face.position.y, face.position.z);
      mesh.rotation.set(face.rotation.x, face.rotation.y, face.rotation.z);
      mesh.receiveShadow = true;
      mesh.renderOrder = RenderOrder.SKY_BOX;
      this.view.add(mesh);
    });
    this.view.position.set(0, 0, 0);
  }

  updateVisible() {
    const { model } = this.props;
    (this.view.children as THREE.Mesh[]).filter(child => child.name !== 'bottom').forEach(child => {
      (child.material as THREE.MeshPhongMaterial).opacity = ((model as SkyBoxEntity).isShowAllFace ? 0.2 : 0);
    });
  };
}
