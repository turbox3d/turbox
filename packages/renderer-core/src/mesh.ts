/* eslint-disable react/no-deprecated */
/* eslint-disable @typescript-eslint/member-ordering */
import { reactive, Reaction } from '@turbox3d/reactivity';
import { InteractiveConfig, SceneEvent, IViewEntity } from '@turbox3d/event-manager';
import { BaseCommandBox, CommandEventType, ITool } from '@turbox3d/command-manager';
import { warn } from '@turbox3d/shared';
import { BaseScene, SceneType } from './scene';
import { PureComponent, ComponentProps } from './component';
import { getMeshParent } from './utils';

type CommitType = 'update' | 'create' | 'delete';

const WARN_TXT =
  'Passing the {id} and {type} props or rewrite getViewEntity() is recommended while mesh component is interactive.';

export abstract class BaseMesh<
  Props extends object,
  ApplicationContext,
  Scene,
  Camera,
  Raycaster,
  Container extends DisplayObject,
  DisplayObject,
  Viewport,
  Point
> extends PureComponent<Props> {
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
        this.reactions = this.reactivePipeLine.map(task =>
          reactive(() => task.call(this), {
            name: 'baseMeshReactivePipeLine',
            immediately: false,
          })
        );
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

  protected onClick(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onClick && this.props.onClick(viewEntity, event, tools);
  }

  protected onDBClick(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onDBClick && this.props.onDBClick(viewEntity, event, tools);
  }

  protected onRightClick(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onRightClick && this.props.onRightClick(viewEntity, event, tools);
  }

  protected onDragStart(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onDragStart && this.props.onDragStart(viewEntity, event, tools);
  }

  protected onDragMove(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onDragMove && this.props.onDragMove(viewEntity, event, tools);
  }

  protected onDragEnd(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onDragEnd && this.props.onDragEnd(viewEntity, event, tools);
  }

  protected onPinchStart(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onPinchStart && this.props.onPinchStart(viewEntity, event, tools);
  }

  protected onPinch(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onPinch && this.props.onPinch(viewEntity, event, tools);
  }

  protected onPinchEnd(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onPinchEnd && this.props.onPinchEnd(viewEntity, event, tools);
  }

  protected onRotateStart(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onRotateStart && this.props.onRotateStart(viewEntity, event, tools);
  }

  protected onRotate(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onRotate && this.props.onRotate(viewEntity, event, tools);
  }

  protected onRotateEnd(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onRotateEnd && this.props.onRotateEnd(viewEntity, event, tools);
  }

  protected onPress(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onPress && this.props.onPress(viewEntity, event, tools);
  }

  protected onPressUp(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onPressUp && this.props.onPressUp(viewEntity, event, tools);
  }

  protected onHoverIn(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onHoverIn && this.props.onHoverIn(viewEntity, event, tools);
  }

  protected onHoverOut(viewEntity: Partial<IViewEntity>, event: SceneEvent, tools: ITool) {
    this.props.onHoverOut && this.props.onHoverOut(viewEntity, event, tools);
  }

  protected getViewEntity(): Partial<IViewEntity> {
    const { id, type } = this.props;
    const isClickable = this.onClickable();
    const isDraggable = this.onDraggable();
    const isHoverable = this.onHoverable();
    const isPinchable = this.onPinchable();
    const isRotatable = this.onRotatable();
    const isPressable = this.onPressable();
    if (
      (isClickable || isHoverable || isDraggable || isPinchable || isRotatable || isPressable) &&
      (id === void 0 || type === void 0)
    ) {
      warn(WARN_TXT);
    }
    return { id, type };
  }

  private _on$Click = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onClick, viewEntity as IViewEntity, event, tools);
    }
    return this.onClick(viewEntity, event, tools);
  };

  private _on$DBClick = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onDBClick, viewEntity as IViewEntity, event, tools);
    }
    return this.onDBClick(viewEntity, event, tools);
  };

  private _on$RightClick = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onRightClick, viewEntity as IViewEntity, event, tools);
    }
    return this.onRightClick(viewEntity, event, tools);
  };

  private _on$DragStart = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onDragStart, viewEntity as IViewEntity, event, tools);
    }
    return this.onDragStart(viewEntity, event, tools);
  };

  private _on$DragMove = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onDragMove, viewEntity as IViewEntity, event, tools);
    }
    return this.onDragMove(viewEntity, event, tools);
  };

  private _on$DragEnd = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onDragEnd, viewEntity as IViewEntity, event, tools);
    }
    return this.onDragEnd(viewEntity, event, tools);
  };

  private _on$PinchStart = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onPinchStart, viewEntity as IViewEntity, event, tools);
    }
    return this.onPinchStart(viewEntity, event, tools);
  };

  private _on$Pinch = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onPinch, viewEntity as IViewEntity, event, tools);
    }
    return this.onPinch(viewEntity, event, tools);
  };

  private _on$PinchEnd = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onPinchEnd, viewEntity as IViewEntity, event, tools);
    }
    return this.onPinchEnd(viewEntity, event, tools);
  };

  private _on$RotateStart = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onRotateStart, viewEntity as IViewEntity, event, tools);
    }
    return this.onRotateStart(viewEntity, event, tools);
  };

  private _on$Rotate = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onRotate, viewEntity as IViewEntity, event, tools);
    }
    return this.onRotate(viewEntity, event, tools);
  };

  private _on$RotateEnd = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onRotateEnd, viewEntity as IViewEntity, event, tools);
    }
    return this.onRotateEnd(viewEntity, event, tools);
  };

  private _on$Press = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onPress, viewEntity as IViewEntity, event, tools);
    }
    return this.onPress(viewEntity, event, tools);
  };

  private _on$PressUp = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onPressUp, viewEntity as IViewEntity, event, tools);
    }
    return this.onPressUp(viewEntity, event, tools);
  };

  private _on$HoverIn = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onHoverIn, viewEntity as IViewEntity, event, tools);
    }
    return this.onHoverIn(viewEntity, event, tools);
  };

  private _on$HoverOut = (event: SceneEvent) => {
    const tools = this.context.getTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(CommandEventType.onHoverOut, viewEntity as IViewEntity, event, tools);
    }
    return this.onHoverOut(viewEntity, event, tools);
  };

  /** 转发事件给CommandBox */
  private forwardToCommand(eventType: CommandEventType, viewEntity: IViewEntity, event: SceneEvent, tools: ITool) {
    const commandBox = this.context.getCommandBox() as BaseCommandBox;
    if (commandBox) {
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
