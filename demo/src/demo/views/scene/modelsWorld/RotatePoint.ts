import { Reactive, Mesh3D, MathUtils, g } from '@turbox3d/turbox';

import { RenderOrder } from '../../../common/consts/scene';
import { RotatePointEntity } from '../../../models/entity/rotatePoint';
import { Circle } from '../helper/index';

interface IRotatePointProps {
  model: RotatePointEntity;
}

@Reactive
export class RotatePointViewEntity extends Mesh3D<IRotatePointProps> {
  protected reactivePipeLine = [this.updatePosition, this.updateRotation, this.updateScale];

  render() {
    return [
      g(Circle, {
        radius: this.props.model.radius,
        imgUrl: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/rotate.png',
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
