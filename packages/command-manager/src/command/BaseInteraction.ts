import { IViewEntity, SceneEvent } from '@turbox3d/event-manager';
import { CommandEventType, ITool } from './type';

class BaseInteraction {
  protected onClick(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onDBClick(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onRightClick(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onDragStart(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onDragMove(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onDragEnd(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onPinchStart(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onPinch(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onPinchEnd(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onRotateStart(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onRotate(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onRotateEnd(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onPress(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onPressUp(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onHoverIn(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onHoverOut(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onCarriageMove(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  protected onCarriageEnd(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  /**
   * 画布的缩放事件
   */
  protected onZoom(entity: IViewEntity, event: SceneEvent, tools: ITool) {
    //
  }

  /**
   * 将交互事件分发给自身的回调函数处理
   */
  protected distributeToSelf(eventType: CommandEventType, ev: IViewEntity, event: SceneEvent, tools: ITool) {
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
