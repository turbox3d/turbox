import { Reactive, Mesh3D, MathUtils, Element, g } from '@byted-tx3d/turbox';

import { appCommandManager } from '../../../commands/index';
import { RenderOrder } from '../../../common/consts/scene';
import { CubeEntity } from '../../../models/entity/cube';
import { Cube, WireFrame } from '../helper/index';

interface IProps {
  model: CubeEntity;
}

@Reactive
export class CubeViewEntity extends Mesh3D<IProps> {
  protected reactivePipeLine = [this.updatePosition, this.updateRotation, this.updateScale];

  render() {
    this.view.renderOrder = RenderOrder.Cube;
    const { model } = this.props;
    const isSelected = appCommandManager.defaultCommand.select.getSelectedEntities().includes(model);
    const views: Element[] = [];
    if (isSelected) {
      views.push(
        g(WireFrame, {
          model,
        })
      );
    }
    views.push(
      g(Cube, {
        model,
      })
    );
    return views;
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
