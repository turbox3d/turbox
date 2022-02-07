import { Component } from './component';
import { NodeTag } from './common';

/**
 * 找寻类型为 BaseMesh | BaseScene 的上层组件
 * @param component
 */
export function getMeshParent(component: Component) {
  const vNode = component._vNode;

  if (!vNode) {
    return;
  }

  let parent = vNode.parent;

  while (parent) {
    if (parent && (parent.tag === NodeTag.SCENE || parent.tag === NodeTag.MESH)) {
      return parent.instance;
    }

    parent = parent.parent;
  }
}

export function getSceneParent(component: Component) {
  const vNode = component._vNode;

  if (!vNode) {
    return;
  }

  let parent = vNode.parent;

  while (parent) {
    if (parent && parent.tag === NodeTag.SCENE) {
      return parent.instance;
    }

    parent = parent.parent;
  }
}
