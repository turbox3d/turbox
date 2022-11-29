import { ViewEntity, SceneEvent, EventType } from '@turbox3d/event-manager';
import { SceneTool } from './type';

class Interaction {
  protected onClick(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onDBClick(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onRightClick(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onDragStart(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onDragMove(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onDragEnd(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onPinchStart(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onPinch(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onPinchEnd(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onRotateStart(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onRotate(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onRotateEnd(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onPress(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onPressUp(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onHoverIn(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onHoverOut(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onCarriageMove(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  protected onCarriageEnd(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  /**
   * 画布的缩放事件
   */
  protected onWheel(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  /**
   * 将交互事件分发给自身的回调函数处理
   */
  protected distributeToSelf(eventType: EventType, ev: ViewEntity, event: SceneEvent, tools: SceneTool) {
    switch (eventType) {
    case EventType.onClick:
      this.onClick(ev, event, tools);
      break;
    case EventType.onDBClick:
      this.onDBClick(ev, event, tools);
      break;
    case EventType.onRightClick:
      this.onRightClick(ev, event, tools);
      break;
    case EventType.onDragStart:
      this.onDragStart(ev, event, tools);
      break;
    case EventType.onDragMove:
      this.onDragMove(ev, event, tools);
      break;
    case EventType.onDragEnd:
      this.onDragEnd(ev, event, tools);
      break;
    case EventType.onPinchStart:
      this.onPinchStart(ev, event, tools);
      break;
    case EventType.onPinch:
      this.onPinch(ev, event, tools);
      break;
    case EventType.onPinchEnd:
      this.onPinchEnd(ev, event, tools);
      break;
    case EventType.onRotateStart:
      this.onRotateStart(ev, event, tools);
      break;
    case EventType.onRotate:
      this.onRotate(ev, event, tools);
      break;
    case EventType.onRotateEnd:
      this.onRotateEnd(ev, event, tools);
      break;
    case EventType.onPress:
      this.onPress(ev, event, tools);
      break;
    case EventType.onPressUp:
      this.onPressUp(ev, event, tools);
      break;
    case EventType.onHoverIn:
      this.onHoverIn(ev, event, tools);
      break;
    case EventType.onHoverOut:
      this.onHoverOut(ev, event, tools);
      break;
    case EventType.onCarriageMove:
      this.onCarriageMove(ev, event, tools);
      break;
    case EventType.onCarriageEnd:
      this.onCarriageEnd(ev, event, tools);
      break;
    case EventType.onWheel:
      this.onWheel(ev, event, tools);
      break;
    default: break;
    }
  }
}

export { Interaction };
