import { Reactive, MathUtils, g, Mesh3D } from '@turbox3d/turbox';

import { RenderOrder } from '../../../common/consts/scene';
import { AdjustPointEntity } from '../../../models/entity/adjustPoint';
import { Circle, Rect3d, IRect3dProps, ICircleProps } from '../helper/index';

interface IAdjustPointProps {
  model: AdjustPointEntity;
}

@Reactive
export class AdjustPointViewEntity extends Mesh3D<IAdjustPointProps> {
  protected reactivePipeLine = [this.updatePosition, this.updateRotation, this.updateScale];

  render() {
    const hotArea = Math.min(
      this.props.model.radius * 6,
      Math.min(this.props.model.parent!.size.x / 3, this.props.model.parent!.size.y / 3)
    );
    return [
      g<IRect3dProps>(Rect3d, {
        width: hotArea,
        height: hotArea,
        opacity: 0,
        renderOrder: RenderOrder.CONTROL_POINT + 1,
      }),
      g<ICircleProps>(Circle, {
        radius: this.props.model.radius,
        imgUrl: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/adjust.svg',
        imgScale: { x: this.props.model.radius * 3 - 8, y: this.props.model.radius * 3 - 8, z: 1 },
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
