import * as THREE from 'three';
import { DocumentSystem, EntityObject, mutation, reactor, Vector2, MathUtils } from '@turbox3d/turbox3d';
import { ProductEntity } from '../entity/product';
import { AssemblyEntity } from '../entity/assembly';
import { Z_INDEX_ACTION } from '../../consts/scene';
import { EntityCategory } from '../../utils/category';
import { BackgroundEntity } from '../entity/background';
import { ldeStore } from '../index';
import { coordinateStringToArray } from '../../utils/common';
import { SkewPointEntity } from '../entity/skewPoint';
import { convertUrl } from '../../utils/image';

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
};

export interface DocumentJSON<CustomBizData> {
  id: string;
  spaceId: string;
  cartId: string;
  backgroundBounds?: string;
  thumbnailUrl?: string;
  background?: string;
  itemsArray: (DocumentItemJSON & CustomBizData)[];
  dataTypeId?: string;
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

  /** 根据已有的 position z 来初始化 sortProducts 的排序 */
  @mutation
  sortProducts(models: EntityObject[]) {
    models.forEach(m => {
      this.sortedProducts.push(m);
    });
    this.sortedProducts.sort((a, b) => a.position.z - b.position.z);
  }

  /** 根据排好的顺序重置 position z */
  @mutation
  updateRenderOrder() {
    this.sortedProducts.forEach((p, index) => {
      p.setPosition({
        z: index,
      });
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
    const matrix3 = m.getMatrix3(EntityObject.EPerspectiveType.FRONT);
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
      //   sourceUrl: 'https://img.alicdn.com/imgextra/https://img.alicdn.com/imgextra/i1/872353151/O1CN01yZW9FK1Z9CdL9ry1v_!!872353151.jpg',// 抠图前的原图
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
      isMirror: m.materialDirection.x === 1 && m.materialDirection.y === 1 ? false : true, // 是否镜像, 镜像图片由客户端处理, 放置镜像后操作也镜像
      center: `{${offset.x + m.position.x}, ${offset.y - m.position.y}}`, // 图片在画布的中心点
      zIndex: m.position.z, // 图片层级
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

  @mutation
  async loadDocument<CustomBizData>(data: DocumentJSON<CustomBizData>, extraInfoKeys: string[] = []) {
    this.pauseRecord();
    let sizeTransformRatio = new Vector2(1, 1);
    if (data.background) {
      const backgroundEntity = await ldeStore.actions.setBackground(data.background);
      if (backgroundEntity && data.backgroundBounds) {
        const [a, b, backgroundSizeX, backgroundSizeY] = coordinateStringToArray(data.backgroundBounds);
        sizeTransformRatio.x = backgroundEntity.size.x / backgroundSizeX;
        sizeTransformRatio.y = backgroundEntity.size.y / backgroundSizeY;
      }
    }
    const offset = this.getBackgroundSize().divide(sizeTransformRatio).multiplyScalar(0.5);
    const promises: Promise<ProductEntity>[] = data.itemsArray.map(product => {
      return new Promise<ProductEntity>(async resolve => {
        const extraInfo = {};
        extraInfoKeys.forEach((k) => {
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
        entity.setPosition({
          x: position.x * sizeTransformRatio.x,
          y: position.y * sizeTransformRatio.y,
          z: product.zIndex,
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
                x,
                y,
                z: entity.position.z,
              });
              spe.setSize({ x: spe.radius, y: spe.radius });
              return spe;
            }
          });
          entity.addChildren(models.filter(m => m !== undefined) as SkewPointEntity[]);
        }
        resolve(entity);
      });
    });
    await Promise.all(promises);
    this.updateRenderOrder();
    this.resumeRecord();
  }
}
