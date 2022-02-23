import { Domain, Vector2, Vector3, Box2, EntityObject, Box3, mutation, Action, Vec2 } from '@turbox3d/turbox3d';
import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import { ProductEntity } from '../entity/product';
import { ldeStore } from '../index';
import { CubeEntity } from '../entity/cube';
import { BackgroundEntity } from '../entity/background';
import { EyeDistance, Z_INDEX_ACTION, MIRROR_ACTION } from '../../consts/scene';
import { EntityCategory } from '../../utils/category';
import { appCommandBox } from '../../commands/index';
import { SceneUtil } from '../../views/scene/modelsWorld/index';
import { AssemblyEntity } from '../entity/assembly';
import { Controls } from './controls';
import { SkewPointEntity } from '../entity/skewPoint';
import { ClipPointEntity } from '../entity/clipPoint';
import { mirrorImage, cropImage, convertUrl, loadImageElement } from '../../utils/image';
import { DocumentJSON } from './document';

function getNeg() {
  const gap = 200;
  return Math.random() > 0.5 ? -gap : gap;
}

export class ActionsDomain extends Domain {
  @mutation
  addEntity = async <CustomBizData>(
    url: string,
    extraInfo?: CustomBizData,
    addToDocument = true,
    sort = true,
    specificId?: string
  ) => {
    const entity = new ProductEntity<CustomBizData>(specificId);
    const loader = new THREE.TextureLoader();
    const map = await loader.loadAsync(convertUrl(url)).catch(err => {
      console.error(err);
    });
    if (!map) {
      return;
    }
    entity.$update({
      url,
      urlImage: map.image,
      skewOriginalUrl: url,
      skewOriginalUrlImage: map.image,
      resourceUrl: url,
    });
    extraInfo && (entity.extraInfo = extraInfo);
    const ratio = map.image.width / map.image.height;
    const bgSize = ldeStore.document.getBackgroundSize();
    entity.setSize({
      x: ratio > 1 ? bgSize.x / 4 : (bgSize.y / 4) * ratio,
      y: ratio > 1 ? bgSize.x / 4 / ratio : bgSize.y / 4,
      z: 1,
    });
    const control = new Controls(entity);
    control.init();
    if (addToDocument) {
      ldeStore.document.addModel(entity, sort);
    }
    return entity;
  };

  @mutation
  deleteEntity = (models?: EntityObject[]) => {
    if (models) {
      models.forEach(e => {
        const sort = EntityCategory.isProduct(e) || EntityCategory.isAssembly(e);
        ldeStore.document.removeModel(e, sort);
      });
    } else {
      const selected = appCommandBox.defaultCommand.select.getSelectedEntities();
      selected.forEach(e => {
        const sort = EntityCategory.isProduct(e) || EntityCategory.isAssembly(e);
        ldeStore.document.removeModel(e, sort);
      });
    }
    appCommandBox.defaultCommand.select.clearAllSelected();
  };

  @mutation
  updateRenderOrder = (type: Z_INDEX_ACTION) => {
    const selected = appCommandBox.defaultCommand.select.getSelectedEntities()[0];
    if (!EntityCategory.isProduct(selected) && !EntityCategory.isAssembly(selected)) {
      return;
    }
    ldeStore.document.updateRenderOrderByType(selected, type);
  };

  @mutation
  copy = () => {
    const selected = appCommandBox.defaultCommand.select.getSelectedEntities() as ProductEntity[];
    selected
      .filter(s => EntityCategory.isProduct(s))
      .forEach(selected => {
        const product = new ProductEntity();
        product.$update({
          url: selected.url,
          urlImage: selected.urlImage,
          skewOriginalUrl: selected.skewOriginalUrl,
          skewOriginalUrlImage: selected.skewOriginalUrlImage,
          cutoutOriginalUrl: selected.cutoutOriginalUrl,
          cutoutUrl: selected.cutoutUrl,
          resourceUrl: selected.resourceUrl,
          isSkewed: selected.isSkewed,
          isClipped: selected.isClipped,
          snapped: selected.snapped,
        });
        product.setSize(selected.size);
        product.setPosition(selected.position.added(new Vector3(20, 20)));
        product.setRotation(selected.rotation);
        product.setScale(selected.scale);
        product.setMaterialDirection(selected.materialDirection.clone());
        // product.cropPercent = selected.cropPercent;
        product.extraInfo = selected.extraInfo;
        const newSkewPoints = [...selected.children.values()]
          .filter(m => EntityCategory.isSkewPoint(m))
          .map(p => {
            const sp = new SkewPointEntity();
            sp.setPosition(p.position);
            sp.setSize(p.size);
            sp.setRotation(p.rotation);
            sp.setScale(p.scale);
            return sp;
          });
        product.addChildren(newSkewPoints);
        const control = new Controls(product);
        control.init();
        ldeStore.document.addModel(product, false);
        ldeStore.document.sortProducts([product]);
        ldeStore.document.updateRenderOrder();
        appCommandBox.defaultCommand.select.select([product]);
      });
  };

