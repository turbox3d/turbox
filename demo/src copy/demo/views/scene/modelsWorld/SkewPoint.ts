import { Reactive, Mesh3D, MathUtils, g } from '@byted-tx3d/turbox';

import { RenderOrder } from '../../../common/consts/scene';
import { SkewPointEntity } from '../../../models/entity/skewPoint';
import { Circle } from '../helper/index';

interface ISkewPointProps {
  model: SkewPointEntity;
}

@Reactive
export class SkewPointViewEntity extends Mesh3D<ISkewPointProps> {
  protected reactivePipeLine = [this.updatePosition, this.updateRotation, this.updateScale];

  render() {
    return [
      g(Circle, {
        radius: this.props.model.radius,
        color: 0xbf975b,
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
