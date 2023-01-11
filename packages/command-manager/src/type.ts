import { IConstructorOf, Vec2, Vec3 } from '@turbox3d/shared';
import { InteractiveConfig, ViewEntity, CoordinateType } from '@turbox3d/event-manager';

export interface IDeclaredMap<T> {
  [key: string]: IConstructorOf<T>;
}

export type IInstanceMap<T, M extends IDeclaredMap<T>> = {
  [K in keyof M]: InstanceType<M[K]>;
};

export type ComposedCommand<B, T, M extends IDeclaredMap<T>> = IConstructorOf<B & IInstanceMap<T, M>>;

export interface SceneTool {
  updateInteractiveObject: (view: any, config?: InteractiveConfig) => void;
  updateCursor: (cursor?: string) => void;
  hitTarget: (point: { x: number; y: number }) => Partial<ViewEntity> | undefined;
  coordinateTransform: (point: Vec2 | Vec3, type: CoordinateType, z?: number) => Vec2 | Vec3;
  getCamera: () => any;
  getRaycaster: () => any;
  getScene: () => any;
  getRootView: () => any;
  getScreenShot: (
    sx?: number,
    sy?: number,
    w?: number,
    h?: number,
    fileType?: string,
    quality?: number,
    isBase64?: boolean
  ) => Promise<string | Blob>;
  getApp: () => any;
  addTicker: (ticker: () => void) => void;
  removeTicker: (ticker: () => void) => void;
}
