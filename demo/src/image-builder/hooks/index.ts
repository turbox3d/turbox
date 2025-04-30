/* eslint max-lines-per-function:0 */
/* eslint max-params:0 */
/* eslint prefer-const:0 */
import * as PIXI from 'pixi.js';
import React, { useRef, useEffect } from 'react';

import { Action, MaterialDragSystem, CoordinateType, Vec2, InteractiveEvent } from '@turbox3d/turbox';

import { appCommandManager } from '../commands/index';
import { ItemSymbol } from '../common/consts/view-entity';
import { ItemEntity } from '../models/entity/item';
import { imageBuilderStore } from '../models/index';
import { ItemType } from '../common/consts/scene';

type IParams<T> = React.MutableRefObject<{
  url: string;
  extraInfo?: T;
}>;

export function useMaterialDragAndReplace<CustomBizData extends { type: string; name?: number | string; }>(
  /** 开始拖拽前的回调 */
  handleDragStart?: (params: IParams<CustomBizData>) => Promise<void>,
  /** 预处理需要加载的图片 */
  handleImageInfo?: (params: IParams<CustomBizData>) => Promise<void>,
  /** 后处理创建的 entity */
  handleEntityInfo?: (entity: ItemEntity, params: IParams<CustomBizData>) => Promise<void>,
  /** 全部完成后的回调 */
  onComplete?: (params: IParams<CustomBizData>, entity?: ItemEntity) => Promise<void>,
  enableReplace = false,
  loadingImg = 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/loading.svg',
  maxFPS = 120
) {
  let action: React.MutableRefObject<Action | undefined>;
  let dragControl: React.MutableRefObject<MaterialDragSystem>;
  let thumbnailEl: React.MutableRefObject<HTMLElement>;
  let loadingEl: React.MutableRefObject<HTMLImageElement>;
  const params = useRef<{ url: string; extraInfo?: CustomBizData }>({
    url: '',
    extraInfo: undefined,
  });

  const getRelativePositionFromEvent = (vec: Vec2, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
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
      (imageBuilderStore.scene.getSceneTools().getApp() as PIXI.Application).view as HTMLCanvasElement
    );
    if (point) {
      const viewEntity = imageBuilderStore.scene.getSceneTools().hitTarget(point);
      if (viewEntity && viewEntity.type === ItemSymbol) {
        return imageBuilderStore.document.findModelById(viewEntity.id!) as ItemEntity;
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
        imgEl.style.backgroundImage = `url(${previewUrl || url})`;
        imgEl.id = 'material-thumbnail';
        imgEl.style.width = '150px';
        imgEl.style.height = '150px';
        imgEl.style.backgroundColor = '#fff';
        imgEl.style.opacity = '0.8';
        imgEl.style.border = '2px solid #BF975B';
        imgEl.style.borderRadius = '5px';
        imgEl.style.zIndex = '9999';
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
          appCommandManager.default.select.clearAllSelected();
          const product = getPickedProduct(pe);
          if (product) {
            appCommandManager.default.select.select([product]);
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
      loadingEl.current.style.zIndex = '9999';
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
              await appCommandManager._shared.entity.replaceItemEntity<CustomBizData>(
                params.current.url,
                undefined,
                params.current.extraInfo
              );
            } else {
              if (params.current.extraInfo?.type === ItemType.IMAGE) {
                product = await appCommandManager._shared.entity.addItemEntity<CustomBizData>(
                  params.current.url,
                  params.current.extraInfo,
                  false
                );
              } else if (params.current.extraInfo?.type === ItemType.TEXT) {
                product = await appCommandManager._shared.entity.addTextItemEntity<CustomBizData>(
                  'hello world',
                  params.current.extraInfo,
                  false
                );
              } else if (params.current.extraInfo?.type === ItemType.BUTTON) {
                product = await appCommandManager._shared.entity.addButtonItemEntity<CustomBizData>(
                  'Go to TikTok',
                  params.current.extraInfo,
                  false
                );
              }
              if (!product) {
                isSuccess = false;
              } else {
                const position = imageBuilderStore.scene.getSceneTools().coordinateTransform(
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
                imageBuilderStore.document.addModel(product);
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

  const dragEventHandler = (
    e: InteractiveEvent,
    event: PointerEvent | WheelEvent | React.PointerEvent<Element> | Touch
  ) => {
    if (e === InteractiveEvent.DragStart) {
      materialDragStartHandler(...(dragControl.current.args as [string, CustomBizData, string | undefined]))(
        event as PointerEvent
      );
    } else if (e === InteractiveEvent.DragMove) {
      materialDragHandler(event as PointerEvent);
    } else if (e === InteractiveEvent.DragEnd) {
      materialDragEndHandler(event as PointerEvent);
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
