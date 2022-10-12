import { BaseMesh, ComponentProps } from '@turbox3d/renderer-core';
import { Vec2 } from '@turbox3d/shared';
import * as PIXI from 'pixi.js';

export abstract class Mesh2D<Props extends object = {}> extends BaseMesh<Props, PIXI.Application, never, never, never, PIXI.Container, PIXI.DisplayObject, PIXI.Sprite, Vec2> {
  constructor(props = {} as ComponentProps<Props>) {
    super(props);
    if (this.view instanceof PIXI.Container) {
      this.view.sortableChildren = true;
    }
  }

  createDefaultView() {
    return new PIXI.Container();
  }

  addChildView(view: PIXI.DisplayObject) {
    if (this.view instanceof PIXI.Container) {
      this.view.addChild(view);
    }
  }

  clearView() {
    if (this.view instanceof PIXI.Graphics) {
      this.view.clear();
    }
  }

  removeFromWorld() {
    // 这里有可能因为父节点中主动触发了子节点的 destroy 方法，而导致无需在调用 destroy .(重复调用会报错)
    try {
      if (this.view instanceof PIXI.Container) {
        this.view.destroy({ children: false });
      } else {
        this.view.destroy();
      }
    } catch (e) {
      // 如果异常，也是该节点已经被卸载了，无需理会
      console.log('destroy error');
    }
  }

  setViewInteractive(interactive: boolean) {
    this.view.interactive = interactive;
  }

  addViewToScene() {
    //
  }
}
