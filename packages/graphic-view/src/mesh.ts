/* eslint-disable @typescript-eslint/member-ordering */
import { reactive, Reaction } from '@turbox3d/reactivity';
import { InteractiveConfig, SceneEvent, IViewEntity } from '@turbox3d/event-manager';
import { CommandEventType } from '@turbox3d/command-manager';
import { invariant } from '@turbox3d/shared';
import React from 'react';
import { SceneContext, BaseScene, SceneType } from './scene';
import { getMeshParent } from './utils';

export abstract class BaseMesh<Props extends Partial<IViewEntity>, State, ApplicationContext, Scene, Camera, Raycaster, Container extends DisplayObject, DisplayObject, Viewport, Point> extends React.PureComponent<Props, State, SceneContext<DisplayObject, Point>> {
  static contextType: React.Context<SceneContext<any, any>>;

  context: SceneContext<DisplayObject, Point>;

  /** 当前组件的视图对象 */
  protected view: DisplayObject;
  /** 视图对象的类型（有相机、灯光、模型三类，默认为 model） */
  protected viewType: 'camera' | 'light' | 'model' = 'model';

  /** 响应式的渲染任务管线，与 draw 互斥，有任务就不会执行 draw */
  protected reactivePipeLine: Function[] = [];

  /** 异步的任务管线是否并发。默认：true */
  protected isConcurrent = true;

  /** 是否默认添加到场景中。默认：true */
  protected autoAppendToWorld = true;

  /** 是否为可交互实体。默认：false */
  protected isViewEntity = false;

  /** 当前组件上层组件 */
  private parentMesh?: BaseMesh<Props, State, ApplicationContext, Scene, Camera, Raycaster, Container, DisplayObject, Viewport, Point> | BaseScene<ApplicationContext, Scene, Camera, Raycaster, Container, DisplayObject, Viewport>;

  private reactions: Reaction[] = [];

  private hasPipeLine = false;

  private interactiveTask: Reaction;

  constructor(props: Props) {
    super(props);
    this.view = this.createDefaultView();
    this.interactiveTask = reactive(() => {
      this.applyInteractive();
    });
  }

  async componentDidMount() {
    if (this.reactivePipeLine.length) {
      if (this.isConcurrent) {
        this.reactions = this.reactivePipeLine.map(task => reactive(() => task.call(this), {
          name: 'baseMeshReactivePipeLine',
          immediately: false,
        }));
      } else {
        for (let i = 0; i < this.reactivePipeLine.length; i++) {
          const task = this.reactivePipeLine[i];
          // eslint-disable-next-line no-await-in-loop
          await new Promise<void>((resolve) => {
            const r = reactive(async () => {
              await task.call(this);
              resolve();
            }, {
              name: 'baseMeshReactivePipeLine',
              immediately: false,
            });
            this.reactions.push(r);
          });
        }
      }
      this.hasPipeLine = true;
    }
    // 将视图添加到场景中
    this.appendToWorld();
    // 配置交互能力
    this.applyInteractive();
  }

  componentDidUpdate() {
    this.applyInteractive();
  }

  componentWillUnmount() {
    if (this.reactions.length) {
      this.reactions.forEach(reaction => reaction.dispose());
    }
    this.interactiveTask.dispose();
    // 删除交互配置
    this.context.updateInteractiveObject(this.view);
    // 移除视图
    this.removeFromWorld();
  }

  render() {
    this.clearView();
    this.draw();
    if (this.reactivePipeLine.length && this.hasPipeLine) {
      if (this.isConcurrent) {
        this.reactivePipeLine.forEach(task => task.call(this));
      } else {
        (async () => {
          for (let i = 0; i < this.reactivePipeLine.length; i++) {
            const task = this.reactivePipeLine[i];
            // eslint-disable-next-line no-await-in-loop
            await task.call(this);
          }
        })();
      }
    }
    return this.props.children || null;
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
    return this.isViewEntity;
  }

  /**
   * 标记当前对象是否可 Hover
   */
  protected onHoverable() {
    return this.isViewEntity;
  }

