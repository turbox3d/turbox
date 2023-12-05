import { Reactive, Mesh3D, MathUtils, g } from '@byted-tx3d/turbox';

import { RenderOrder } from '../../../common/consts/scene';
import { ClipPointEntity } from '../../../models/entity/clipPoint';
import { ldeStore } from '../../../models/index';
import { Circle, Rect3d } from '../helper/index';

interface IClipPointProps {
  model: ClipPointEntity;
}

@Reactive
export class ClipPointViewEntity extends Mesh3D<IClipPointProps> {
  protected reactivePipeLine = [this.updatePosition, this.updateRotation, this.updateScale];

  render() {
    const hotArea = ldeStore.scene.deviceType === 'iPad' ? this.props.model.radius * 6 : this.props.model.radius * 3;
    return [
      g(Rect3d, {
        width: hotArea,
        height: hotArea,
        opacity: 0,
        renderOrder: RenderOrder.CONTROL_POINT + 1,
      }),
      g(Circle, {
        radius: this.props.model.radius - 5,
        color: 0xffffff,
        renderOrder: RenderOrder.CONTROL_POINT,
        key: 1,
      }),
      g(Circle, {
        radius: this.props.model.radius,
        color: 0xbf975b,
        renderOrder: RenderOrder.CONTROL_POINT,
        key: 2,
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
