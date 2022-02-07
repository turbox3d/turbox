import { IViewEntity, CoordinateType } from '@turbox3d/event-manager';
import { Vec2, Vec3, IConstructorOf } from '@turbox3d/shared';

export enum CommandEventType {
  onClick,
  onDBClick,
  onRightClick,
  onDragStart,
  onDragMove,
  onDragEnd,
  onPinchStart,
  onPinch,
  onPinchEnd,
  onRotateStart,
  onRotate,
  onRotateEnd,
  onPress,
  onPressUp,
  onHoverIn,
  onHoverOut,
  onCarriageMove,
  onCarriageEnd,
  onZoom,
}

export interface ITool {
  hitTarget: (point: { x: number; y: number }) => IViewEntity | undefined;
  coordinateTransform: (point: Vec2 | Vec3, type: CoordinateType, z?: number) => Vec2 | Vec3;
  getCamera: () => any;
  getRaycaster: () => any;
  getScene: () => any;
  getRootView: () => any;
  getScreenShot: (sx?: number, sy?: number, w?: number, h?: number, fileType?: string, quality?: number, isBase64?: boolean) => Promise<string | Blob>;
  getApp: () => any;
}

export interface IDeclaredMap<T> {
  [key: string]: IConstructorOf<T>;
}

export type IInstanceMap<T, M extends IDeclaredMap<T>> = {
  [K in keyof M]: InstanceType<M[K]>;
};

export type ComposedCommand<B, T, M extends IDeclaredMap<T>> = IConstructorOf<B & IInstanceMap<T, M>>;