  /**
   * 标记当前对象是否可拖拽
   */
  protected onDraggable() {
    return this.isViewEntity;
  }

  protected onPinchable() {
    return this.isViewEntity;
  }

  protected onRotatable() {
    return this.isViewEntity;
  }

  protected onPressable() {
    return this.isViewEntity;
  }

  protected get interactiveConfig(): InteractiveConfig {
    const isClickable = this.onClickable();
    const isDraggable = this.onDraggable();
    const isHoverable = this.onHoverable();
    const isPinchable = this.onPinchable();
    const isRotatable = this.onRotatable();
    const isPressable = this.onPressable();

    return {
      getViewEntity: this.isViewEntity ? this.getViewEntity : undefined,
      onClick: this.isViewEntity ? this._on$Click : this.onClick.bind(this),
      onDBClick: this.isViewEntity ? this._on$DBClick : this.onDBClick.bind(this),
      onRightClick: this.isViewEntity ? this._on$RightClick : this.onRightClick.bind(this),
      onDragStart: this.isViewEntity ? this._on$DragStart : this.onDragStart.bind(this),
      onDragMove: this.isViewEntity ? this._on$DragMove : this.onDragMove.bind(this),
      onDragEnd: this.isViewEntity ? this._on$DragEnd : this.onDragEnd.bind(this),
      onPinchStart: this.isViewEntity ? this._on$PinchStart : this.onPinchStart.bind(this),
      onPinch: this.isViewEntity ? this._on$Pinch : this.onPinch.bind(this),
      onPinchEnd: this.isViewEntity ? this._on$PinchEnd : this.onPinchEnd.bind(this),
      onRotateStart: this.isViewEntity ? this._on$RotateStart : this.onRotateStart.bind(this),
      onRotate: this.isViewEntity ? this._on$Rotate : this.onRotate.bind(this),
      onRotateEnd: this.isViewEntity ? this._on$RotateEnd : this.onRotateEnd.bind(this),
      onPress: this.isViewEntity ? this._on$Press : this.onPress.bind(this),
      onPressUp: this.isViewEntity ? this._on$PressUp : this.onPressUp.bind(this),
      onHoverIn: this.isViewEntity ? this._on$HoverIn : this.onHoverIn.bind(this),
      onHoverOut: this.isViewEntity ? this._on$HoverOut : this.onHoverOut.bind(this),
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

  private getViewEntity = () => {
    const { id, type } = this.props;
    invariant(!!id && !!type, 'you should pass the {id} and {type} props while define as view entity');
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
    const commandBox = this.context.getCommandBox();
    const tools = this.context.getTools();

    if (commandBox) {
      const { id, type } = this.props;
      invariant(!!id && !!type, 'you should pass the {id} and {type} props while define as view entity');
      commandBox.distributeEvent(eventType, { id: id!, type: type! }, event, tools);
    }
  }

  /**
   * 将当前视图对象添加到视图中
   */
  private appendToWorld() {
    if (this.autoAppendToWorld) {
      const parent = getMeshParent(this);
      if (parent) {
        this.parentMesh = parent;
        const isCameraOrLight = (this.viewType === 'camera' || this.viewType === 'light');
        if (isCameraOrLight) {
          let parentNode = (parent as BaseMesh<Props, State, ApplicationContext, Scene, Camera, Raycaster, Container, DisplayObject, Viewport, Point> | BaseScene<ApplicationContext, Scene, Camera, Raycaster, Container, DisplayObject, Viewport> | undefined);
          while (parentNode && !(parentNode instanceof BaseScene && parentNode.sceneType === SceneType.Scene3D)) {
            parentNode = getMeshParent(parentNode);
          }
          if (parentNode && parentNode.scene) {
            this.addViewToScene(parentNode, this.view);
          }
        } else {
          parent.addChildView(this.view);
        }
      } else {
        console.warn('Cannot retrieve parent Mesh2D.');
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
    if (isClickable || isHoverable || isDraggable || isPinchable || isRotatable || isPressable) {
      this.context && this.context.updateInteractiveObject(this.view, this.interactiveConfig);
    } else {
      this.context && this.context.updateInteractiveObject(this.view);
    }
  }
}
