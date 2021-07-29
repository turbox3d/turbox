import { CommandEventType } from '@turbox3d/command-manager';
import { IViewEntity, SceneMouseEvent } from '@turbox3d/event-manager';
import { Mesh3D } from './Mesh3D';

export abstract class ViewEntity3D<Props extends IViewEntity = IViewEntity, State = never> extends Mesh3D<Props, State> {
  protected onClickable() {
    return true;
  }

  protected onHoverable() {
    return true;
  }

  protected onDraggable() {
    return true;
  }

  protected get interactiveConfig() {
    const isClickable = this.onClickable();
    const isDraggable = this.onDraggable();
    const isHoverable = this.onHoverable();

    return {
      getViewEntity: this.getViewEntity,
      onClick: this._on$Click,
      onDBClick: this._on$DBClick,
      onRightClick: this._on$RightClick,
      dragStart: this._on$DragStart,
      dragMove: this._on$DragMove,
      dragEnd: this._on$DragEnd,
      onHoverIn: this._on$HoverIn,
      onHoverOut: this._on$HoverOut,
      isClickable,
      isDraggable,
      isHoverable,
    };
  }

  private getViewEntity = () => {
    const { id, type } = this.props;
    return { id, type };
  }

  private _on$Click = (event: SceneMouseEvent) => {
    this.forwardToCommand(CommandEventType.onClick, event);
    return this.onClick(event);
  };

  private _on$DBClick = (event: SceneMouseEvent) => {
    this.forwardToCommand(CommandEventType.onDBClick, event);
    return this.onDBClick(event);
  };

  private _on$RightClick = (event: SceneMouseEvent) => {
    this.forwardToCommand(CommandEventType.onRightClick, event);
    return this.onRightClick(event);
  }

  private _on$DragStart = (event: SceneMouseEvent) => {
    this.forwardToCommand(CommandEventType.onDragStart, event);
    return this.dragStart(event);
  };

  private _on$DragMove = (event: SceneMouseEvent) => {
    this.forwardToCommand(CommandEventType.onDragMove, event);
    return this.dragMove(event);
  };

  private _on$DragEnd = (event: SceneMouseEvent) => {
    this.forwardToCommand(CommandEventType.onDragEnd, event);
    return this.dragEnd(event);
  };

  private _on$HoverIn = (event: SceneMouseEvent) => {
    this.forwardToCommand(CommandEventType.onHoverIn, event);
    return this.onHoverIn(event);
  };

  private _on$HoverOut = (event: SceneMouseEvent) => {
    this.forwardToCommand(CommandEventType.onHoverOut, event);
    return this.onHoverOut(event);
  };

  /** 转发事件给CommandBox */
  private forwardToCommand(eventType: CommandEventType, event: SceneMouseEvent) {
    const commandBox = this.context.getCommandBox();
    const tools = this.context.getTools();

    if (commandBox) {
      const { id, type } = this.props;
      commandBox.distributeEvent(eventType, { id, type }, event, tools);
    }
  }
}