  @mutation
  lock() {
    const selected = appCommandBox.defaultCommand.select.getSelectedEntities()[0] as ProductEntity | BackgroundEntity;
    if (
      !EntityCategory.isProduct(selected) &&
      !EntityCategory.isBackground(selected) &&
      !EntityCategory.isAssembly(selected)
    ) {
      return;
    }
    if (selected.locked) {
      selected.unlock();
    } else {
      selected.lock();
    }
  }

  /**
   * 替换
   * @param url 新素材的图片路径
   * @param target 被替换的目标模型
   * @param isSelf 是否替换自身，默认 false，会清空原 extraInfo 和 resourceUrl
   * @todo 按长边替换
   */
  @mutation()
  replace = async <CustomBizData>(url: string, target?: EntityObject, extraInfo?: CustomBizData, isSelf = false) => {
    const selected = (target ||
      appCommandBox.defaultCommand.select.getSelectedEntities()[0]) as ProductEntity<CustomBizData>;
    if (!EntityCategory.isProduct(selected)) {
      return;
    }
    const loader = new THREE.TextureLoader();
    const map = await loader.loadAsync(convertUrl(url)).catch(err => {
      console.error(err);
    });
    if (!map) {
      return;
    }
    const ratio = map.image.width / map.image.height;
    const bgSize = ldeStore.document.getBackgroundSize();
    if (!isSelf) {
      selected.setSize({
        x: ratio > 1 ? bgSize.x / 4 : (bgSize.y / 4) * ratio,
        y: ratio > 1 ? bgSize.x / 4 / ratio : bgSize.y / 4,
      });
    } else {
      selected.setSize({
        y: selected.size.x / ratio,
      });
    }
    selected.$update({
      url,
      urlImage: map.image,
      skewOriginalUrl: url,
      skewOriginalUrlImage: map.image,
      isSkewed: false,
      isClipped: false,
      snapped: false,
    });
    if (!isSelf) {
      selected.$update({
        resourceUrl: url,
        cutoutOriginalUrl: '',
        cutoutUrl: '',
      });
    }
    selected.$update({
      materialDirection: selected.materialDirection,
    });
    extraInfo && (selected.extraInfo = extraInfo);
    const control = new Controls(selected);
    control.init();
  };

  @mutation
  group = () => {
    const selected = appCommandBox.defaultCommand.select.getSelectedEntities();
    if (selected.length === 1 && EntityCategory.isAssembly(selected[0])) {
      const assembly = selected[0];
      assembly.children.forEach(child => {
        child.setPosition(child.position.clone().applyMatrix4(assembly.getConcatenatedMatrix()));
        ldeStore.document.addModel(child);
        appCommandBox.defaultCommand.select.select([child], false);
      });
      assembly.removeChildren();
      ldeStore.document.removeModel(assembly);
      return;
    }
    if (selected.length < 2 && !selected.every(e => EntityCategory.isProduct(e) || EntityCategory.isAssembly(e))) {
      return;
    }
    const position = new Vector2();
    const size = new Vector2();
    const points = selected.map(e => e.getBox2(EntityObject.EPerspectiveType.FRONT, true)).flat();
    const box2 = new Box2().setFromPoints(points);
    box2.getCenter(position);
    box2.getSize(size);
    const assembly = new AssemblyEntity();
    assembly.setPosition({
      x: position.x,
      y: position.y,
    });
    assembly.setSize({
      x: size.x,
      y: size.y,
      z: 1,
    });
    // const control = new Controls(assembly);
    // control.init();
    selected
      .filter(s => EntityCategory.isAssembly(s))
      .forEach(e => {
        e.children.forEach(child => {
          assembly.addChild(child);
          child.setPosition(
            child.position
              .clone()
              .applyMatrix4(e.getConcatenatedMatrix())
              .applyMatrix4(assembly.getConcatenatedMatrix().inverted())
          );
        });
        ldeStore.document.removeModel(e);
      });
    selected
      .filter(s => EntityCategory.isProduct(s))
      .forEach(e => {
        assembly.addChild(e);
        e.setPosition(e.position.clone().applyMatrix4(assembly.getConcatenatedMatrix().inverted()));
        ldeStore.document.removeModel(e);
      });
    ldeStore.document.addModel(assembly);
    appCommandBox.defaultCommand.select.select([assembly]);
  };

