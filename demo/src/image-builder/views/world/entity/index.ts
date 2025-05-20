import { Reactive, Component, g } from '@turbox3d/turbox';
import { imageBuilderStore } from '../../../models';
import { FrameViewEntity } from './frame';
import { ItemViewEntity } from './item';
import { FrameEntity } from '../../../models/entity/frame';
import { ItemEntity } from '../../../models/entity/item';
import { FrameSymbol, ItemSymbol } from '../../../common/consts/view-entity';

@Reactive
export class ViewEntity extends Component {
  render() {
    const frames = imageBuilderStore.document.getFrameEntities();
    const items = imageBuilderStore.document.getItemEntities();
    return [
      ...frames.map(m => g(FrameViewEntity, {
        key: m.id,
        model: m as FrameEntity,
        id: m.id,
        type: FrameSymbol,
      })),
      ...items.map(m => g(ItemViewEntity, {
        key: m.id,
        model: m as ItemEntity,
        id: m.id,
        type: ItemSymbol,
        clickable: true,
        draggable: true,
        hoverable: true,
      })),
    ];
  }
}
