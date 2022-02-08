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
    'You are using a whole package of design engine, ' +
    'please use https://www.npmjs.com/package/babel-plugin-import to reduce app bundle size.',
  );
}

export { default as AssemblyEntityObject } from './assembly-entity-object/index';
export { default as CollisionEngine } from './collision-engine/index';
export { default as DocumentSystem } from './document-system/index';
export { default as EntityObject } from './entity-object/index';
export { default as EnvSystem } from './env-system/index';
export { default as FreeDrawCommand } from './free-draw-command/index';
export { default as HintCommand } from './hint-command/index';
export { default as ImageSystem } from './image-system/index';
export { default as InferenceEngine } from './inference-engine/index';
export { default as LoadSystem } from './load-system/index';
export { default as MaterialBrushCommand } from './material-brush-command/index';
export { default as MaterialDragSystem } from './material-drag-system/index';
export { default as MeasureCommand } from './measure-command/index';
export { default as MountSystem } from './mount-system/index';
export { default as PlacementEngine } from './placement-engine/index';
export { default as RectSelectionCommand } from './rect-selection-command/index';
export { default as SelectionCommand } from './selection-command/index';
export { default as SpaceEngine } from './space-engine/index';
export { default as UnitSystem } from './unit-system/index';
