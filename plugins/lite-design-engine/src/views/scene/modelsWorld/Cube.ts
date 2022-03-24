import { IViewEntity, Reactive, ViewEntity3D, MathUtils, Element } from '@turbox3d/turbox3d';
import { appCommandBox } from '../../../commands/index';
import { Cube, WireFrame } from '../helper/index';
import { CubeEntity } from '../../../models/entity/cube';
import { RenderOrder } from '../../../consts/scene';

interface IProps extends IViewEntity {
  model: CubeEntity;
}

@Reactive
export class CubeViewEntity extends ViewEntity3D<IProps> {
  protected reactivePipeLine = [
    this.updatePosition,
    this.updateRotation,
    this.updateScale
  ];

  render() {
    this.view.renderOrder = RenderOrder.Cube;
    const { model } = this.props;
    const isSelected = appCommandBox.defaultCommand.select
      .getSelectedEntities()
      .includes(model);
    const views: Element[] = [];
    if (isSelected) {
      views.push({
        component: WireFrame,
        props: {
          model,
        }
      });
    }
    views.push({
      component: Cube,
      props: {
        model,
      },
    });
    return views;
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
