import { invariant, remove, IConstructorOf, isPlainObject } from '@turbox3d/shared';
import { BaseScene } from './scene';
import { Component, ComponentProps } from './component';
import { BaseMesh } from './mesh';
import { NodeStatus, NodeTag } from './common';

export interface ElementSchema<P extends object = any> {
  type: IConstructorOf<Component<P>>;
  props?: ComponentProps<P>;
}

export type Element<P extends object = any> = ElementSchema<P> | undefined | boolean | null | number | string;

export class VirtualNode<P extends object = any> {
  instance?: Component<P>; // only root node can be undefined
  key?: string | number;
  child?: VirtualNode<P>;
  sibling?: VirtualNode<P>;
  parent?: VirtualNode<P>; // only root node can be undefined
  status: NodeStatus = NodeStatus.READY;
  tag: NodeTag = NodeTag.COMPONENT;
  props?: ComponentProps<P> = {} as ComponentProps<P>;
  committing = false;

  static isBatchUpdate = false;
  static batchQueue: Array<() => VirtualNode> = [];

  static buildNode(el: ElementSchema) {
    const node = new VirtualNode();
    node.props = el.props;
    const RenderComponent = el.type;
    const rc = new RenderComponent(el.props);
    if (rc instanceof BaseScene) {
      node.tag = NodeTag.SCENE;
    } else if (rc instanceof BaseMesh) {
      node.tag = NodeTag.MESH;
    }
    node.instance = rc;
    node.key = el.props?.key || undefined;
    rc._vNode = node;
    return node;
  }

