import { Domain, mutation, reactor } from '@turbox3d/reactivity';
import { BaseCommand } from '@turbox3d/command-manager';
import { ViewEntity } from '@turbox3d/event-manager';
import SelectionCommand from '../selection-command/index';
import EntityObject from '../entity-object';

class Hint extends Domain {
  @reactor hintedEntity?: EntityObject;

  @mutation()
  hint(model: EntityObject) {
    this.hintedEntity = model;
  }

  @mutation()
  unHint() {
    this.hintedEntity = undefined;
  }
}

export default class HintCommand extends BaseCommand {
  private hintDomain = new Hint();
  private selection?: SelectionCommand;

  /**
   * @param selectionCommand selection command 实例，hint 与 select 同时启用时需要传入
   */
  active(selectionCommand?: SelectionCommand) {
    this.selection = selectionCommand;
  }

  /** 获取被 hover 的 entity */
  getHintedEntity() {
    return this.hintDomain.hintedEntity;
  }

  /** hint 指定 entity */
  hint(model: EntityObject) {
    this.hintDomain.hint(model);
  }

  /** 取消 hint */
  unHint() {
    this.hintDomain.unHint();
  }

  onHoverIn(viewEntity: ViewEntity) {
    const model = EntityObject.getEntityById(viewEntity.id);
    if (!model) {
      this.hintDomain.unHint();
      return;
    }
    if (!this.selection) {
      this.hintDomain.hint(model);
      return;
    }
    const path = model.getParentPathChain();
    const selectedEntities = this.selection.getSelectedEntities();
    if (selectedEntities.length && selectedEntities.includes(path[0])) {
      this.hintDomain.unHint();
      return;
    }
    if (selectedEntities.length && selectedEntities.includes(model)) {
      this.hintDomain.unHint();
      return;
    }
    const layerDepth = this.selection.getLayerDepth();
    const pathLength = path.length;
    if (selectedEntities.length && selectedEntities[0].getRoot() !== path[0]) {
      const index = this.selection.getSelectMode() === SelectionCommand.ESelectMode.OVERALL ? 1 : 2;
      this.hintDomain.hint(path[index - 1]);
      return;
    }
    const index = Math.min(pathLength, layerDepth);
    this.hintDomain.hint(path[index - 1]);
  }

  onHoverOut() {
    this.hintDomain.unHint();
  }
}
