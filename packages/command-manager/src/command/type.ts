import { IViewEntity, CoordinateType } from '@turbox3d/event-manager';
import { Vec2, Vec3, IConstructorOf } from '@turbox3d/shared';

export enum CommandEventType {
  onClick,
  onDBClick,
  onRightClick,
  onDragStart,
  onDragMove,
  onDragEnd,
  onHoverIn,
  onHoverOut,
  onCarriageMove,
  onCarriageEnd,
  onZoom,
}

export interface ITool {
  hitTarget: (point: { x: number; y: number }) => IViewEntity | undefined;
  coordinateTransform: (point: Vec2 | Vec3, type: CoordinateType) => Vec2 | Vec3;
  getCamera: () => any;
}

export interface IDeclaredMap<T> {
  [key: string]: IConstructorOf<T>;
}

export type IInstanceMap<T, M extends IDeclaredMap<T>> = {
  [K in keyof M]: InstanceType<M[K]>;
};

export type ComposedCommand<B, T, M extends IDeclaredMap<T>> = IConstructorOf<B & IInstanceMap<T, M>>;
