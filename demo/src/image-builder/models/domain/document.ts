import { DocumentSystem, EntityObject, Vec2, Vector2, mutation } from '@turbox3d/turbox';

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
    backgroundColor?: number;
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
      materialDirection: Vec2;
      attribute: ITextStyles & {
        [key: string]: any;
      };
    };
  }>;
}

export class DocumentDomain extends DocumentSystem {
  private sortedModels: EntityObject[] = [];

  /** 根据排好的顺序重置 renderOrder */
  private updateRenderOrder() {
    this.sortedModels.forEach((p, index) => {
      p.setRenderOrder(index);
    });
  }

  /** 根据已有的 renderOrder 来初始化 sortedModels 的排序 */
  private sortModels(models: EntityObject[]) {
    models.forEach(m => {
      this.sortedModels.push(m);
    });
    this.sortedModels.sort((a, b) => a.renderOrder - b.renderOrder);
  }

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

  getEntities() {
    return [...this.models.values()];
  }

  getFrameEntities() {
    return [...this.models.values()].filter(m => m instanceof FrameEntity) as FrameEntity[];
  }

  getItemEntities() {
    return [...this.models.values()].filter(m => m instanceof ItemEntity) as ItemEntity[];
  }

  @mutation
  async loadData(json: IDocumentData) {
    this.pauseRecord();
    const { container, items } = json;
    const frameEntity = await appCommandManager._shared.entity.addFrameEntity({
      size: { x: container.width, y: container.height },
      color: container.backgroundColor || GRAY,
    });
    const promises = items.map(async i => {
      if (i.type === ItemType.IMAGE) {
        const itemEntity = await appCommandManager._shared.entity.addItemEntity(i.data.src, undefined, true, false);
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
          materialDirection: new Vector2(i.data.materialDirection.x, i.data.materialDirection.y),
          href: i.data.href,
          attribute: i.data.attribute,
        });
        itemEntity.setRenderOrder(i.zIndex);
        this.sortModels([itemEntity]);
      } else if (i.type === ItemType.TEXT) {
        const textEntity = await appCommandManager._shared.entity.addTextItemEntity(i.data.content, undefined, true, false);
        textEntity.setSize({
          x: i.width,
          y: i.height,
        });
        textEntity.setPosition({
          x: frameEntity.position.x - container.width / 2 + i.left + textEntity.size.x / 2,
          y: frameEntity.position.y - container.height / 2 + i.top + textEntity.size.y / 2,
        });
        textEntity.$update({
          href: i.data.href,
          attribute: i.data.attribute,
        });
        textEntity.setRenderOrder(i.zIndex);
        this.sortModels([textEntity]);
      } else if (i.type === ItemType.BUTTON) {
        const buttonEntity = await appCommandManager._shared.entity.addButtonItemEntity(i.data.content, undefined, true, false);
        buttonEntity.setSize({
          x: i.width,
          y: i.height,
        });
        buttonEntity.setPosition({
          x: frameEntity.position.x - container.width / 2 + i.width / 2 + i.left,
          y: frameEntity.position.y - container.height / 2 + i.height / 2 + i.top,
        });
        buttonEntity.$update({
          href: i.data.href,
          attribute: i.data.attribute,
        });
        buttonEntity.setRenderOrder(i.zIndex);
        this.sortModels([buttonEntity]);
      }
    });
    await Promise.all(promises);
    this.updateRenderOrder();
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
        backgroundColor: container.bgColor,
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
            materialDirection: { x: i.materialDirection.x, y: i.materialDirection.y },
            attribute: {
              ...i.attribute,
            },
          },
        };
      }),
    };
  }
}
