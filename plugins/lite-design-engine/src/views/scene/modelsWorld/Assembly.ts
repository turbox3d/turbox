import { IViewEntity, Reactive, ViewEntity3D, MathUtils, EntityObject, Element } from '@turbox3d/turbox3d';
import { AssemblyEntity } from '../../../models/entity/assembly';
import { WireFrame } from '../helper/index';
import { appCommandBox } from '../../../commands/index';

interface IAssemblyProps extends IViewEntity {
  model: AssemblyEntity;
  renderEntityViews: (entities: IterableIterator<EntityObject>) => Element[];
}

@Reactive
export class AssemblyViewEntity extends ViewEntity3D<IAssemblyProps> {
  protected reactivePipeLine = [
    this.updatePosition,
    this.updateRotation,
    this.updateScale
  ];

  render() {
    const { model } = this.props;
    const isSelected = appCommandBox.defaultCommand.select
      .getSelectedEntities()
      .includes(model);
    const views = this.props.renderEntityViews(model.children.values());
    if (isSelected) {
      return [
        ...views,
        {
          component: WireFrame,
          props: {
            model,
          }
        }
      ];
    }
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