  @mutation
  addCube = () => {
    const entity = new CubeEntity();
    entity.setSize({ x: 30, y: 30, z: 30 });
    entity.setPosition({
      x: Math.random() * getNeg(),
      y: Math.random() * getNeg(),
    });
    entity.setRotation({
      x: Math.random() * 180,
      y: Math.random() * 180,
      z: Math.random() * 180,
    });
    ldeStore.document.addModel(entity);
  };

  /** 重置画布位置和缩放 */
  resetView = (zoom = 1) => {
    const { sceneWidth, sceneHeight } = ldeStore.scene;
    const rootView3d = SceneUtil.getRootView() as THREE.Group;
    rootView3d.position.x = 0;
    rootView3d.position.y = 0;
    const size = ldeStore.document.getBackgroundSize();
    if (size.y > sceneHeight || size.x > sceneWidth) {
      const scale = Math.min(sceneWidth / size.x, sceneHeight / size.y);
      rootView3d.scale.x = scale;
      rootView3d.scale.y = scale;
    } else {
      rootView3d.scale.x = 1;
      rootView3d.scale.y = 1;
    }
    rootView3d.scale.x *= zoom;
    rootView3d.scale.y *= zoom;
    ldeStore.scene.$update({
      canvasZoom: rootView3d.scale.x,
      canvasPosition: {
        x: rootView3d.position.x,
        y: rootView3d.position.y,
      },
    });
  };

  /** 恢复画布位置和缩放 */
  restoreView = (position: Vec2, scale: Vec2) => {
    const rootView3d = SceneUtil.getRootView() as THREE.Group;
    rootView3d.position.x = position.x;
    rootView3d.position.y = position.y;
    rootView3d.scale.x = scale.x;
    rootView3d.scale.y = scale.y;
    ldeStore.scene.$update({
      canvasZoom: rootView3d.scale.x,
      canvasPosition: {
        x: rootView3d.position.x,
        y: rootView3d.position.y,
      },
    });
  };

  @mutation
  setBackground = async (target: string | ProductEntity) => {
    let url = '';
    if (EntityCategory.isProduct(target)) {
      url = target.url;
    } else {
      url = target;
    }
    const { sceneWidth, canvasMarginRatio } = ldeStore.scene;
    const entity = new BackgroundEntity();
    const loader = new THREE.TextureLoader();
    const map = await loader.loadAsync(convertUrl(url)).catch(err => {
      console.error(err);
    });
    if (!map) {
      return;
    }
    entity.$update({
      url,
      urlImage: map.image,
      skewOriginalUrl: url,
      skewOriginalUrlImage: map.image,
      resourceUrl: url,
    });
    const mapWidth = map.image.width / 2;
    const mapHeight = map.image.height / 2;
    const width = sceneWidth * canvasMarginRatio;
    entity.setSize({
      x: width,
      y: mapHeight / (mapWidth / width),
      z: 1,
    });
    entity.setPosition({
      x: 0,
      y: 0,
      z: EyeDistance.BACKGROUND,
    });
    [...ldeStore.document.models.values()]
      .filter(m => EntityCategory.isBackground(m))
      .forEach(m => {
        ldeStore.document.removeModel(m);
      });
    if (EntityCategory.isProduct(target)) {
      ldeStore.document.removeModel(target);
    }
    ldeStore.document.addModel(entity, false);
    appCommandBox.defaultCommand.select.clearAllSelected();
    return entity;
  };

