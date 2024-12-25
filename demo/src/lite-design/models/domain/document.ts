import * as THREE from 'three';

import { DocumentSystem, EntityObject, mutation, reactor, Vector2, MathUtils } from '@turbox3d/turbox';

import { Z_INDEX_ACTION } from '../../common/consts/scene';
import { EntityCategory } from '../../utils/category';
import { coordinateStringToArray } from '../../utils/common';
import { convertUrl, loadImageElement } from '../../utils/image';
import { AssemblyEntity } from '../entity/assembly';
import { BackgroundEntity } from '../entity/background';
import { ProductEntity } from '../entity/product';
import { SkewPointEntity } from '../entity/skewPoint';
import { SkyBoxEntity } from '../entity/skyBox';
import { ldeStore } from '../index';

const DataTypeId = 'lite-design-engine';

export interface DocumentItemJSON {
  bounds: string;
  skew: {
    leftTop?: string;
    rightTop?: string;
    rightBottom?: string;
    leftBottom?: string;
  };
  objId: string;
  cutoutData?: {
    cutoutSize?: string;
    cutoutUrl?: string;
    sourceUrl?: string;
    resizeRatio?: number;
    sourceSize?: string;
    margin?: string;
  };
  imageUrl: string;
  skewOriginalUrl?: string;
  cutoutOriginalUrl?: string;
  cutoutUrl?: string;
  finialImgUrl: string;
  transform: string;
  isMirror: boolean;
  center: string;
  zIndex: number;
  status: number;
}

export interface DocumentJSON<CustomBizData> {
  id: string;
  spaceId: string;
  cartId: string;
  backgroundBounds: string;
  thumbnailUrl?: string;
  background?: string;
  itemsArray: (DocumentItemJSON & CustomBizData)[];
  dataTypeId?: string;
}

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const mirrorImage = (image: HTMLImageElement | HTMLCanvasElement, materialDirection = { x: 1, y: 1 }) => {
  if (materialDirection.x === 1 && materialDirection.y === 1) {
    return image;
  }
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d')!;
  ctx.translate(materialDirection.x === -1 ? canvas.width : 0, materialDirection.y === -1 ? canvas.height : 0);
  ctx.scale(materialDirection.x, materialDirection.y);
  ctx.drawImage(image, 0, 0);
  return canvas;
};

const putImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  size = { x: 0, y: 0 },
  position = { x: 0, y: 0 },
  rotation = 0
) => {
  ctx.save();
  ctx.translate(position.x + size.x / 2, position.y + size.y / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-position.x - size.x / 2, -position.y - size.y / 2);
  ctx.drawImage(img, position.x, position.y, size.x, size.y);
  ctx.restore();
};

export class DocumentDomain extends DocumentSystem {
  @reactor sortedProducts: (ProductEntity | AssemblyEntity)[] = [];
  @reactor(false, false) skewModel?: ProductEntity;
  @reactor(false, false) clipModel?: ProductEntity;

  @mutation
  addModel(model: EntityObject | EntityObject[], sort = true) {
    const f = (m: EntityObject) => {
      super.addModel(m);
      if (sort) {
        this.sortedProducts.push(m);
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
        const index = this.sortedProducts.findIndex(p => p === m);
        this.sortedProducts.splice(index, 1);
        this.updateRenderOrder();
      }
    };
    if (Array.isArray(model)) {
      model.forEach(m => f(m));
      return;
    }
    f(model);
  }

  /** 根据已有的 renderOrder 来初始化 sortProducts 的排序 */
  @mutation
  sortProducts(models: EntityObject[]) {
    models.forEach(m => {
      this.sortedProducts.push(m);
    });
    this.sortedProducts.sort((a, b) => a.renderOrder - b.renderOrder);
  }

  /** 根据排好的顺序重置 renderOrder */
  @mutation
  updateRenderOrder() {
    this.sortedProducts.forEach((p, index) => {
      p.setRenderOrder(index);
    });
  }

