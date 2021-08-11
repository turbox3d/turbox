/* eslint-disable @typescript-eslint/member-ordering */
import { reactive, Reaction } from '@turbox3d/reactivity';
import { InteractiveConfig, SceneMouseEvent } from '@turbox3d/event-manager';
import React from 'react';
import { SceneContext, BaseScene, SceneType } from './scene';
import { getMeshParent } from './utils';

export abstract class BaseMesh<Props, State, ApplicationContext, Scene, Camera, Raycaster, Container extends DisplayObject, DisplayObject, Viewport, Point> extends React.PureComponent<Props, State, SceneContext<DisplayObject, Point>> {
  static contextType: React.Context<SceneContext<any, any>>;

  context: SceneContext<DisplayObject, Point>;

  /** 当前组件的视图对象 */
  protected view: DisplayObject;
  /** 视图对象的类型（有相机、灯光、模型三类，默认为 model） */
  protected viewType: 'camera' | 'light' | 'model' = 'model';

  /** 响应式的渲染任务管线，与 draw 互斥，有任务就不会执行 draw */
  protected reactivePipeLine: Function[] = [];

  /** 是否默认添加到场景中。默认：true */
  protected autoAppendToWorld = true;

  /** 当前组件上层组件 */
  private parentMesh?: BaseMesh<Props, State, ApplicationContext, Scene, Camera, Raycaster, Container, DisplayObject, Viewport, Point> | BaseScene<ApplicationContext, Scene, Camera, Raycaster, Container, DisplayObject, Viewport>;

  private reactions: Reaction[] = [];

  private hasPipeLine = false;

  constructor(props: Props) {
    super(props);
    this.view = this.createDefaultView();
  }

  componentDidMount() {
    if (this.reactivePipeLine.length) {
      this.reactions = this.reactivePipeLine.map(task => reactive(() => task.call(this), {
        name: 'baseMeshReactivePipeLine',
        immediately: false,
      }));
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
    // 删除交互配置
    this.context.updateInteractiveObject(this.view);
    // 移除视图
    this.removeFromWorld();
  }

  render() {
    this.clearView();
    this.draw();
    if (this.reactivePipeLine.length && this.hasPipeLine) {
      this.reactivePipeLine.forEach(task => task.call(this));
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
    return false;
  }

  /**
   * 标记当前对象是否可 Hover
   */
  protected onHoverable() {
    return false;
  }

  /**
   * 标记当前对象是否可拖拽
   */
  protected onDraggable() {
    return false;
  }

  protected get interactiveConfig(): InteractiveConfig {
    const isClickable = this.onClickable();
    const isDraggable = this.onDraggable();
    const isHoverable = this.onHoverable();

    return {
      onClick: this.onClick.bind(this),
      onDBClick: this.onDBClick.bind(this),
      onRightClick: this.onRightClick.bind(this),
      dragStart: this.dragStart.bind(this),
      dragMove: this.dragMove.bind(this),
      dragEnd: this.dragEnd.bind(this),
      onHoverIn: this.onHoverIn.bind(this),
      onHoverOut: this.onHoverOut.bind(this),
      isClickable,
      isDraggable,
      isHoverable,
    };
  }

  protected onClick(event: SceneMouseEvent) {
    //
  }

  protected onDBClick(event: SceneMouseEvent) {
    //
  }

  protected onRightClick(event: SceneMouseEvent) {
    //
  }

  protected dragStart(event: SceneMouseEvent) {
    //
  }

  protected dragMove(event: SceneMouseEvent) {
    //
  }

  protected dragEnd(event: SceneMouseEvent) {
    //
  }

  protected onHoverIn(event: SceneMouseEvent) {
    //
  }

  protected onHoverOut(event: SceneMouseEvent) {
    //
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
    this.setViewInteractive(isClickable || isHoverable || isDraggable);
    if (isClickable || isHoverable || isDraggable) {
      this.context.updateInteractiveObject(this.view, this.interactiveConfig);
    } else {
      this.context.updateInteractiveObject(this.view);
    }
  }
}
