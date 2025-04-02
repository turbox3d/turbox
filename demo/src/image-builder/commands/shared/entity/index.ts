import { mutation, EntityObject, Vec2, Command } from '@turbox3d/turbox';

import { appCommandManager } from '../../index';
import { loadImageElement } from '../../../common/utils/image';
import { FrameEntity } from '../../../models/entity/frame';
import { ItemEntity } from '../../../models/entity/item';
import { imageBuilderStore } from '../../../models/index';

import { Z_INDEX_ACTION } from '../../../common/consts/action';
import { ItemType, RenderOrder } from '../../../common/consts/scene';
import { GRAY, PRIMARY_COLOR, WHITE } from '../../../common/consts/color';

export class EntityCommand extends Command {
  @mutation
  addItemEntity = async <CustomBizData>(
    url: string,
    extraInfo?: CustomBizData,
    addToDocument = true,
    sort = true,
    specificId?: string
  ) => {
    const entity = new ItemEntity(specificId);
    const map = await loadImageElement(url).catch(err => {
      console.error(err);
    });
    if (!map) {
      return;
    }
    entity.$update({
      itemType: ItemType.IMAGE,
      imageData: map.element,
      resourceUrl: url,
    });
    if (extraInfo) {
      entity.$update({
        extraInfo,
      });
      entity.setName((extraInfo as any).name);
    }
    const ratio = map.width / map.height;
    const bgSize = imageBuilderStore.scene.sceneSize;
    entity.setSize({
      x: ratio > 1 ? bgSize.width / 6 : (bgSize.height / 6) * ratio,
      y: ratio > 1 ? bgSize.width / 6 / ratio : bgSize.height / 6,
    });
    if (addToDocument) {
      imageBuilderStore.document.addModel(entity, sort);
    }
    return entity;
  };

  @mutation
  addButtonItemEntity = async <CustomBizData>(
    text: string,
    extraInfo?: CustomBizData,
    addToDocument = true,
    sort = true,
    specificId?: string
  ) => {
    const entity = new ItemEntity(specificId);
    entity.$update({
      itemType: ItemType.BUTTON,
      text,
    });
    if (extraInfo) {
      entity.$update({
        extraInfo,
        attribute: {
          fontSize: 16,
          lineHeight: 1.5,
          fontFamily: 'Arial',
          color: WHITE,
          fontWeight: 'normal',
          align: 'center',
          wordWrap: false,
          wordWrapWidth: 375,
          fontStyle: 'normal',
          borderWidth: 0,
          borderColor: GRAY,
          backgroundColor: PRIMARY_COLOR,
          borderRadius: 5,
        },
      });
      entity.setName((extraInfo as any).name);
    }
    entity.setPosition({
      x: imageBuilderStore.scene.sceneSize.width / 2,
      y: imageBuilderStore.scene.sceneSize.height / 2,
    });
    entity.setSize({
      x: 160,
      y: 40,
    });
    if (addToDocument) {
      imageBuilderStore.document.addModel(entity, sort);
    }
    return entity;
  }

  @mutation
  addTextItemEntity = async <CustomBizData>(
    text: string,
    extraInfo?: CustomBizData,
    addToDocument = true,
    sort = true,
    specificId?: string
  ) => {
    const entity = new ItemEntity(specificId);
    entity.$update({
      itemType: ItemType.TEXT,
      text,
    });
    if (extraInfo) {
      entity.$update({
        extraInfo,
      });
      entity.setName((extraInfo as any).name);
    }
    // const ratio = 10;
    // const bgSize = imageBuilderStore.scene.sceneSize;
    entity.setPosition({
      x: imageBuilderStore.scene.sceneSize.width / 2,
      y: imageBuilderStore.scene.sceneSize.height / 2,
    });
    if (addToDocument) {
      imageBuilderStore.document.addModel(entity, sort);
    }
    return entity;
  };

  @mutation
  addFrameEntity = async ({
    size,
    color,
    texture = '',
    target,
  }: {
    size: Vec2;
    color?: number;
    texture?: string | Blob;
    target?: FrameEntity;
  }) => {
    const entity = target || new FrameEntity();
    entity.setRenderOrder(RenderOrder.BACKGROUND);
    entity.setSize(size);
    if (color || !target) {
      entity.$update({
        bgColor: color || WHITE,
      });
    }
    entity.setPosition({
      x: imageBuilderStore.scene.sceneSize.width / 2,
      y: imageBuilderStore.scene.sceneSize.height / 2,
    });
    if (texture) {
      const map = await loadImageElement(texture).catch(err => {
        console.error(err);
      });
      if (map) {
        entity.$update({
          imageData: map.element,
          resourceUrl: texture,
        });
      }
    }
    if (!target) {
      imageBuilderStore.document.addModel(entity, false);
    }
    return entity;
  };

  @mutation
  deleteEntity = (models?: EntityObject[], sort = true) => {
    if (models) {
      models.forEach(e => {
        imageBuilderStore.document.removeModel(e, sort);
      });
    } else {
      const selected = appCommandManager.default.select.getSelectedEntities();
      selected.forEach(e => {
        imageBuilderStore.document.removeModel(e, sort);
      });
    }
    appCommandManager.default.select.clearAllSelected();
  };

  /**
   * 替换
   * @param url 新素材的图片路径
   * @param target 被替换的目标模型
   * @param isSelf 是否替换自身，默认 false，会清空原 extraInfo 和 resourceUrl
   * @todo 按长边替换
   */
  @mutation()
  replaceItemEntity = async <CustomBizData>(
    url: string,
    target?: EntityObject,
    extraInfo?: CustomBizData,
    isSelf = false
  ) => {
    const selected = target || appCommandManager.default.select.getSelectedEntities()[0];
    if (!(selected instanceof ItemEntity)) {
      return;
    }
    const map = await loadImageElement(url).catch(err => {
      console.error(err);
    });
    if (!map) {
      return;
    }
    const ratio = map.element.width / map.element.height;
    const bgSize = imageBuilderStore.scene.sceneSize;
    if (!isSelf) {
      selected.setSize({
        x: ratio > 1 ? bgSize.width / 6 : (bgSize.height / 6) * ratio,
        y: ratio > 1 ? bgSize.width / 6 / ratio : bgSize.height / 6,
      });
    } else {
      selected.setSize({
        y: selected.size.x / ratio,
      });
    }
    selected.$update({
      imageData: map.element,
      snapped: false,
    });
    if (!isSelf) {
      selected.$update({
        resourceUrl: url,
      });
    }
    selected.$update({
      materialDirection: selected.materialDirection,
    });
    if (extraInfo) {
      selected.$update({
        extraInfo,
      });
      selected.setName((extraInfo as any).name);
    }
  };

  @mutation
  updateRenderOrder = (type: Z_INDEX_ACTION) => {
    const selected = appCommandManager.default.select.getSelectedEntities()[0];
    if (!(selected instanceof ItemEntity)) {
      return;
    }
    imageBuilderStore.document.updateRenderOrderByType(selected, type);
  };

  @mutation
  updateText = (text: string) => {
    const selected = appCommandManager.default.select.getSelectedEntities()[0];
    if (!(selected instanceof ItemEntity)) {
      return;
    }
    selected.$update({
      text,
    });
  }
}