  @mutation
  updateRenderOrderByType = (selected: EntityObject, type: Z_INDEX_ACTION) => {
    const products = this.sortedProducts;
    const index = products.findIndex(p => p === selected);
    if (type === Z_INDEX_ACTION.BOTTOM) {
      products.splice(index, 1);
      products.unshift(selected);
    } else if (type === Z_INDEX_ACTION.TOP) {
      products.splice(index, 1);
      products.push(selected);
    } else if (type === Z_INDEX_ACTION.INCREASE && index < products.length - 1) {
      products[index] = products[index + 1];
      products[index + 1] = selected;
    } else if (type === Z_INDEX_ACTION.DECREASE && index > 0) {
      products[index] = products[index - 1];
      products[index - 1] = selected;
    }
    this.updateRenderOrder();
  };

  getSkyBoxModel() {
    return [...this.models.values()].find(m => EntityCategory.isSkyBox(m)) as SkyBoxEntity | undefined;
  }

  getBackgroundModel() {
    return [...this.models.values()].find(m => EntityCategory.isBackground(m)) as BackgroundEntity | undefined;
  }

  getBackgroundSize() {
    const { sceneWidth, canvasMarginRatio, canvasRatio } = ldeStore.scene;
    const width = sceneWidth * canvasMarginRatio;
    const height = (sceneWidth * canvasMarginRatio) / canvasRatio;
    const background = this.getBackgroundModel();
    return background ? new Vector2(background.size.x, background.size.y) : new Vector2(width, height);
  }

  dumpDocument<CustomBizData>({
    spaceId = '',
    cartId = '',
    id = '',
    thumbnailUrl = '',
  }: {
    spaceId: string;
    cartId: string;
    id: string;
    thumbnailUrl: string;
  }): DocumentJSON<CustomBizData> {
    const background = this.getBackgroundModel();
    const size = this.getBackgroundSize();
    const itemsArray = [...this.models.values()]
      .filter(m => EntityCategory.isProduct(m))
      .map(m => this.dumpEntity(m as ProductEntity<CustomBizData>));
    const backgroundUrl = background?.url || '';
    return {
      id, // 画布ID
      spaceId, // 空间ID
      cartId, // 清单ID
      backgroundBounds: `{{0, 0}, {${size.x}, ${size.y}}}`, // 上传时背景图大小
      thumbnailUrl, // 方案截图
      background: backgroundUrl, // 背景图
      itemsArray,
      dataTypeId: DataTypeId, // json 数据类型标识，用来识别方案数据结构的版本及来源
    };
  }

