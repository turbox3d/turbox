import React, { useRef, useEffect } from 'react';

import { Action, MaterialDragSystem, CoordinateType, Vec2, ViewEntity, InteractiveEvent } from '@byted-tx3d/turbox';

import { appCommandManager } from '../commands/index';
import { ProductSymbol } from '../common/consts/scene';
import { ProductEntity } from '../models/entity/product';
import { ldeStore } from '../models/index';
import { SceneUtil } from '../views/scene/modelsWorld/index';

type IParams<T> = React.MutableRefObject<{
  url: string;
  extraInfo?: T;
}>;

export function useMaterialDragAndReplace<CustomBizData>(
  /** 开始拖拽前的回调 */
  handleDragStart?: (params: IParams<CustomBizData>) => Promise<void>,
  /** 预处理需要加载的图片 */
  handleImageInfo?: (params: IParams<CustomBizData>) => Promise<void>,
  /** 后处理创建的 entity */
  handleEntityInfo?: (entity: ProductEntity, params: IParams<CustomBizData>) => Promise<void>,
  /** 全部完成后的回调 */
  onComplete?: (params: IParams<CustomBizData>, entity?: ProductEntity) => Promise<void>,
  enableReplace = false,
  loadingImg = 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/loading.svg',
  maxFPS = 60
) {
  let action: React.MutableRefObject<Action | undefined>,
    dragControl: React.MutableRefObject<MaterialDragSystem>,
    thumbnailEl: React.MutableRefObject<HTMLElement>,
    loadingEl: React.MutableRefObject<HTMLImageElement>;
  const params = useRef<{ url: string; extraInfo?: CustomBizData }>({
    url: '',
    extraInfo: undefined,
  });

  const getRelativePositionFromEvent = (vec: Vec2, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect() as ClientRect;
    const point = {
      x: vec.x - rect.left,
      y: vec.y - rect.top,
    };
    if (point.x <= 0 || point.y <= 0 || point.x > rect.width || point.y > rect.height) {
      return undefined;
    }
    return point;
  };
  const getPickedProduct = (e: PointerEvent) => {
    if (!enableReplace) {
      return;
    }
    const point = getRelativePositionFromEvent(
      {
        x: e.clientX,
        y: e.clientY,
      },
      (SceneUtil.getApp() as THREE.WebGLRenderer).domElement
    );
    if (point) {
      const viewEntity = SceneUtil.hitTarget(point) as ViewEntity;
      if (viewEntity && viewEntity.type === ProductSymbol) {
        return ldeStore.document.findModelById(viewEntity.id) as ProductEntity;
      }
    }
  };

  const setThumbnailClassName = (className: string) => {
    thumbnailEl.current.className = className;
  };
  const materialDragStartHandler =
    (url: string, extraInfo: CustomBizData, previewUrl?: string) => async (pe: PointerEvent) => {
      params.current.url = url;
      params.current.extraInfo = extraInfo;
      if (handleDragStart) {
        await handleDragStart(params);
      }
      const imgEl = thumbnailEl.current;
      if (imgEl) {
        action.current = Action.create('addProduct');
        // imgEl.style.padding = '50%';
        imgEl.style.backgroundRepeat = 'no-repeat';
        imgEl.style.backgroundSize = 'contain';
        imgEl.style.backgroundPosition = 'center';
        imgEl.style.backgroundImage = `url(${previewUrl || url}?x-oss-process=image/resize,w_300/format,webp)`;
        imgEl.id = 'material-thumbnail';
        imgEl.style.width = '150px';
        imgEl.style.height = '150px';
        imgEl.style.backgroundColor = '#fff';
        imgEl.style.opacity = '0.8';
        imgEl.style.border = '2px solid #BF975B';
        imgEl.style.borderRadius = '5px';
        imgEl.style.zIndex = '100';
        imgEl.style.position = 'absolute';
        imgEl.style.top = `${pe.clientY - imgEl.clientHeight / 2}px`;
        imgEl.style.left = `${pe.clientX - imgEl.clientWidth / 2}px`;
        imgEl.style.display = 'block';
      }
    };
  const materialDragHandler = (pe: PointerEvent) => {
    const imgEl = thumbnailEl.current;
    if (imgEl) {
      action.current!.execute(
        () => {
          imgEl.style.top = `${pe.clientY - imgEl.clientHeight / 2}px`;
          imgEl.style.left = `${pe.clientX - imgEl.clientWidth / 2}px`;
          appCommandManager.defaultCommand.select.clearAllSelected();
          const product = getPickedProduct(pe);
          if (product) {
            appCommandManager.defaultCommand.select.select([product]);
          }
        },
        undefined,
        true,
        { immediately: true }
      );
    }
  };
  const materialDragEndHandler = async (e: PointerEvent) => {
    const imgEl = thumbnailEl.current;
    if (imgEl) {
      imgEl.style.display = 'none';
      loadingEl.current.style.display = 'block';
      loadingEl.current.style.zIndex = '100';
      loadingEl.current.style.position = 'absolute';
      loadingEl.current.style.top = `${e.clientY - loadingEl.current.clientHeight / 2}px`;
      loadingEl.current.style.left = `${e.clientX - loadingEl.current.clientWidth / 2}px`;
      let isSuccess = false;
      let product = getPickedProduct(e);
      try {
        await action.current!.execute(
          async () => {
            if (handleImageInfo) {
              await handleImageInfo(params);
            }
            if (product) {
              await ldeStore.actions.replace<CustomBizData>(params.current.url, undefined, params.current.extraInfo);
            } else {
              product = await ldeStore.actions.addEntity<CustomBizData>(
                params.current.url,
                params.current.extraInfo,
                false
              );
              if (!product) {
                isSuccess = false;
              } else {
                const position = SceneUtil.coordinateTransform(
                  {
                    x: e.clientX,
                    y: e.clientY,
                  },
                  CoordinateType.ScreenToScene,
                  0
                );
                product.setPosition({
                  x: position.x,
                  y: position.y,
                });
                ldeStore.document.addModel(product);
              }
            }
            if (product) {
              if (handleEntityInfo) {
                await handleEntityInfo(product, params);
              }
              isSuccess = true;
            }
          },
          undefined,
          true,
          { immediately: true }
        );
      } finally {
        if (isSuccess) {
          action.current!.complete();
        } else {
          action.current!.abort();
        }
        loadingEl.current.style.display = 'none';
      }
      if (onComplete) {
        await onComplete(params, product);
      }
    }
  };

  const dragEventHandler = (e: InteractiveEvent, event: PointerEvent) => {
    if (e === InteractiveEvent.DragStart) {
      materialDragStartHandler(...(dragControl.current.args as [string, CustomBizData, string | undefined]))(event);
    } else if (e === InteractiveEvent.DragMove) {
      materialDragHandler(event);
    } else if (e === InteractiveEvent.DragEnd) {
      materialDragEndHandler(event);
    }
  };

  action = useRef<Action>();
  dragControl = useRef(new MaterialDragSystem(dragEventHandler, maxFPS));
  thumbnailEl = useRef<HTMLElement>(document.createElement('div'));
  loadingEl = useRef<HTMLImageElement>(document.createElement('img'));

  useEffect(() => {
    thumbnailEl.current.style.display = 'none';
    loadingEl.current.style.display = 'none';
    loadingEl.current.src = loadingImg;
    document.body.appendChild(thumbnailEl.current);
    document.body.appendChild(loadingEl.current);
    return () => {
      document.body.removeChild(thumbnailEl.current);
      document.body.removeChild(loadingEl.current);
      dragControl.current.dispose();
    };
  }, []);

  return {
    getRelativePositionFromEvent,
    getPickedProduct,
    materialDragStartHandler,
    materialDragHandler,
    materialDragEndHandler,
    action,
    dragControl,
    thumbnailEl,
    setThumbnailClassName,
  };
}
