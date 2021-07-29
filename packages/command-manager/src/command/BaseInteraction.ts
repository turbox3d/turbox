import { IViewEntity, SceneMouseEvent } from '@turbox3d/event-manager';
import { CommandEventType, ITool } from './type';

class BaseInteraction {
  protected onClick(entity: IViewEntity, event: SceneMouseEvent, tools: ITool) {
    //
  }

  protected onDBClick(entity: IViewEntity, event: SceneMouseEvent, tools: ITool) {
    //
  }

  protected onRightClick(entity: IViewEntity, event: SceneMouseEvent, tools: ITool) {
    //
  }

  protected onDragStart(entity: IViewEntity, event: SceneMouseEvent, tools: ITool) {
    //
  }

  protected onDragMove(entity: IViewEntity, event: SceneMouseEvent, tools: ITool) {
    //
  }

  protected onDragEnd(entity: IViewEntity, event: SceneMouseEvent, tools: ITool) {
    //
  }

  protected onHoverIn(entity: IViewEntity, event: SceneMouseEvent, tools: ITool) {
    //
  }

  protected onHoverOut(entity: IViewEntity, event: SceneMouseEvent, tools: ITool) {
    //
  }

  protected onCarriageMove(entity: IViewEntity, event: SceneMouseEvent, tools: ITool) {
    //
  }

  protected onCarriageEnd(entity: IViewEntity, event: SceneMouseEvent, tools: ITool) {
    //
  }

  /**
   * 画布的缩放事件
   */
  protected onZoom(tools: ITool) {
    //
  }

  /**
   * 将交互事件分发给自身的回调函数处理
   */
  protected distributeToSelf(eventType: CommandEventType, ev: IViewEntity, event: SceneMouseEvent, tools: ITool) {
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
      this.onZoom(tools);
      break;
    default: break;
    }
  }
}

export { BaseInteraction };
