import { init, registerExternalBatchUpdate } from '@turbox3d/reactivity';
import { Component, PureComponent, ComponentProps } from './component';
import { Element, VirtualNode, render, batchUpdate, ElementSchema, g } from './render';
import { IdCustomType } from './common';
import { Reactive } from './reactive';
import { BaseMesh } from './mesh';
import { BaseScene, SceneContext, BaseSceneProps, ViewportInfo, ViewInfo, SceneType } from './scene';

init();
registerExternalBatchUpdate({
  handler: batchUpdate,
  idCustomType: IdCustomType,
});

export {
  Component,
  PureComponent,
  Element,
  ElementSchema,
  VirtualNode,
  render,
  g,
  batchUpdate,
  Reactive,
  BaseMesh,
  SceneContext,
  BaseScene,
  BaseSceneProps,
  ViewportInfo,
  ViewInfo,
  SceneType,
  ComponentProps,
};
