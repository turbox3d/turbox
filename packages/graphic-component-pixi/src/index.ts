const ENV = process.env.NODE_ENV;
if (
  ENV !== 'production' &&
  ENV !== 'test' &&
  typeof console !== 'undefined' &&
  console.warn && // eslint-disable-line no-console
  typeof window !== 'undefined'
) {
  // eslint-disable-next-line no-console
  console.warn(
    'You are using a whole package of graphic component pixi, ' +
    'please use https://www.npmjs.com/package/babel-plugin-import to reduce app bundle size.',
  );
}

export { default as Rect2d } from './rect2d/index';
export { default as Circle2d } from './circle2d/index';
export { default as Polygon } from './polygon/index';
export { default as Placement } from './placement/index';
export { default as DrawUtils } from './draw-utils/index';
export { default as Dimension } from './dimension/index';
export { default as RadiusDimension } from './radius-dimension/index';
export { default as AngleDimension } from './angle-dimension/index';
export { default as Axis2d } from './axis2d/index';
export { default as Arrow2d } from './arrow2d/index';
export { default as Gizmo2d } from './gizmo2d/index';
