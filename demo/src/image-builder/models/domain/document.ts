import { DocumentSystem, mutation, reactor, EntityObject } from '@turbox3d/turbox';

import { Z_INDEX_ACTION } from '../../common/consts/action';
import { FrameEntity } from '../entity/frame';
import { ItemEntity } from '../entity/item';

export class DocumentDomain extends DocumentSystem {
  @reactor sortedModels: EntityObject[] = [];

  @mutation
  addModel(model: EntityObject | EntityObject[], sort = true) {
    const f = (m: EntityObject) => {
      super.addModel(m);
      if (sort) {
        this.sortedModels.push(m);
        this.updateRenderOrder();
      }
    };
    if (Array.isArray(model)) {
      model.forEach(m => f(m));
      return;
    }
    f(model);
  }

  @mutation
  removeModel(model: EntityObject | EntityObject[], sort = true) {
    const f = (m: EntityObject) => {
      super.removeModelById(m.id);
      if (sort) {
        const index = this.sortedModels.findIndex(p => p === m);
        this.sortedModels.splice(index, 1);
        this.updateRenderOrder();
      }
    };
    if (Array.isArray(model)) {
      model.forEach(m => f(m));
      return;
    }
    f(model);
  }

  /** 根据已有的 renderOrder 来初始化 sortedModels 的排序 */
  @mutation
  sortModels(models: EntityObject[]) {
    models.forEach(m => {
      this.sortedModels.push(m);
    });
    this.sortedModels.sort((a, b) => a.renderOrder - b.renderOrder);
  }

  /** 根据排好的顺序重置 renderOrder */
  @mutation
  updateRenderOrder() {
    this.sortedModels.forEach((p, index) => {
      p.setRenderOrder(index);
    });
  }

  @mutation
  updateRenderOrderByType(selected: EntityObject, type: Z_INDEX_ACTION) {
    const items = this.sortedModels;
    const index = items.findIndex(p => p === selected);
    if (type === Z_INDEX_ACTION.BOTTOM) {
      items.splice(index, 1);
      items.unshift(selected);
    } else if (type === Z_INDEX_ACTION.TOP) {
      items.splice(index, 1);
      items.push(selected);
    } else if (type === Z_INDEX_ACTION.INCREASE && index < items.length - 1) {
      items[index] = items[index + 1];
      items[index + 1] = selected;
    } else if (type === Z_INDEX_ACTION.DECREASE && index > 0) {
      items[index] = items[index - 1];
      items[index - 1] = selected;
    }
    this.updateRenderOrder();
  };

  @mutation
  getEntities() {
    return [...this.models.values()];
  }

  @mutation
  getFrameEntities() {
    return [...this.models.values()].filter(m => m instanceof FrameEntity);
  }

  @mutation
  getItemEntities() {
    return [...this.models.values()].filter(m => m instanceof ItemEntity);
  }
}
