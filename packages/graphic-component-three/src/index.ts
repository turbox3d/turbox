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
    'You are using a whole package of graphic component three, ' +
    'please use https://www.npmjs.com/package/babel-plugin-import to reduce app bundle size.',
  );
}

export { default as Arrow3d } from './arrow3d/index';
export { default as Axis3d } from './axis3d/index';
export { default as Circle3d } from './circle3d/index';
export { default as Cube } from './cube/index';
export { default as FatLine } from './fat-line/index';
export { default as Gizmo3d } from './gizmo3d/index';
export { default as Rect3d } from './rect3d/index';
export { default as Wireframe } from './wireframe/index';
export { default as Animation3d } from './animation3d/index';
