import { Reactive, Mesh3D, MathUtils, EntityObject, Element, g } from '@byted-tx3d/turbox';

import { appCommandManager } from '../../../commands/index';
import { AssemblyEntity } from '../../../models/entity/assembly';
import { WireFrame } from '../helper/index';

interface IAssemblyProps {
  model: AssemblyEntity;
  renderEntityViews: (entities: IterableIterator<EntityObject>) => Element[];
}

@Reactive
export class AssemblyViewEntity extends Mesh3D<IAssemblyProps> {
  protected reactivePipeLine = [this.updatePosition, this.updateRotation, this.updateScale];

  render() {
    const { model } = this.props;
    const isSelected = appCommandManager.defaultCommand.select.getSelectedEntities().includes(model);
    const views = this.props.renderEntityViews(model.children.values());
    if (isSelected) {
      return [
        ...views,
        g(WireFrame, {
          model,
        }),
      ];
    }
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
