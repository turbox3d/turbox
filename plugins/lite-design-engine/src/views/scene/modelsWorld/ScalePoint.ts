import { IViewEntity, Reactive, ViewEntity3D, MathUtils } from '@turbox3d/turbox3d';
import { Rect3d } from '../helper/index';
import { ScalePointEntity } from '../../../models/entity/scalePoint';
import { RenderOrder } from '../../../consts/scene';

interface IScalePointProps extends IViewEntity {
  model: ScalePointEntity;
}

@Reactive
export class ScalePointViewEntity extends ViewEntity3D<IScalePointProps> {
  protected reactivePipeLine = [
    this.updatePosition,
    this.updateRotation,
    this.updateScale
  ];

  render() {
    return [{
      component: Rect3d,
      props: {
        width: this.props.model.radius * 1.5,
        height: this.props.model.radius * 1.5,
        renderOrder: RenderOrder.CONTROL_POINT,
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
