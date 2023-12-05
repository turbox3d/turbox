import { Reactive, Mesh3D, MathUtils, g } from '@byted-tx3d/turbox';

import { RenderOrder } from '../../../common/consts/scene';
import { ScalePointEntity } from '../../../models/entity/scalePoint';
import { Rect3d } from '../helper/index';

interface IScalePointProps {
  model: ScalePointEntity;
}

@Reactive
export class ScalePointViewEntity extends Mesh3D<IScalePointProps> {
  protected reactivePipeLine = [this.updatePosition, this.updateRotation, this.updateScale];

  render() {
    return [
      g(Rect3d, {
        width: this.props.model.radius * 1.5,
        height: this.props.model.radius * 1.5,
        renderOrder: RenderOrder.CONTROL_POINT,
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