  scaleScene = (ratio: number) => {
    // const camera = SceneUtil.getCamera() as THREE.OrthographicCamera;
    // camera.zoom = ratio;
    // camera.updateProjectionMatrix();
    const rootView = SceneUtil.getRootView() as THREE.Group;
    rootView.scale.x = ratio;
    rootView.scale.y = ratio;
    ldeStore.scene.$update({
      canvasZoom: ratio,
    });
  };

  @mutation('updateMirror', false, true)
  updateMirror = (type: MIRROR_ACTION) => {
    const selected = appCommandBox.defaultCommand.select.getSelectedEntities()[0] as ProductEntity;
    if (!EntityCategory.isProduct(selected)) {
      return;
    }
    const v = new Vector2().copy(selected.materialDirection);
    if (type === MIRROR_ACTION.LEFT_RIGHT) {
      v.x *= -1;
    } else if (type === MIRROR_ACTION.TOP_BOTTOM) {
      v.y *= -1;
    }
    selected.setMaterialDirection(v);
    // 根据镜像情况来翻转形变点的位置
    [...selected.children.values()]
      .filter(child => EntityCategory.isSkewPoint(child))
      .forEach(sp =>
        sp.setPosition({
          x: sp.position.x * (type === MIRROR_ACTION.LEFT_RIGHT ? -1 : 1),
          y: sp.position.y * (type === MIRROR_ACTION.TOP_BOTTOM ? -1 : 1),
        })
      );
  };

  skewAction: Action;

  skew = async () => {
    const selected = appCommandBox.defaultCommand.select.getSelectedEntities()[0] as ProductEntity;
    if (!EntityCategory.isProduct(selected)) {
      return;
    }
    this.skewAction = Action.create('skew');
    // 开启 ticker
    selected.setInteractive(false);
    ldeStore.scene.setRenderFlag2d(true);
    this.skewAction.execute(
      () => {
        let skewPoints = [...selected.children.values()].filter(child => EntityCategory.isSkewPoint(child));
        if (skewPoints.length === 0) {
          // 初次形变
          selected.addChildren(
            [...selected.children.values()]
              .filter(child => EntityCategory.isScalePoint(child))
              .map(m => {
                const spe = new SkewPointEntity();
                spe.setName(m.name);
                spe.setPosition({
                  x: m.position.x * selected.materialDirection.x,
                  y: m.position.y * selected.materialDirection.y,
                  z: m.position.z,
                });
                spe.setSize({ x: spe.radius, y: spe.radius });
                return spe;
              })
          );
          skewPoints = [...selected.children.values()].filter(child => EntityCategory.isSkewPoint(child));
        }
        ldeStore.document.$update({
          skewModel: selected,
        });
        ldeStore.document.removeModel(selected, false);
        appCommandBox.defaultCommand.select.clearAllSelected();
        ldeStore.scene.$update({
          isSkewMode: true,
        });
      },
      undefined,
      true,
      { immediately: true }
    );
    await Promise.resolve();
    const app = SceneUtil.getApp() as THREE.WebGLRenderer;
    app.render(SceneUtil.getScene(), SceneUtil.getCamera());
    const { sceneWidth: width, sceneHeight: height, resolution } = ldeStore.scene;
    const blob = await SceneUtil.getScreenShot(0, 0, Math.floor(width * resolution), Math.floor(height * resolution), undefined, undefined, false) as Blob;
    const { element } = await loadImageElement(blob);
    const image = PIXI.Sprite.from(PIXI.Texture.from(element));
    image.width = width;
    image.height = height;
    const app2d = SceneUtil.get2DApp() as PIXI.Application;
    app2d.stage.addChildAt(image, 0);
    ldeStore.scene.setRenderFlag3d(false);
  };