  validate() {
    const childNodes = this.getChildren();
    const map = new Map<Function, Array<VirtualNode>>();
    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];
      if (!map.has(node.instance!.constructor)) {
        map.set(node.instance!.constructor, [node]);
      } else {
        const nodes = map.get(node.instance!.constructor);
        const keys = nodes?.map(n => n.key);
        // duplicate key
        invariant(
          !keys?.includes(node.key),
          node.key === void 0
            ? 'You must specific unique key encountered with the same child elements.'
            : `Encountered two child elements with the same key, ${node.key}. Keys should be unique.`
        );
        nodes?.push(node);
      }
    }
    return map;
  }

  link(elements: Element<any>[]) {
    const els = elements.filter(e => isPlainObject(e)) as ElementSchema<P>[];
    if (!els.length) {
      return;
    }
    this.child = els.reduceRight((previous, current) => {
      const node = VirtualNode.buildNode(current);
      node.sibling = previous;
      node.parent = this;
      return node;
    }, undefined);
    this.validate();
    return this.child;
  }

  create(singleNode = false) {
    this.instance!.componentWillMount();
    let child: VirtualNode | undefined;
    const children = this.instance!.render();
    if (children && children.length) {
      child = this.link(children);
    }
    if (child) {
      child.create();
    }
    if (VirtualNode.isBatchUpdate) {
      VirtualNode.batchQueue.push(() => this.commitCreate());
    } else {
      this.commitCreate();
    }
    if (singleNode) {
      return;
    }
    const sibling = this.sibling;
    if (!sibling) {
      return;
    }
    sibling.create();
  }

  commitCreate() {
    // create first, then delete
    if (this.status & NodeStatus.REMOVE) {
      return this;
    }
    if (this.instance instanceof BaseMesh) {
      this.instance.commit('create');
    }
    this.instance!.componentDidMount();
    return this;
  }

  getChildren() {
    if (!this.child) {
      return [] as VirtualNode<P>[];
    }
    const nodes = [this.child];
    let current = this.child;
    while (current.sibling) {
      nodes.push(current.sibling);
      current = current.sibling;
    }
    return nodes;
  }

  remove() {
    const childNodes = this.getChildren();
    if (childNodes.length) {
      childNodes.forEach(n => {
        n.status |= NodeStatus.REMOVE;
        n.remove();
      });
    }
    this.commitDelete();
  }

  commitDelete() {
    this.instance!.componentWillUnmount();
    if (this.instance instanceof BaseMesh) {
      this.instance.commit('delete');
    }
  }

  patch() {
    // apply remove first, then update or create by order.
    const childNodes = this.getChildren();
    if (!childNodes.length) {
      return;
    }
    childNodes.reduce((prev: VirtualNode | undefined, current) => {
      if (current.status & NodeStatus.REMOVE) {
        current.remove();
        if (prev === undefined) {
          this.child = current.sibling;
        } else {
          prev.sibling = current.sibling;
        }
        current.sibling = undefined;
        current.parent = undefined;
        return prev;
      }
      return current;
    }, undefined);
    const newChildNodes = this.getChildren();
    for (let index = 0; index < newChildNodes.length; index++) {
      const n = newChildNodes[index];
      if (n.status & NodeStatus.UPDATE) {
        n.update();
      } else if (n.status & NodeStatus.CREATE) {
        n.create(true);
      }
    }
  }

  resetStatus() {
    this.status = NodeStatus.READY;
    // const childNodes = this.getChildren();
    // childNodes.forEach(n => {
    //   n.status = NodeStatus.READY;
    // });
  }

  diff(elements: Element<P>[] | null) {
    const childNodes = this.getChildren();
    const els = elements && (elements.filter(e => isPlainObject(e)) as ElementSchema<P>[]);
    if (els && els.length) {
      const map = this.validate();
      let previous: VirtualNode | undefined;
      els.forEach(el => {
        const tempNodes = map.get(el.type);
        const keys = tempNodes?.map(n => n.key) || [];
        if (tempNodes && keys.includes(el.props?.key || undefined)) {
          // update
          const node = tempNodes.find(n => n.key === (el.props?.key || undefined));
          if (node) {
            const needUpdate = node.instance!.shouldComponentUpdate(el.props);
            node.status |= needUpdate ? NodeStatus.UPDATE : NodeStatus.FAKE_UPDATE;
            if (needUpdate) {
              const needUpdateInteractive = node.instance!.shouldComponentInteractiveUpdate(el.props);
              if (needUpdateInteractive) {
                node.status |= NodeStatus.UPDATE_INTERACTIVE;
              }
              const needUpdateCustomProps = node.instance!.shouldComponentCustomPropsUpdate(el.props);
              if (needUpdateCustomProps) {
                node.status |= NodeStatus.UPDATE_CUSTOM_PROPS;
              }
              node.props = el.props;
            }
            remove(tempNodes, node);
            previous = node;
          }
        } else {
          // create
          const node = VirtualNode.buildNode(el);
          node.status |= NodeStatus.CREATE;
          node.parent = this;
          if (!previous) {
            const tn = this.child;
            this.child = node;
            node.sibling = tn;
          } else {
            const tempNode = previous.sibling;
            previous.sibling = node;
            node.sibling = tempNode;
          }
        }
      });
      // remove
      [...map.values()].flat().forEach(n => {
        n.status |= NodeStatus.REMOVE;
      });
    } else {
      childNodes.forEach(n => {
        n.status |= NodeStatus.REMOVE;
      });
    }
  }

  update(isForce = false) {
    // combine batch update status, once the UPDATE status appears, continue to update
    if (!isForce && !(this.status & NodeStatus.UPDATE)) {
      return;
    }
    // delete first, then do not to update or create
    if (this.status & NodeStatus.REMOVE) {
      return;
    }
    this.instance!.componentWillUpdate(this.props);
    const prevProps = this.instance!.props;
    this.instance!.props = this.props || ({} as ComponentProps<P>);
    const elements = this.instance!.render();
    this.diff(elements);
    this.patch();
    if (VirtualNode.isBatchUpdate) {
      VirtualNode.batchQueue.push(() => this.commitUpdate(prevProps));
    } else {
      this.commitUpdate(prevProps);
      this.committing = false;
      this.resetStatus();
    }
  }

  commitUpdate(prevProps: ComponentProps<P>) {
    // update first, then delete
    if (this.status & NodeStatus.REMOVE) {
      return this;
    }
    if (this.instance instanceof BaseMesh) {
      const needUpdateInteractive = this.status & NodeStatus.UPDATE_INTERACTIVE;
      const needUpdateCustomProps = this.status & NodeStatus.UPDATE_CUSTOM_PROPS;
      this.instance.commit('update', {
        interactive: !!needUpdateInteractive,
        customProps: !!needUpdateCustomProps,
      });
    }
    this.instance!.componentDidUpdate(prevProps);
    return this;
  }

  getParentPath() {
    const path: VirtualNode[] = [];
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let t: VirtualNode = this;
    while (t.parent) {
      t = t.parent;
      path.unshift(t);
    }
    return path;
  }
}

export function render(elements: Element<any>[]) {
  const rootNode = new VirtualNode();
  rootNode.key = '@@TURBOX__RootNode';
  const child = rootNode.link(elements);
  if (child) {
    child.create();
  }
}

export function g<P extends object>(
  type: IConstructorOf<Component<P>>,
  props?: ComponentProps<P>
): ElementSchema<P> {
  return {
    type,
    props,
  };
}

export function batchUpdate(callback: () => void, finish?: () => void) {
  VirtualNode.isBatchUpdate = true;
  callback();
  const nodes: VirtualNode[] = [];
  // const waitUpdateQueue = VirtualNode.batchQueue.filter(n => !n.getParentPath().some(parent => VirtualNode.batchQueue.indexOf(parent) > -1));
  for (let index = 0; index < VirtualNode.batchQueue.length; index++) {
    const f = VirtualNode.batchQueue[index];
    const node = f();
    nodes.push(node);
  }
  nodes.forEach(n => {
    n.committing = false;
    n.resetStatus();
  });
  VirtualNode.isBatchUpdate = false;
  VirtualNode.batchQueue = [];
  finish && finish();
}
