import { Command, ViewEntity, SceneEvent, SceneTool, Action, Vec2, Vector2, InferenceEngine } from '@turbox3d/turbox';

import { ItemEntity } from '../../../models/entity/item';
import { appCommandManager } from '../../index';
import { imageBuilderStore } from '../../../models';

const ACTION_NAME = 'moveEntity';

export class MoveCommand extends Command {
  private action = Action.create(ACTION_NAME);
  private initPosition?: Vector2;
  private initModelPosition?: Vector2;
  private target?: ItemEntity;
  private inferenceEngine = new InferenceEngine();

  protected onDragStart(viewEntity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    const hinted = appCommandManager.default.hint.getHintedEntity() as ItemEntity | undefined;
    const selected = appCommandManager.default.select.getSelectedEntities()[0] as ItemEntity | undefined;
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
    imageBuilderStore.scene.clearSnapLines();
    const { vertical, horizontal } = this.inferenceEngine.entitySnap2d(target, imageBuilderStore.document.getEntities().filter(e => e !== target), 10);
    vertical && imageBuilderStore.scene.addSnapLines([vertical]);
    horizontal && imageBuilderStore.scene.addSnapLines([horizontal]);
    this.action.execute(() => {
      const sp = event.getScenePosition() as Vec2;
      const offset = new Vector2(sp.x, sp.y).subtracted(initPosition);
      target.setPosition(new Vector2(initModelPosition.x, initModelPosition.y).added(offset));
    });
  }

  protected onDragEnd() {
    const { initPosition, initModelPosition, target } = this;
    if (!target || !initPosition || !initModelPosition) {
      this.action.abort();
    } else {
      const { vertical, horizontal, verticalDiff = 0, horizontalDiff = 0 } = this.inferenceEngine.entitySnap2d(target, imageBuilderStore.document.getEntities().filter(e => e !== target), 10);
      this.action.execute(() => {
        vertical && target.setPosition({ x: target.position.x + verticalDiff });
        horizontal && target.setPosition({ y: target.position.y + horizontalDiff });
      });
      this.action.complete();
    }
    imageBuilderStore.scene.clearSnapLines();
    this.target = undefined;
    this.initModelPosition = undefined;
    this.initPosition = undefined;
    this.action = Action.create(ACTION_NAME);
  }
}
