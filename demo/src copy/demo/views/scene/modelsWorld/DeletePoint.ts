import { Reactive, Mesh3D, MathUtils, g } from '@byted-tx3d/turbox';

import { RenderOrder } from '../../../common/consts/scene';
import { DeletePointEntity } from '../../../models/entity/deletePoint';
import { ProductEntity } from '../../../models/entity/product';
import { ldeStore } from '../../../models/index';
import { Circle, Rect3d } from '../helper/index';

interface IDeletePointProps {
  model: DeletePointEntity;
  product: ProductEntity;
}

@Reactive
export class DeletePointViewEntity extends Mesh3D<IDeletePointProps> {
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
        radius: this.props.model.radius,
        imgUrl: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/delete.svg',
        renderOrder: RenderOrder.CONTROL_POINT,
      }),
    ];
  }

  onClick() {
    ldeStore.actions.deleteEntity([this.props.product]);
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
