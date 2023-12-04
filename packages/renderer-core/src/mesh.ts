/* eslint-disable react/no-deprecated */
import { reactive, Reaction } from '@turbox3d/reactivity';
import { InteractiveConfig, SceneEvent, ViewEntity, EventType } from '@turbox3d/event-manager';
import { CommandManager, SceneTool } from '@turbox3d/command-manager';
import { warn } from '@turbox3d/shared';
import { BaseScene, SceneType } from './scene';
import { PureComponent, ComponentProps } from './component';
import { getMeshParent } from './utils';

type CommitType = 'update' | 'create' | 'delete';

const WARN_TXT = 'Passing the {id} and {type} props or rewrite getViewEntity() is recommended while mesh component is interactive.';

export abstract class BaseMesh<
  Props extends object,
  ApplicationContext,
  Renderer,
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
      this.context.getSceneTools().updateInteractiveObject(this.view);
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
        /*
         * props上的属性值变了，会强制全部重新执行（因为可能存在非响应式属性传入的情况，导致pipeLine不会重新执行）
         * @todo props 和 pipeLine 同时都执行，需要合并
         */
        this.reactivePipeLine.forEach(task => task.call(this));
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
    this.context.getSceneTools().updateCursor(cursor);
  }

  /**
   * 恢复默认 cursor 状态
   */
  protected resetCursor() {
    this.context.getSceneTools().updateCursor();
  }

  /**
   * 标记当前对象是否可点击
   */
  protected onClickable() {
    return !!this.props.clickable;
  }

  /**
   * 标记当前对象是否可 Hover
   */
  protected onHoverable() {
    return !!this.props.hoverable;
  }

  /**
   * 标记当前对象是否可拖拽
   */
  protected onDraggable() {
    return !!this.props.draggable;
  }

  protected onPinchable() {
    return !!this.props.pinchable;
  }

  protected onRotatable() {
    return !!this.props.rotatable;
  }

  protected onPressable() {
    return !!this.props.pressable;
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

  protected onClick(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onClick && this.props.onClick(viewEntity, event, tools);
  }

  protected onDBClick(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onDBClick && this.props.onDBClick(viewEntity, event, tools);
  }

  protected onRightClick(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onRightClick && this.props.onRightClick(viewEntity, event, tools);
  }

  protected onDragStart(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onDragStart && this.props.onDragStart(viewEntity, event, tools);
  }

  protected onDragMove(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onDragMove && this.props.onDragMove(viewEntity, event, tools);
  }

  protected onDragEnd(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onDragEnd && this.props.onDragEnd(viewEntity, event, tools);
  }

  protected onPinchStart(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onPinchStart && this.props.onPinchStart(viewEntity, event, tools);
  }

  protected onPinch(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onPinch && this.props.onPinch(viewEntity, event, tools);
  }

  protected onPinchEnd(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onPinchEnd && this.props.onPinchEnd(viewEntity, event, tools);
  }

  protected onRotateStart(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onRotateStart && this.props.onRotateStart(viewEntity, event, tools);
  }

  protected onRotate(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onRotate && this.props.onRotate(viewEntity, event, tools);
  }

  protected onRotateEnd(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onRotateEnd && this.props.onRotateEnd(viewEntity, event, tools);
  }

  protected onPress(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onPress && this.props.onPress(viewEntity, event, tools);
  }

  protected onPressUp(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onPressUp && this.props.onPressUp(viewEntity, event, tools);
  }

  protected onHoverIn(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onHoverIn && this.props.onHoverIn(viewEntity, event, tools);
  }

  protected onHoverOut(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    this.props.onHoverOut && this.props.onHoverOut(viewEntity, event, tools);
  }

  protected getViewEntity(): Partial<ViewEntity> {
    const { id, type } = this.props;
    const isClickable = this.onClickable();
    const isDraggable = this.onDraggable();
    const isHoverable = this.onHoverable();
    const isPinchable = this.onPinchable();
    const isRotatable = this.onRotatable();
    const isPressable = this.onPressable();
    if ((isClickable || isHoverable || isDraggable || isPinchable || isRotatable || isPressable) && (id === void 0 || type === void 0)) {
      warn(WARN_TXT);
    }
    return { id, type };
  }

  private _on$Click = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onClick, viewEntity as ViewEntity, event, tools);
    }
    return this.onClick(viewEntity, event, tools);
  };

  private _on$DBClick = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onDBClick, viewEntity as ViewEntity, event, tools);
    }
    return this.onDBClick(viewEntity, event, tools);
  };

  private _on$RightClick = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onRightClick, viewEntity as ViewEntity, event, tools);
    }
    return this.onRightClick(viewEntity, event, tools);
  };

  private _on$DragStart = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onDragStart, viewEntity as ViewEntity, event, tools);
    }
    return this.onDragStart(viewEntity, event, tools);
  };

  private _on$DragMove = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onDragMove, viewEntity as ViewEntity, event, tools);
    }
    return this.onDragMove(viewEntity, event, tools);
  };

  private _on$DragEnd = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onDragEnd, viewEntity as ViewEntity, event, tools);
    }
    return this.onDragEnd(viewEntity, event, tools);
  };

  private _on$PinchStart = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onPinchStart, viewEntity as ViewEntity, event, tools);
    }
    return this.onPinchStart(viewEntity, event, tools);
  };

  private _on$Pinch = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onPinch, viewEntity as ViewEntity, event, tools);
    }
    return this.onPinch(viewEntity, event, tools);
  };

  private _on$PinchEnd = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onPinchEnd, viewEntity as ViewEntity, event, tools);
    }
    return this.onPinchEnd(viewEntity, event, tools);
  };

  private _on$RotateStart = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onRotateStart, viewEntity as ViewEntity, event, tools);
    }
    return this.onRotateStart(viewEntity, event, tools);
  };

  private _on$Rotate = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onRotate, viewEntity as ViewEntity, event, tools);
    }
    return this.onRotate(viewEntity, event, tools);
  };

  private _on$RotateEnd = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onRotateEnd, viewEntity as ViewEntity, event, tools);
    }
    return this.onRotateEnd(viewEntity, event, tools);
  };

  private _on$Press = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onPress, viewEntity as ViewEntity, event, tools);
    }
    return this.onPress(viewEntity, event, tools);
  };

  private _on$PressUp = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onPressUp, viewEntity as ViewEntity, event, tools);
    }
    return this.onPressUp(viewEntity, event, tools);
  };

  private _on$HoverIn = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onHoverIn, viewEntity as ViewEntity, event, tools);
    }
    return this.onHoverIn(viewEntity, event, tools);
  };

  private _on$HoverOut = (event: SceneEvent) => {
    const tools = this.context.getSceneTools();
    const viewEntity = this.getViewEntity();
    if (viewEntity.id !== void 0 && viewEntity.type !== void 0) {
      this.forwardToCommand(EventType.onHoverOut, viewEntity as ViewEntity, event, tools);
    }
    return this.onHoverOut(viewEntity, event, tools);
  };

  /** 转发事件给CommandManager */
  private forwardToCommand(eventType: EventType, viewEntity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    const commandMgr = this.context.getCommandManager() as CommandManager;
    if (commandMgr) {
      commandMgr.distributeEvent(eventType, viewEntity, event, tools);
    }
  }

  /**
   * 将当前视图对象添加到视图中
   */
  private appendToWorld() {
    if (this.autoAppendToWorld) {
      let parent = getMeshParent(this) as
        | BaseMesh<Props, ApplicationContext, Renderer, Scene, Camera, Raycaster, Container, DisplayObject, Viewport, Point>
        | BaseScene<ApplicationContext, Renderer, Scene, Camera, Raycaster, Container, DisplayObject, Viewport>
        | undefined;
      if (parent) {
        const isCameraOrLight = this.viewType === 'camera' || this.viewType === 'light';
        if (isCameraOrLight) {
          while (parent && !(parent instanceof BaseScene && parent.sceneType === SceneType.Scene3D)) {
            parent = getMeshParent(parent) as
              | BaseMesh<Props, ApplicationContext, Renderer, Scene, Camera, Raycaster, Container, DisplayObject, Viewport, Point>
              | BaseScene<ApplicationContext, Renderer, Scene, Camera, Raycaster, Container, DisplayObject, Viewport>
              | undefined;
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
  abstract addViewToScene(
    scene: BaseScene<ApplicationContext, Renderer, Scene, Camera, Raycaster, Container, DisplayObject, Viewport>,
    view: DisplayObject
  ): void;

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
      this.context && this.context.getSceneTools().updateInteractiveObject(this.view, this.interactiveConfig);
    } else {
      this.context && this.context.getSceneTools().updateInteractiveObject(this.view);
    }
  }
}
