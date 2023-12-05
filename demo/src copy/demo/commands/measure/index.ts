import { Command, ViewEntity, SceneEvent, SceneTool, Action, Vec3, Vector3 } from '@byted-tx3d/turbox';

import { MeasureDomain } from './domain';

export class MeasureCommand extends Command {
  private action = Action.create('measure');
  measure = new MeasureDomain();

  protected onDragStart(viewEntity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    const scenePosition = event.getScenePosition(0) as Vec3;
    this.action.execute(() => {
      this.measure.$update({
        start: new Vector3(scenePosition.x, scenePosition.y, scenePosition.z),
      });
    });
  }

  protected onDragMove(viewEntity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    const scenePosition = event.getScenePosition(0) as Vec3;
    this.action.execute(() => {
      this.measure.$update({
        end: new Vector3(scenePosition.x, scenePosition.y, scenePosition.z),
      });
    });
  }

  protected onDragEnd() {
    this.action.complete();
  }
}
