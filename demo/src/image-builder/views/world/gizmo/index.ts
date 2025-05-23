import { Reactive, Component, g, MathUtils, Gizmo2d } from '@turbox3d/turbox';
import { appCommandManager } from '../../../commands';
import { ItemType, RenderOrder } from '../../../common/consts/scene';
import { BLUE } from '../../../common/consts/color';
import { ItemEntity } from '../../../models/entity/item';

@Reactive
export class Gizmo extends Component {
  deleteHandler() {
    const selected = appCommandManager.default.select.getSelectedEntities()[0];
    appCommandManager._shared.entity.deleteEntity([selected]);
  }

  copyHandler() {
    const selected = appCommandManager.default.select.getSelectedEntities()[0];
    appCommandManager._shared.entity.copyItemEntity(selected as ItemEntity);
  }

  adjustHandler(op, v, e, t) {
    appCommandManager._shared.adjust.adjustHandler(op, v, e, t);
  }

  stretchHandler(a, op, v, e, t) {
    appCommandManager._shared.adjust.stretchHandler(a, op, v, e, t);
  }

  render() {
    const selected = appCommandManager.default.select.getSelectedEntities()[0] as ItemEntity;

    return [
      selected &&
        g(Gizmo2d, {
          key: 'gizmo2d',
          width: selected.size.x,
          height: selected.size.y,
          x: selected.position.x,
          y: selected.position.y,
          central: true,
          rotation: selected.rotation.z * MathUtils.DEG2RAD,
          zIndex: RenderOrder.GIZMO,
          color: BLUE,
          deleteIcon: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/delete.svg',
          deleteIconSize: 18,
          copyIcon: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/copy.svg',
          copyIconSize: 18,
          adjustIcon: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/adjust2.svg',
          adjustIconSize: 18,
          showStretchRect: selected.itemType === ItemType.TEXT ? ['x-left', 'x-right'] : undefined,
          deleteHandler: this.deleteHandler,
          copyHandler: this.copyHandler,
          adjustHandler: this.adjustHandler,
          stretchHandler: this.stretchHandler,
        }),
    ];
  }
}
