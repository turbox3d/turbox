import { DocumentSystem, mutation, reactor, EntityObject, Vector2 } from '@turbox3d/turbox';

import { Z_INDEX_ACTION } from '../../common/consts/action';
import { FrameEntity } from '../entity/frame';
import { ITextStyles, ItemEntity } from '../entity/item';
import { appCommandManager } from '../../commands';
import { ItemType } from '../../common/consts/scene';
import { GRAY } from '../../common/consts/color';

export interface IDocumentData {
  container: {
    width: number;
    height: number;
  };
  items: Array<{
    type: ItemType;
    top: number;
    left: number;
    width: number;
    height: number;
    zIndex: number;
    data: {
      content: string;
      src: string;
      href: string;
      attribute: ITextStyles & {
        [key: string]: any;
      };
    };
  }>;
}

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
  }

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
    return [...this.models.values()].filter(m => m instanceof ItemEntity) as ItemEntity[];
  }

  async loadData(json: IDocumentData) {
    this.pauseRecord();
    const { container, items } = json;
    const frameEntity = await appCommandManager.actionsCommand.addFrameEntity({
      size: { x: container.width, y: container.height },
      color: GRAY,
    });
    await Promise.all(
      items.map(async i => {
        if (i.type === 'image') {
          const itemEntity = await appCommandManager.actionsCommand.addItemEntity(i.data.src);
          if (!itemEntity) {
            return;
          }
          itemEntity.setSize({
            x: i.width,
            y: i.height,
          });
          itemEntity.setPosition({
            x: frameEntity.position.x - container.width / 2 + i.width / 2 + i.left,
            y: frameEntity.position.y - container.height / 2 + i.height / 2 + i.top,
          });
          itemEntity.$update({
            href: i.data.href,
            attribute: i.data.attribute,
          });
          itemEntity.setRenderOrder(i.zIndex);
        } else if (i.type === 'text') {
          const textEntity = await appCommandManager.actionsCommand.addTextItemEntity(i.data.content);
          textEntity.setSize({
            x: i.width,
            y: i.height,
          });
          textEntity.setPosition({
            x: frameEntity.position.x - container.width / 2 + i.left,
            y: frameEntity.position.y - container.height / 2 + i.top,
          });
          textEntity.$update({
            href: i.data.href,
            attribute: i.data.attribute,
          });
          textEntity.setRenderOrder(i.zIndex);
        }
      })
    );
    this.resumeRecord();
  }

  dumpData(): IDocumentData | undefined {
    const container = this.getFrameEntities()[0];
    if (!container) {
      return;
    }
    const cp = new Vector2(container.position.x, container.position.y).subtracted(
      new Vector2(container.size.x / 2, container.size.y / 2)
    );
    const items = this.getItemEntities();
    return {
      container: {
        width: container.size.x,
        height: container.size.y,
      },
      items: items.map(i => {
        const pos = new Vector2(i.position.x, i.position.y)
          .subtracted(new Vector2(i.size.x / 2, i.size.y / 2))
          .subtracted(cp);
        return {
          type: i.itemType,
          top: pos.y,
          left: pos.x,
          width: i.size.x,
          height: i.size.y,
          zIndex: i.renderOrder,
          data: {
            content: i.text,
            src: i.resourceUrl,
            href: i.href,
            attribute: {
             ...i.attribute,
            },
          },
        };
      }),
    };
  }
}