  dumpEntity<CustomBizData>(m: ProductEntity<CustomBizData>): DocumentItemJSON & CustomBizData {
    const offset = this.getBackgroundSize().multiplyScalar(0.5);
    const skewPoints = [...m.children.values()]
      .filter(child => EntityCategory.isSkewPoint(child))
      .map(sp => ({
        point: sp.position.clone(),
        key: sp.name,
      }));
    const tlp = skewPoints.find(sp => sp.key === 'leftTop');
    const trp = skewPoints.find(sp => sp.key === 'rightTop');
    const brp = skewPoints.find(sp => sp.key === 'rightBottom');
    const blp = skewPoints.find(sp => sp.key === 'leftBottom');
    const matrix3 = m.getMatrix3From3d(EntityObject.EPerspectiveType.FRONT);
    return {
      bounds: `{{0, 0}, {${m.size.x}, ${m.size.y}}}`, // 图片宽高
      skew: {
        // 形变点位（新增，原有字段废弃）
        leftTop: tlp ? `{${tlp.point.x}, ${tlp.point.y}}` : '',
        rightTop: trp ? `{${trp.point.x}, ${trp.point.y}}` : '',
        rightBottom: brp ? `{${brp.point.x}, ${brp.point.y}}` : '',
        leftBottom: blp ? `{${blp.point.x}, ${blp.point.y}}` : '',
      },
      objId: m.id, // 客户端生成id, 用于区分复制商品内容一样的情况
      // cutoutData: {
      //   cutoutSize: '{745, 699}', // 抠图后图片大小
      //   cutoutUrl: 'https://ossgw.alicdn.com/homeai-inner/material/whitBGImage/75f28158-4a88-440c-bdd3-7ceec19d7df3.png', // 抠图后的url
      //   sourceUrl: '//imgextra///imgextra/i1/872353151/O1CN01yZW9FK1Z9CdL9ry1v_!!872353151.jpg',// 抠图前的原图
      //   resizeRatio: 1, // 限制图片在大小在(1000*1000)内, >此值则<1, 且尺寸变更到一定的尺寸
      //   sourceSize: '{750, 750}', // 抠图前的原图大小
      //   margin: '{0, 0, 51, 5}' // 抠图后的图片在原图的位置
      // },
      // cropPercent: m.cropPercent, // 上下左右裁剪百分比
      // cropImgUrl: url, // 裁剪后图片链接
      // cropOriginImgUrl: m.resourceUrl, // 被裁减原图链接
      imageUrl: m.resourceUrl, // 原图
      skewOriginalUrl: m.skewOriginalUrl, // 给形变用的原图（新增）
      cutoutOriginalUrl: m.cutoutOriginalUrl, // 抠图前的贴图（新增）
      cutoutUrl: m.cutoutUrl, // 抠图后的url
      finialImgUrl: m.url, // 上传时的URL, 可能抠图URL, 可能变形URL, 先后顺序都有变更
      // deformedImgUrl: url, // 变形后的URL
      transform: `[${matrix3.elements[0]}, ${matrix3.elements[1]}, ${matrix3.elements[3]}, ${matrix3.elements[4]}, 0, 0]`, // transform, 包含平移/旋转数据
      isMirror: !(m.materialDirection.x === 1 && m.materialDirection.y === 1), // 是否镜像, 镜像图片由客户端处理, 放置镜像后操作也镜像
      center: `{${offset.x + m.position.x}, ${offset.y - m.position.y}}`, // 图片在画布的中心点
      zIndex: m.renderOrder, // 图片层级
      status: m.cutoutUrl ? 1 : 0, // 图片是否经过抠图, 0: 未抠图; 1: 已抠图
      ...m.extraInfo,
      // itemId: m.extraInfo.itemId || '', // 商品itemId
      // skuId: m.extraInfo.skuId || '',
      // mainItemId: m.extraInfo.mainItemId || '',
      // mainSkuId: m.extraInfo.mainSkuId || '',
      // itemTitle: m.extraInfo.itemTitle || '',
      // itemCategoryName: m.extraInfo.itemCategoryName || '',
      // price: m.extraInfo.price || 0,
      // contentType: m.extraInfo.contentType || 0, // 图片类型, 0: 商品图; 1: 上传图片; 2: 素材图; 暂时无用
    };
  }

