import { init, registerExternalBatchUpdate } from '@turbox3d/reactivity';
import { Component, PureComponent } from './component';
import { Element, VirtualNode, render, batchUpdate } from './render';
import { IdCustomType } from './common';
import { Reactive } from './reactive';
import { BaseMesh } from './mesh';
import { BaseScene, SceneContext, BaseSceneProps, IViewportInfo, IViewInfo, SceneType } from './scene';

init();
registerExternalBatchUpdate({
  handler: batchUpdate,
  idCustomType: IdCustomType,
});

export {
  Component,
  PureComponent,
  Element,
  VirtualNode,
  render,
  batchUpdate,
  Reactive,
  BaseMesh,
  SceneContext,
  BaseScene,
  BaseSceneProps,
  IViewportInfo,
  IViewInfo,
  SceneType,
};
