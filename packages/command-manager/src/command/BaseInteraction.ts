import { ViewEntity, SceneEvent } from '@turbox3d/event-manager';
import { CommandEventType, SceneTool } from './type';

class BaseInteraction {
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
  protected onZoom(entity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    //
  }

  /**
   * 将交互事件分发给自身的回调函数处理
   */
  protected distributeToSelf(eventType: CommandEventType, ev: ViewEntity, event: SceneEvent, tools: SceneTool) {
    switch (eventType) {
    case CommandEventType.onClick:
      this.onClick(ev, event, tools);
      break;
    case CommandEventType.onDBClick:
      this.onDBClick(ev, event, tools);
      break;
    case CommandEventType.onRightClick:
      this.onRightClick(ev, event, tools);
      break;
    case CommandEventType.onDragStart:
      this.onDragStart(ev, event, tools);
      break;
    case CommandEventType.onDragMove:
      this.onDragMove(ev, event, tools);
      break;
    case CommandEventType.onDragEnd:
      this.onDragEnd(ev, event, tools);
      break;
    case CommandEventType.onPinchStart:
      this.onPinchStart(ev, event, tools);
      break;
    case CommandEventType.onPinch:
      this.onPinch(ev, event, tools);
      break;
    case CommandEventType.onPinchEnd:
      this.onPinchEnd(ev, event, tools);
      break;
    case CommandEventType.onRotateStart:
      this.onRotateStart(ev, event, tools);
      break;
    case CommandEventType.onRotate:
      this.onRotate(ev, event, tools);
      break;
    case CommandEventType.onRotateEnd:
      this.onRotateEnd(ev, event, tools);
      break;
    case CommandEventType.onPress:
      this.onPress(ev, event, tools);
      break;
    case CommandEventType.onPressUp:
      this.onPressUp(ev, event, tools);
      break;
    case CommandEventType.onHoverIn:
      this.onHoverIn(ev, event, tools);
      break;
    case CommandEventType.onHoverOut:
      this.onHoverOut(ev, event, tools);
      break;
    case CommandEventType.onCarriageMove:
      this.onCarriageMove(ev, event, tools);
      break;
    case CommandEventType.onCarriageEnd:
      this.onCarriageEnd(ev, event, tools);
      break;
    case CommandEventType.onZoom:
      this.onZoom(ev, event, tools);
      break;
    default: break;
    }
  }
}

export { BaseInteraction };
