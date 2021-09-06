// based on https://github.com/mridgway/hoist-non-react-statics/blob/master/src/index.js
const hoistBlackList = {
  $$typeof: true,
  render: true,
  compare: true,
  type: true,
};

export function copyStaticProperties(base, target) {
  const keys = Object.keys(base);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (hoistBlackList[key] === void 0) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(base, key)!);
    }
  }
}

export const OBFUSCATED_ERROR =
  'An invariant failed, however the error is obfuscated because this is an production build.';

export function invariant(check: boolean, message?: string | boolean) {
  if (!check) throw new Error(`[turbox]: ${message || OBFUSCATED_ERROR}`);
}

export function fail(message: string | boolean): never {
  invariant(false, message);
  // eslint-disable-next-line no-throw-literal
  throw 'X';
}

export function warn(message: string | boolean) {
  console.warn(`[turbox]: ${message}`);
}

export function bind(fn, ctx) {
  function boundFn(a?: any) {
    const l: number = arguments.length;
    // eslint-disable-next-line no-nested-ternary
    return l
      ? l > 1
        // eslint-disable-next-line prefer-rest-params
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx);
  }
  return boundFn;
}
