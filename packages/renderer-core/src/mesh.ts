/* eslint-disable react/no-deprecated */
/* eslint-disable @typescript-eslint/member-ordering */
import { reactive, Reaction } from '@turbox3d/reactivity';
import { InteractiveConfig, SceneEvent, IViewEntity } from '@turbox3d/event-manager';
import { BaseCommandBox, CommandEventType } from '@turbox3d/command-manager';
import { invariant } from '@turbox3d/shared';
import { BaseScene, SceneType } from './scene';
import { PureComponent, ComponentProps } from './component';
import { getMeshParent } from './utils';

type CommitType = 'update' | 'create' | 'delete';

export abstract class BaseMesh<Props extends object, ApplicationContext, Scene, Camera, Raycaster, Container extends DisplayObject, DisplayObject, Viewport, Point> extends PureComponent<Props> {
  /** 当前组件的视图对象 */
  protected view: DisplayObject;
  /** 视图对象的类型（有相机、灯光、模型三类，默认为 model） */
  protected viewType: 'camera' | 'light' | 'model' = 'model';
  /** 响应式的渲染任务管线 */
  protected reactivePipeLine: Array<() => void> = [];
  /** 是否默认添加到场景中。默认：true */
  protected autoAppendToWorld = true;
  /** 是否可交互。默认：false */
  protected isInteractive = false;

  private reactions: Reaction[] = [];
  private interactiveTask: Reaction;

  constructor(props = {} as ComponentProps<Props>) {
    super(props);
    this.view = this.createDefaultView();
    this.interactiveTask = reactive(() => {
      this.applyInteractive();
    });
  }

  commit(type: CommitType) {
    if (type === 'delete') {
      if (this.reactions.length) {
        this.reactions.forEach(reaction => reaction.dispose());
      }
      this.interactiveTask.dispose();
      // 删除交互配置
      this.context.updateInteractiveObject(this.view);
      // 移除视图
      this.removeFromWorld();
      return;
    }
    const isCreate = type === 'create';
    if (!isCreate) {
      if (this._vNode.committing) {
        return;
      }
      this._vNode.committing = true;
    }
    this.clearView();
    this.draw();
    if (this.reactivePipeLine.length) {
      if (isCreate) {
        this.reactions = this.reactivePipeLine.map(task => reactive(() => task.call(this), {
          name: 'baseMeshReactivePipeLine',
          immediately: false,
        }));
      } else {
        // this.reactivePipeLine.forEach(task => task.call(this));
      }
    }
    if (isCreate) {
      // 将视图添加到场景中
      this.appendToWorld();
    }
    // 配置交互能力
    this.applyInteractive();
  }

  abstract createDefaultView(): DisplayObject;

  /**
   * 提供接口用以给子组件添加 view
   */
  abstract addChildView(view: DisplayObject): void;

  /**
   * 绘制图形图像，默认在 componentDidMount 时调用
   */
  protected draw(): void {
    //
  }

  /**
   * 设置当前 cursor 状态
   *
   * @param cursor
   */
  protected updateCursor(cursor: string) {
    this.context.updateCursor(cursor);
  }

  /**
   * 恢复默认 cursor 状态
   */
  protected resetCursor() {
    this.context.updateCursor();
  }

  /**
   * 标记当前对象是否可点击
   */
  protected onClickable() {
    return this.isInteractive;
  }

  /**
   * 标记当前对象是否可 Hover
   */
  protected onHoverable() {
    return this.isInteractive;
  }

  /**
   * 标记当前对象是否可拖拽
   */
  protected onDraggable() {
    return this.isInteractive;
  }

  protected onPinchable() {
    return this.isInteractive;
  }

  protected onRotatable() {
    return this.isInteractive;
  }

  protected onPressable() {
    return this.isInteractive;
  }

  protected get interactiveConfig(): InteractiveConfig {
    const isClickable = this.onClickable();
    const isDraggable = this.onDraggable();
    const isHoverable = this.onHoverable();
    const isPinchable = this.onPinchable();
    const isRotatable = this.onRotatable();
    const isPressable = this.onPressable();

    return {
      getViewEntity: this.getViewEntity.bind(this),
      onClick: this._on$Click,
      onDBClick: this._on$DBClick,
      onRightClick: this._on$RightClick,
      onDragStart: this._on$DragStart,
      onDragMove: this._on$DragMove,
      onDragEnd: this._on$DragEnd,
      onPinchStart: this._on$PinchStart,
      onPinch: this._on$Pinch,
      onPinchEnd: this._on$PinchEnd,
      onRotateStart: this._on$RotateStart,
      onRotate: this._on$Rotate,
      onRotateEnd: this._on$RotateEnd,
      onPress: this._on$Press,
      onPressUp: this._on$PressUp,
      onHoverIn: this._on$HoverIn,
      onHoverOut: this._on$HoverOut,
      isClickable,
      isDraggable,
      isHoverable,
      isPinchable,
      isRotatable,
      isPressable,
    };
  }

  protected onClick(event: SceneEvent) {
    //
  }

  protected onDBClick(event: SceneEvent) {
    //
  }

  protected onRightClick(event: SceneEvent) {
    //
  }

  protected onDragStart(event: SceneEvent) {
    //
  }

  protected onDragMove(event: SceneEvent) {
    //
  }

  protected onDragEnd(event: SceneEvent) {
    //
  }

  protected onPinchStart(event: SceneEvent) {
    //
  }

  protected onPinch(event: SceneEvent) {
    //
  }

