import { IViewEntity, Reactive, ViewEntity3D, MathUtils, createElement } from '@turbox3d/turbox3d';
import { Circle, Rect3d, IRect3dProps, ICircleProps } from '../helper/index';
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
    const hotArea = Math.min(
      this.props.model.radius * 6,
      Math.min(this.props.model.parent!.size.x / 3, this.props.model.parent!.size.y / 3)
    );
    return [
      createElement<IRect3dProps>(Rect3d, {
        width: hotArea,
        height: hotArea,
        opacity: 0,
        renderOrder: RenderOrder.CONTROL_POINT + 1,
      }),
      createElement<ICircleProps>(Circle, {
        radius: this.props.model.radius,
        imgUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01maNEP21pAbn3qjNFa_!!6000000005320-55-tps-91-90.svg?x-oss-process=image/resize,w_60',
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
