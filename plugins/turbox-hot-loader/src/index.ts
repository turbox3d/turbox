// @ts-nocheck
import { fail } from './utils';
import { hot as reactComponentHot } from './components/hot';
import { hot as domainHot } from './hot';

declare global {
  interface NodeModule {
    i?: string;
    parents?: string[];
  }
  interface Window {
    $$turbox_hot: boolean;
  }
}

export let hot;
export let hotDomain: <T>(stores: T) => T;

if (module.hot) {
  const cache = require.cache;
  if (!module.parents || module.parents.length === 0) {
    fail('`hot` is not supported on your system.');
  }
  const parent = cache[module.parents[0]];
  if (!parent) {
    fail('`hot` is not supported on your system.');
  }
  // remove from cache, trigger create new hot module and update ref
  delete cache[module.id];
  hot = reactComponentHot(parent);
  hotDomain = domainHot(parent);
}
