import { IViewEntity, Reactive, ViewEntity3D, MathUtils } from '@turbox3d/turbox3d';
import { Circle, Rect3d } from '../helper/index';
import { ClipPointEntity } from '../../../models/entity/clipPoint';
import { RenderOrder } from '../../../consts/scene';

interface IClipPointProps extends IViewEntity {
  model: ClipPointEntity;
}

@Reactive
export class ClipPointViewEntity extends ViewEntity3D<IClipPointProps> {
  protected reactivePipeLine = [
    this.updatePosition,
    this.updateRotation,
    this.updateScale
  ];

  render() {
    return [
      {
        component: Rect3d,
        props: {
          width: this.props.model.radius * 6,
          height: this.props.model.radius * 6,
          opacity: 0,
          renderOrder: RenderOrder.CONTROL_POINT,
        },
      },
      {
        component: Circle,
        props: {
          radius: this.props.model.radius - 5,
          color: 0xffffff,
          renderOrder: RenderOrder.CONTROL_POINT,
        },
        key: 1,
      },
      {
        component: Circle,
        props: {
          radius: this.props.model.radius,
          color: 0xbf975b,
          renderOrder: RenderOrder.CONTROL_POINT,
        },
        key: 2,
      },
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
