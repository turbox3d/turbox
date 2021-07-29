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