  confirmSkew = async (uploadMethod: ({
    data,
    fileName,
  }: {
    data: any,
    fileName: string,
  }) => Promise<string>) => {
    const model = ldeStore.document.skewModel;
    if (!model) {
      this.cancelSkew();
      return;
    }
    const rotation = model.rotation.clone();
    ldeStore.scene.$update({
      isSkewMode: false,
    });
    mutation(
      '',
      () => {
        ldeStore.document.pauseRecord();
        model.setRotation({ z: 0 });
        ldeStore.scene.$update({
          hideSkewPoint: true,
        });
        ldeStore.document.resumeRecord();
      },
      { immediately: true }
    )();
    const app = SceneUtil.get2DApp() as PIXI.Application;
    const skewPoints = [...model.children.values()]
      .filter(child => EntityCategory.isSkewPoint(child))
      .map(child => child.position.clone());
    // const globalPoints = skewPoints.map(p => p.position.clone().applyMatrix4(model.getMatrix4())).map(p => new Vector2(p.x, p.y));
    const box3 = new Box3().setFromPoints(skewPoints);
    const position = new Vector3();
    const size = new Vector3();
    box3.getCenter(position);
    box3.getSize(size);
    const backgroundObj = app.stage.children[0];
    app.stage.removeChildAt(0);
    await Promise.resolve();
    app.render();
    const v = SceneUtil.getProduct2DView();
    const container = new PIXI.Container();
    container.addChild(v);
    container.width = size.x * ldeStore.scene.resolution;
    container.height = size.y * ldeStore.scene.resolution;
    v.scale.x *= ldeStore.scene.resolution;
    v.scale.y *= ldeStore.scene.resolution;
    SceneUtil.get2DRootView().addChild(container);
    const img = app.renderer.plugins.extract.image(container, 'image/png', 1);
    SceneUtil.get2DRootView().removeChild(container);
    // 回退掉 mirror
    const url = await mirrorImage(img.src, model.materialDirection.clone().multiply(new Vector2(1, -1))) as Blob;
    app.stage.addChildAt(backgroundObj, 0);
    const fullUrl = await uploadMethod({
      data: url,
      fileName: 'skew.png',
    });
    if (!fullUrl) {
      model.setRotation(rotation);
      this.cancelSkew();
      return;
    }
    await this.skewAction.execute(
      async () => {
        const loader = new THREE.TextureLoader();
        const map = await loader.loadAsync(convertUrl(fullUrl)).catch(err => {
          console.error(err);
        });
        if (!map) {
          return;
        }
        model.$update({
          url: fullUrl,
          urlImage: map.image,
          isSkewed: true,
        });
        model.setRotation(rotation);
        [...model.children.values()]
          .filter(child => EntityCategory.isSkewPoint(child))
          .forEach(sp => {
            sp.setPosition({
              x: sp.position.subtracted(position).x,
              y: sp.position.subtracted(position).y,
            });
          });
        const newPosition = position.clone().applyMatrix4(model.getMatrix4());
        model.setPosition({
          x: newPosition.x,
          y: newPosition.y,
        });
        model.setSize({ x: size.x, y: size.y });
        model.updateControlPoints();
        ldeStore.document.addModel(model, false);
        // 还原清理
        ldeStore.scene.$update({
          hideSkewPoint: false,
        });
        model.setInteractive(true);
        ldeStore.document.$update({
          skewModel: undefined,
        });
        app.stage.removeChildAt(0);
      },
      undefined,
      true,
      { immediately: true }
    );
    this.skewAction.complete();
    ldeStore.scene.setRenderFlag3d(true);
    ldeStore.scene.setRenderFlag2d(false);
  };

  cancelSkew = () => {
    ldeStore.document.skewModel && ldeStore.document.skewModel.setInteractive(true);
    const app2d = SceneUtil.get2DApp() as PIXI.Application;
    app2d.stage.removeChildAt(0);
    ldeStore.document.$update({
      skewModel: undefined,
    });
    ldeStore.scene.$update({
      isSkewMode: false,
    });
    this.skewAction.abort();
    ldeStore.scene.setRenderFlag3d(true);
    ldeStore.scene.setRenderFlag2d(false);
  };

  clipAction: Action;

