import { BaseMesh } from './mesh';
import { BaseScene } from './scene';

/**
 * 找寻类型为 BaseMesh | BaseScene 的上层组件
 * @param component
 */
export function getMeshParent(component: React.Component) {
  const fiber = (component as any)._reactInternalFiber;

  if (!fiber) {
    return;
  }

  let parent = fiber.return;

  while (parent) {
    if (parent.tag === 1) {
      const stateNode = parent.stateNode;
      if (stateNode && (stateNode instanceof BaseMesh || stateNode instanceof BaseScene)) {
        return stateNode;
      }
    }

    parent = parent.return;
  }
}
