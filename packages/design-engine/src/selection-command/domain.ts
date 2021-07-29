import { Domain, mutation, reactor } from '@turbox3d/reactivity';
import { batchRemove } from '@turbox3d/shared';
import EntityObject from '../entity-object';
import { ESelectMode } from './command';

export class Selection extends Domain {
  @reactor() selectedEntities: EntityObject[] = [];
  /** 选择层级深度，多选时取最大值 */
  @reactor() layerDepth = 1;
  @reactor() selectMode = ESelectMode.OVERALL;
  @reactor() selectEntityTypes?: symbol[];

  @mutation()
  switchSelectMode(selectMode: ESelectMode) {
    this.selectMode = selectMode;
  }

  @mutation
  setLayerDepth(layerDepth: number) {
    this.layerDepth = layerDepth;
  }

  @mutation()
  select(models: EntityObject[], onSelectHandler?: (models: EntityObject[]) => void) {
    if (models.length === 0) {
      return;
    }
    this.selectedEntities.push(...models);
    const layerDepths = models.map((m) => m.getParentPathChain().indexOf(m) + 1);
    this.setLayerDepth(Math.max(...layerDepths));
    onSelectHandler && onSelectHandler(models);
  }

  @mutation()
  unselect(models: EntityObject[], onUnselectHandler?: (models: EntityObject[]) => void) {
    batchRemove(this.selectedEntities, models);
    onUnselectHandler && onUnselectHandler(models);
  }

  @mutation()
  clearAllSelected(onUnselectHandler?: (models: EntityObject[]) => void) {
    const selected = this.selectedEntities.slice();
    batchRemove(this.selectedEntities, selected);
    onUnselectHandler && onUnselectHandler(selected);
  }

  @mutation()
  setSelectEntityTypes(types?: symbol[]) {
    this.selectEntityTypes = types;
  }
}