  clip = () => {
    const selected = appCommandBox.defaultCommand.select.getSelectedEntities()[0] as ProductEntity;
    if (!EntityCategory.isProduct(selected)) {
      return;
    }
    this.clipAction = Action.create('clip');
    this.clipAction.execute(
      () => {
        const clipPoints = [...selected.children.values()].filter(child => EntityCategory.isClipPoint(child));
        const scalePoints = [...selected.children.values()].filter(child => EntityCategory.isScalePoint(child));
        if (clipPoints.length === 0) {
          selected.addChildren(
            scalePoints.map(m => {
              const spe = new ClipPointEntity();
              spe.setPosition(m.position);
              spe.setSize({ x: spe.radius, y: spe.radius });
              return spe;
            })
          );
        } else {
          for (let index = 0; index < clipPoints.length; index++) {
            clipPoints[index].setPosition(scalePoints[index].position);
          }
        }
        ldeStore.document.$update({
          clipModel: selected,
        });
        appCommandBox.defaultCommand.select.clearAllSelected();
        ldeStore.scene.$update({
          isClipMode: true,
        });
      },
      undefined,
      true,
      { immediately: true }
    );
    appCommandBox.clipCommand.apply();
  };

  confirmClip = async (uploadMethod: ({
    data,
    fileName,
  }: {
    data: any,
    fileName: string,
  }) => Promise<string>) => {
    const model = ldeStore.document.clipModel;
    if (!model) {
      this.cancelClip();
      return;
    }
    const size = model.size;
    const clipPoints = [...model.children.values()].filter(child => EntityCategory.isClipPoint(child));
    const xs = clipPoints.map(p => p.position.x);
    const ys = clipPoints.map(p => p.position.y);
    const start = new Vector2((Math.min(...xs) + size.x / 2) / size.x, (size.y / 2 - Math.max(...ys)) / size.y); // normalized
    const end = new Vector2((Math.max(...xs) + size.x / 2) / size.x, (size.y / 2 - Math.min(...ys)) / size.y); // normalized
    // model.cropPercent = `${start.y} ${1 - end.y} ${start.x} ${1 - end.x}`;
    const mirrorUrl = await mirrorImage(model.url, model.materialDirection.clone());
    const croppedImage = await cropImage(mirrorUrl, { start, end });
    if (!croppedImage.blob) {
      this.cancelClip();
      return;
    }
    const url = await mirrorImage(croppedImage.blob, model.materialDirection.clone()) as Blob;
    const fullUrl = await uploadMethod({
      data: url,
      fileName: 'crop.png',
    });
    if (!fullUrl) {
      this.cancelClip();
      return;
    }
    await this.clipAction.execute(
      async () => {
        const loader = new THREE.TextureLoader();
        const map = await loader.loadAsync(convertUrl(fullUrl)).catch(err => {
          console.error(err);
        });
        if (!map) {
          return;
        }
        model.$update({
          url: fullUrl,
          urlImage: map.image,
          isClipped: true,
          skewOriginalUrl: fullUrl,
          skewOriginalUrlImage: map.image,
        });
        const deltaP = new Vector3(
          ((start.x + end.x) / 2 - 0.5) * size.x,
          -((start.y + end.y) / 2 - 0.5) * size.y,
          0
        ).applyAxisAngle(new Vector3(0, 0, 1), (model.rotation.z * Math.PI) / 180);
        model.setPosition({ x: model.position.x + deltaP.x, y: model.position.y + deltaP.y });
        model.setSize({ x: model.size.x * (end.x - start.x), y: model.size.y * (end.y - start.y) });
        model.removeChildren([...model.children.values()].filter(child => EntityCategory.isSkewPoint(child)));
        ldeStore.document.$update({
          clipModel: undefined,
        });
        ldeStore.scene.$update({
          isClipMode: false,
        });
        model.updateControlPoints();
      },
      undefined,
      true,
      { immediately: true }
    );
    appCommandBox.defaultCommand.apply();
    this.clipAction.complete();
  };

  cancelClip = () => {
    this.clipAction.execute(
      () => {
        ldeStore.document.$update({
          clipModel: undefined,
        });
        ldeStore.scene.$update({
          isClipMode: false,
        });
      },
      undefined,
      true,
      { immediately: true }
    );
    this.clipAction.abort(false);
    appCommandBox.defaultCommand.apply();
  };

