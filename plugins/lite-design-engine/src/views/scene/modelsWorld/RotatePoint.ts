import { IViewEntity, Reactive, ViewEntity3D, MathUtils } from '@turbox3d/turbox3d';
import { Circle } from '../helper/index';
import { RotatePointEntity } from '../../../models/entity/rotatePoint';

interface IRotatePointProps extends IViewEntity {
  model: RotatePointEntity;
}

@Reactive
export class RotatePointViewEntity extends ViewEntity3D<IRotatePointProps> {
  protected reactivePipeLine = [
    this.updatePosition,
    this.updateRotation,
    this.updateScale
  ];

  render() {
    return [{
      component: Circle,
      props: {
        radius: this.props.model.radius,
        imgUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01Ekra8c1aK1gwa57wE_!!6000000003310-2-tps-200-200.png?x-oss-process=image/resize,w_60',
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