  async generateThumbnail<CustomBizData>(
    data: DocumentJSON<CustomBizData>,
    imageWidth = 1920,
    defaultBgColor?: string,
    exportType: 'blob' | 'canvas' = 'blob',
    fileType = 'image/jpeg',
    quality = 1
  ) {
    const promises: Promise<{
      el: HTMLImageElement;
      product?: DocumentItemJSON & CustomBizData;
      background?: { background?: string; backgroundBounds: string };
    }>[] = data.itemsArray.map(
      product =>
        new Promise(async resolve => {
          const originalProductEl = await loadImageElement(product.finialImgUrl || product.imageUrl, imageWidth);
          resolve({
            el: originalProductEl.element,
            product,
          });
        })
    );
    if (data.background) {
      promises.push(
        new Promise(async resolve => {
          const { element } = await loadImageElement(data.background!, imageWidth);
          resolve({
            el: element,
            background: {
              background: data.background,
              backgroundBounds: data.backgroundBounds,
            },
          });
        })
      );
    }
    const arr = await Promise.all(promises);
    const sizeTransformRatio = { x: 1, y: 1 };
    let backgroundSize = {
      x: Math.floor(imageWidth),
      y: Math.floor(imageWidth / (16 / 9)),
    };
    let canvas = createCanvas(backgroundSize.x, backgroundSize.y);
    let ctx = canvas.getContext('2d')!;
    const background = arr.find(p => p.background) as
      | { el: HTMLImageElement; background: { background?: string; backgroundBounds?: string } }
      | undefined;
    if (background) {
      const mapWidth = background.el.width;
      const mapHeight = background.el.height;
      const width = Math.floor(imageWidth);
      backgroundSize = { x: width, y: Math.floor(mapHeight / (mapWidth / width)) };
      canvas = createCanvas(backgroundSize.x, backgroundSize.y);
      ctx = canvas.getContext('2d')!;
    }
    if (defaultBgColor) {
      ctx.fillStyle = defaultBgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    if (background) {
      putImage(ctx, background.el, backgroundSize);
    }
    const [a, b, backgroundSizeX, backgroundSizeY] = coordinateStringToArray(data.backgroundBounds);
    sizeTransformRatio.x = backgroundSize.x / backgroundSizeX;
    sizeTransformRatio.y = backgroundSize.y / backgroundSizeY;
    const offset = {
      x: (backgroundSize.x / sizeTransformRatio.x) * 0.5,
      y: (backgroundSize.y / sizeTransformRatio.y) * 0.5,
    };
    const products = (
      arr.filter(p => p.product) as Array<{
        el: HTMLImageElement;
        product: DocumentItemJSON & CustomBizData;
      }>
    ).map(obj => {
      const { product, el } = obj;
      const transformArr = product.transform
        .slice(1, -1)
        .split(',')
        .map((s: string) => parseFloat(s));
      // 暂时只有左右镜像
      const mirrorEl = mirrorImage(el, product.isMirror ? { x: -1, y: 1 } : { x: 1, y: 1 });
      const scaleX = Math.sqrt(transformArr[0] * transformArr[0] + transformArr[1] * transformArr[1]);
      const scaleY = Math.sqrt(transformArr[2] * transformArr[2] + transformArr[3] * transformArr[3]);
      const productSize = coordinateStringToArray(product.bounds);
      const size = {
        x: productSize[2] * scaleX * sizeTransformRatio.x,
        y: productSize[3] * scaleY * sizeTransformRatio.y,
      };
      const translate = { x: transformArr[4], y: transformArr[5] };
      const center = coordinateStringToArray(product.center);
      const position = {
        x: (center[0] - offset.x + translate.x) * sizeTransformRatio.x + backgroundSize.x * 0.5 - size.x * 0.5,
        y: (center[1] - offset.y + translate.y) * sizeTransformRatio.y + backgroundSize.y * 0.5 - size.y * 0.5,
        z: product.zIndex,
      };
      const t1 = transformArr[0];
      const t2 = transformArr[1];
      const d1 = (Math.acos(t1 / scaleX) * 180) / Math.PI;
      let degree = 0;
      if (t2 >= 0) {
        degree = Math.abs(d1);
      } else {
        degree = -Math.abs(d1);
      }
      const z = (360 - degree) % 360;
      const rotation = -(data.dataTypeId === DataTypeId ? -z : z);
      return {
        el: mirrorEl,
        size,
        position,
        rotation,
      };
    });
    // z-index 排序
    products.sort((a, b) => a.position.z - b.position.z);
    products.forEach(p => {
      putImage(ctx, p.el, p.size, p.position, p.rotation);
    });
    if (exportType === 'canvas') {
      return canvas;
    }
    return new Promise<Blob>(resolve => {
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          }
        },
        fileType,
        quality
      );
    });
  }

  @mutation
  async loadDocument<CustomBizData>(data: DocumentJSON<CustomBizData>, extraInfoKeys: string[] = []) {
    this.pauseRecord();
    const promises: Promise<{
      entity: ProductEntity;
      product?: DocumentItemJSON & CustomBizData;
    }>[] = data.itemsArray.map(product => this.loadEntity(product, extraInfoKeys));
    if (data.background) {
      promises.push(
        new Promise(async resolve => {
          const entity = await ldeStore.actions.setBackground(data.background!);
          if (!entity) {
            return;
          }
          resolve({
            entity,
          });
        })
      );
    }
    const arr = await Promise.all(promises);
    (
      arr.filter(p => p.product) as Array<{
        entity: ProductEntity;
        product: DocumentItemJSON & CustomBizData;
      }>
    ).forEach(obj => {
      const { entity, product } = obj;
      this.transformProduct<CustomBizData>(entity, product, data);
    });
    this.updateRenderOrder();
    this.resumeRecord();
  }

  @mutation
  async loadEntity<CustomBizData>(
    product: DocumentItemJSON & CustomBizData,
    extraInfoKeys: string[] = []
  ): Promise<{
      entity: ProductEntity;
      product?: DocumentItemJSON & CustomBizData;
    }> {
    return new Promise(async resolve => {
      const extraInfo = {};
      extraInfoKeys.forEach(k => {
        extraInfo[k] = product[k];
      });
      const entity = await ldeStore.actions.addEntity(
        product.finialImgUrl || product.imageUrl,
        extraInfo,
        true,
        false,
        product.objId
      );
      if (!entity) {
        return;
      }
      if (product.status) {
        entity.$update({
          cutoutOriginalUrl: product.cutoutOriginalUrl || product.cutoutData?.sourceUrl || '',
          cutoutUrl: product.cutoutUrl || product.cutoutData?.cutoutUrl || '',
        });
      }
      const skewOriginalUrl = product.skewOriginalUrl || product.finialImgUrl || product.imageUrl;
      const loader = new THREE.TextureLoader();
      const map = await loader.loadAsync(convertUrl(skewOriginalUrl)).catch(err => {
        console.error(err);
      });
      if (!map) {
        return;
      }
      entity.$update({
        skewOriginalUrl,
        skewOriginalUrlImage: map.image,
        resourceUrl: product.imageUrl,
      });
      resolve({
        entity,
        product,
      });
    });
  }

  transformProduct<CustomBizData>(
    entity: ProductEntity,
    product: DocumentItemJSON & CustomBizData,
    data: DocumentJSON<CustomBizData>
  ) {
    const bgSize = this.getBackgroundSize();
    const sizeTransformRatio = new Vector2(1, 1);
    const [a, b, backgroundSizeX, backgroundSizeY] = coordinateStringToArray(data.backgroundBounds);
    sizeTransformRatio.x = bgSize.x / backgroundSizeX;
    sizeTransformRatio.y = bgSize.y / backgroundSizeY;
    const offset = new Vector2(bgSize.x, bgSize.y).divide(sizeTransformRatio).multiplyScalar(0.5);
    const transformArr = product.transform
      .slice(1, -1)
      .split(',')
      .map((s: string) => parseFloat(s));
    // 暂时只有左右镜像
    const translate = new Vector2(transformArr[4], -transformArr[5]);
    entity.setMaterialDirection(product.isMirror ? new Vector2(-1, 1) : new Vector2(1, 1));
    const position = new Vector2(...coordinateStringToArray(product.center))
      .subtracted(offset)
      .multiply(new Vector2(1, -1))
      .added(translate);
    entity.setRenderOrder(product.zIndex);
    entity.setPosition({
      x: position.x * sizeTransformRatio.x,
      y: position.y * sizeTransformRatio.y,
    });
    const scaleX = new Vector2(transformArr[0], transformArr[1]).length;
    const scaleY = new Vector2(transformArr[2], transformArr[3]).length;
    const size = coordinateStringToArray(product.bounds);
    entity.setSize({
      x: size[2] * scaleX * sizeTransformRatio.x,
      y: size[3] * scaleY * sizeTransformRatio.y,
    });
    const t1 = transformArr[0];
    const t2 = transformArr[1];
    const d1 = Math.acos(t1 / scaleX) * MathUtils.RAD2DEG;
    let degree = 0;
    if (t2 >= 0) {
      degree = Math.abs(d1);
    } else {
      degree = -Math.abs(d1);
    }
    const z = (360 - degree) % 360;
    entity.setRotation({
      z: data.dataTypeId === DataTypeId ? -z : z,
    });
    entity.updateControlPoints();
    this.sortProducts([entity]);
    if (product.skew) {
      const models = Object.keys(product.skew).map(key => {
        const val = product.skew[key];
        if (val) {
          const [x, y] = coordinateStringToArray(val);
          const spe = new SkewPointEntity();
          spe.setName(key);
          spe.setPosition({
            x: x * sizeTransformRatio.x,
            y: y * sizeTransformRatio.y,
            z: entity.position.z,
          });
          spe.setSize({ x: spe.radius, y: spe.radius });
          return spe;
        }
      });
      entity.addChildren(models.filter(m => m !== undefined) as SkewPointEntity[]);
    }
  }
}