  @mutation
  align = (type: 'top' | 'middle' | 'bottom') => {
    const selected = appCommandBox.defaultCommand.select.getSelectedEntities();
    // 多选才能对齐
    if (selected.length > 1) {
      const points = selected.map(e => e.getBox2(EntityObject.EPerspectiveType.FRONT, true)).flat();
      const box2 = new Box2().setFromPoints(points);
      const topY = box2.max.y;
      const bottomY = box2.min.y;
      const middleY = (topY + bottomY) / 2;
      selected.forEach(e => {
        const boxAABB = e.getBox2AABB(EntityObject.EPerspectiveType.FRONT, true);
        let offsetY = 0;
        if (type === 'top') {
          offsetY = topY - boxAABB[2].y;
        } else if (type === 'middle') {
          offsetY = middleY - (boxAABB[0].y + boxAABB[2].y) / 2;
        } else if (type === 'bottom') {
          offsetY = bottomY - boxAABB[0].y;
        }
        e.setPosition({
          y: e.position.y + offsetY,
        });
      });
    }
  };

  clearScene = () => {
    ldeStore.document.pauseRecord();
    ldeStore.document.clear();
    ldeStore.document.$update({
      sortedProducts: [],
    });
    ldeStore.scene.$update({
      cameraPosition: new Vector3(0, 0, EyeDistance.CAMERA),
      cameraTarget: new Vector3(0, 0, 0),
      canvasZoom: 1,
      canvasPosition: { x: 0, y: 0 },
      isSkewMode: false,
      isClipMode: false,
      isPdfMode: false,
    });
    ldeStore.actions.resetView();
    ldeStore.document.clearHistory();
    ldeStore.document.resumeRecord();
  };

  save = <CustomBizData>({ spaceId = '', cartId = '', id = '', thumbnailUrl = '' }) => {
    return ldeStore.document.dumpDocument<CustomBizData>({
      spaceId,
      cartId,
      id,
      thumbnailUrl,
    });
  };

  load = async <CustomBizData>(data: DocumentJSON<CustomBizData>, extraInfoKeys: string[] = []) => {
    mutation('', () => {
      ldeStore.actions.clearScene();
    }, { immediately: true })();
    if (Object.keys(data).length === 0) {
      return;
    }
    await ldeStore.document.loadDocument(data, extraInfoKeys);
  };

  screenShot = async (download = false, fileType = 'image/jpeg', quality = 1, zoom = 1) => {
    const selected = appCommandBox.defaultCommand.select.getSelectedEntities().slice();
    const rootView3d = SceneUtil.getRootView() as THREE.Group;
    const p = rootView3d.position.clone();
    const s = rootView3d.scale.clone();
    mutation(
      '',
      () => {
        appCommandBox.defaultCommand.select.clearAllSelected();
        this.resetView(zoom);
      },
      { immediately: true }
    )();
    await Promise.resolve();
    const app = SceneUtil.getApp() as THREE.WebGLRenderer;
    app.render(SceneUtil.getScene(), SceneUtil.getCamera());
    const { sceneWidth, sceneHeight, canvasZoom, canvasPosition, resolution } = ldeStore.scene;
    const { x: width, y: height } = ldeStore.document.getBackgroundSize().multiplyScalar(canvasZoom);
    const sx = sceneWidth / 2 - width / 2 + canvasPosition.x;
    const sy = sceneHeight / 2 - height / 2 - canvasPosition.y;
    const blob = await SceneUtil.getScreenShot(Math.floor(sx * resolution), Math.floor(sy * resolution), Math.floor(width * resolution), Math.floor(height * resolution), fileType, quality, false) as Blob;
    if (download) {
      const downloadLink = document.createElement('a');
      const src = URL.createObjectURL(blob);
      downloadLink.href = src;
      downloadLink.download = 'thumbnail';
      downloadLink.click();
      URL.revokeObjectURL(src);
    }
    mutation(
      '',
      () => {
        this.restoreView({ x: p.x, y: p.y }, { x: s.x, y: s.y });
        appCommandBox.defaultCommand.select.select(selected);
      },
      { immediately: true }
    )();
    return blob;
  };

  exportPDF = () => {
    // a4纸的尺寸[595.28,841.89]印刷尺寸单位pt
    ldeStore.scene.$update({
      isPdfMode: true,
    });
  };
}
