import { IViewEntity, Reactive, ViewEntity3D, MathUtils } from '@turbox3d/turbox3d';
import { Circle, Rect3d } from '../helper/index';
import { AdjustPointEntity } from '../../../models/entity/AdjustPoint';
import { RenderOrder } from '../../../consts/scene';

interface IAdjustPointProps extends IViewEntity {
  model: AdjustPointEntity;
}

@Reactive
export class AdjustPointViewEntity extends ViewEntity3D<IAdjustPointProps> {
  protected reactivePipeLine = [
    this.updatePosition,
    this.updateRotation,
    this.updateScale
  ];

  render() {
    return [{
      component: Rect3d,
      props: {
        width: this.props.model.radius * 6,
        height: this.props.model.radius * 6,
        opacity: 0,
        renderOrder: RenderOrder.CONTROL_POINT,
      },
    }, {
      component: Circle,
      props: {
        radius: this.props.model.radius,
        imgUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01maNEP21pAbn3qjNFa_!!6000000005320-55-tps-91-90.svg?x-oss-process=image/resize,w_60',
        imgScale: { x: this.props.model.radius * 3 - 8, y: this.props.model.radius * 3 - 8, z: 1 },
        renderOrder: RenderOrder.CONTROL_POINT,
      },
    }];
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
