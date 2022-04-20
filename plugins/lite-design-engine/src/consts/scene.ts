export enum EyeDistance {
  CAMERA = 1000,
}

export enum RenderOrder {
  EMPTY_BACKGROUND = -2,
  BACKGROUND = -1,
  SKY_BOX = 20,
  Cube = 30,
  CONTROL_POINT = 9999,
}

export enum Z_INDEX_ACTION {
  /** 置顶 */
  TOP = 'top',
  /** 置底 */
  BOTTOM = 'bottom',
  /** 下移 */
  DECREASE = 'decrease',
  /** 上移 */
  INCREASE = 'increase',
}

export enum MIRROR_ACTION {
  /** 左右镜像 */
  LEFT_RIGHT = 'left_right',
  /** 上下镜像 */
  TOP_BOTTOM = 'top_bottom',
}

export const ProductSymbol = Symbol('product');
export const CubeSymbol = Symbol('cube');
export const AssemblySymbol = Symbol('assembly');
export const BackgroundSymbol = Symbol('background');
export const ScalePointSymbol = Symbol('scale-point');
export const RotatePointSymbol = Symbol('rotate-point');
export const Product2DSymbol = Symbol('product-2d');
export const SkewPointSymbol = Symbol('skew-point');
export const ClipPointSymbol = Symbol('clip-point');
export const ClipBorderSymbol = Symbol('clip-border');
export const AdjustPointSymbol = Symbol('adjust-point');
export const DeletePointSymbol = Symbol('delete-point');
export const SkyBoxSymbol = Symbol('sky-box');