  protected onPinchEnd(event: SceneEvent) {
    //
  }

  protected onRotateStart(event: SceneEvent) {
    //
  }

  protected onRotate(event: SceneEvent) {
    //
  }

  protected onRotateEnd(event: SceneEvent) {
    //
  }

  protected onPress(event: SceneEvent) {
    //
  }

  protected onPressUp(event: SceneEvent) {
    //
  }

  protected onHoverIn(event: SceneEvent) {
    //
  }

  protected onHoverOut(event: SceneEvent) {
    //
  }

  protected getViewEntity(): IViewEntity {
    const { id, type } = this.props;
    const isClickable = this.onClickable();
    const isDraggable = this.onDraggable();
    const isHoverable = this.onHoverable();
    const isPinchable = this.onPinchable();
    const isRotatable = this.onRotatable();
    const isPressable = this.onPressable();
    if (isClickable || isHoverable || isDraggable || isPinchable || isRotatable || isPressable) {
      invariant(!!id && !!type, 'you should pass the {id} and {type} props or rewrite getViewEntity() while mesh component is interactive.');
    }
    return { id: id!, type: type! };
  }

  private _on$Click = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onClick, event);
    return this.onClick(event);
  };

  private _on$DBClick = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onDBClick, event);
    return this.onDBClick(event);
  };

  private _on$RightClick = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onRightClick, event);
    return this.onRightClick(event);
  }

  private _on$DragStart = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onDragStart, event);
    return this.onDragStart(event);
  };

  private _on$DragMove = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onDragMove, event);
    return this.onDragMove(event);
  };

  private _on$DragEnd = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onDragEnd, event);
    return this.onDragEnd(event);
  };

  private _on$PinchStart = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onPinchStart, event);
    return this.onPinchStart(event);
  };

  private _on$Pinch = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onPinch, event);
    return this.onPinch(event);
  };

  private _on$PinchEnd = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onPinchEnd, event);
    return this.onPinchEnd(event);
  };

  private _on$RotateStart = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onRotateStart, event);
    return this.onRotateStart(event);
  };

  private _on$Rotate = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onRotate, event);
    return this.onRotate(event);
  };

  private _on$RotateEnd = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onRotateEnd, event);
    return this.onRotateEnd(event);
  };

  private _on$Press = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onPress, event);
    return this.onPress(event);
  };

  private _on$PressUp = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onPressUp, event);
    return this.onPressUp(event);
  };

  private _on$HoverIn = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onHoverIn, event);
    return this.onHoverIn(event);
  };

  private _on$HoverOut = (event: SceneEvent) => {
    this.forwardToCommand(CommandEventType.onHoverOut, event);
    return this.onHoverOut(event);
  };

  /** 转发事件给CommandBox */
  private forwardToCommand(eventType: CommandEventType, event: SceneEvent) {
    const commandBox = this.context.getCommandBox() as BaseCommandBox;
    const tools = this.context.getTools();

    if (commandBox) {
      const viewEntity = this.getViewEntity();
      commandBox.distributeEvent(eventType, viewEntity, event, tools);
    }
  }

  /**
   * 将当前视图对象添加到视图中
   */
  private appendToWorld() {
    if (this.autoAppendToWorld) {
      let parent = getMeshParent(this) as BaseMesh<Props, ApplicationContext, Scene, Camera, Raycaster, Container, DisplayObject, Viewport, Point> | BaseScene<ApplicationContext, Scene, Camera, Raycaster, Container, DisplayObject, Viewport> | undefined;
      if (parent) {
        const isCameraOrLight = (this.viewType === 'camera' || this.viewType === 'light');
        if (isCameraOrLight) {
          while (parent && !(parent instanceof BaseScene && parent.sceneType === SceneType.Scene3D)) {
            parent = getMeshParent(parent) as BaseMesh<Props, ApplicationContext, Scene, Camera, Raycaster, Container, DisplayObject, Viewport, Point> | BaseScene<ApplicationContext, Scene, Camera, Raycaster, Container, DisplayObject, Viewport> | undefined;
          }
          if (parent && parent.scene) {
            this.addViewToScene(parent, this.view);
          }
        } else {
          parent.addChildView(this.view);
        }
      } else {
        console.warn('Cannot retrieve parent Mesh or Scene.');
      }
    }
  }

  /** 往场景中添加对象 */
  abstract addViewToScene(scene: BaseScene<ApplicationContext, Scene, Camera, Raycaster, Container, DisplayObject, Viewport>, view: DisplayObject): void;

  /**
   * 清除当前视图
   */
  abstract clearView(): void;

  /**
   * 从世界中移除当前对象
   */
  abstract removeFromWorld(): void;

  /** 设置视图是否可交互 */
  abstract setViewInteractive(interactive: boolean): void;

  /**
   * 激活视图对象的交互状态，并更新交互配置
   */
  private applyInteractive() {
    const isClickable = this.onClickable();
    const isDraggable = this.onDraggable();
    const isHoverable = this.onHoverable();
    const isPinchable = this.onPinchable();
    const isRotatable = this.onRotatable();
    const isPressable = this.onPressable();
    this.setViewInteractive(isClickable || isHoverable || isDraggable || isPinchable || isRotatable || isPressable);
    if (!this._vNode) {
      return;
    }
    if (isClickable || isHoverable || isDraggable || isPinchable || isRotatable || isPressable) {
      this.context && this.context.updateInteractiveObject(this.view, this.interactiveConfig);
    } else {
      this.context && this.context.updateInteractiveObject(this.view);
    }
  }
}
