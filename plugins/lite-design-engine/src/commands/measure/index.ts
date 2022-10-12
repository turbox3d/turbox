import { BaseCommand, IViewEntity, SceneEvent, ITool, Action, Vec3, Vector3 } from '@turbox3d/turbox';
import { MeasureDomain } from './domain';

export class MeasureCommand extends BaseCommand {
  private action = Action.create('measure');
  measure = new MeasureDomain();

  protected onDragStart(viewEntity: IViewEntity, event: SceneEvent, tools: ITool) {
    const scenePosition = event.getScenePosition(0) as Vec3;
    this.action.execute(() => {
      this.measure.$update({
        start: new Vector3(scenePosition.x, scenePosition.y, scenePosition.z),
      });
    });
  }

  protected onDragMove(viewEntity: IViewEntity, event: SceneEvent, tools: ITool) {
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
