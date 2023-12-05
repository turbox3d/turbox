import { Command, ViewEntity, SceneEvent, SceneTool, Action, Vec2, Vector2 } from '@turbox3d/turbox';

import { ItemEntity } from '../../../models/entity/item';
import { appCommandManager } from '../../index';

const ACTION_NAME = 'moveEntity';

export class MoveCommand extends Command {
  private action = Action.create(ACTION_NAME);
  private initPosition?: Vector2;
  private initModelPosition?: Vector2;
  private target?: ItemEntity;

  protected onDragStart(viewEntity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    const hinted = appCommandManager.defaultCommand.hint.getHintedEntity() as ItemEntity | undefined;
    const selected = appCommandManager.defaultCommand.select.getSelectedEntities()[0] as ItemEntity | undefined;
    const isMove =
      (hinted instanceof ItemEntity && !hinted.locked) || (selected instanceof ItemEntity && !selected.locked);
    if (isMove) {
      const model = (hinted || selected) as ItemEntity;
      const sp = event.getScenePosition() as Vec2;
      this.initPosition = new Vector2(sp.x, sp.y);
      this.initModelPosition = new Vector2(model.position.x, model.position.y);
      this.target = model;
    }
  }

  protected onDragMove(viewEntity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    const { initPosition, initModelPosition, target } = this;
    if (!initPosition || !target || !initModelPosition) {
      return;
    }
    this.action.execute(() => {
      const sp = event.getScenePosition() as Vec2;
      const offset = new Vector2(sp.x, sp.y).subtracted(initPosition);
      target.setPosition(new Vector2(initModelPosition.x, initModelPosition.y).added(offset));
    });
  }

  protected onDragEnd() {
    if (!this.target || !this.initPosition || !this.initModelPosition) {
      this.action.abort();
    } else {
      this.action.complete();
    }
    this.target = undefined;
    this.initModelPosition = undefined;
    this.initPosition = undefined;
    this.action = Action.create(ACTION_NAME);
  }
}
