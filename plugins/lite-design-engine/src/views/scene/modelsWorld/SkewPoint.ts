import { IViewEntity, Reactive, ViewEntity3D, MathUtils } from '@turbox3d/turbox3d';
import { Circle } from '../helper/index';
import { SkewPointEntity } from '../../../models/entity/skewPoint';

interface ISkewPointProps extends IViewEntity {
  model: SkewPointEntity;
}

@Reactive
export class SkewPointViewEntity extends ViewEntity3D<ISkewPointProps> {
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
        color: 0xBF975B,
      }
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
