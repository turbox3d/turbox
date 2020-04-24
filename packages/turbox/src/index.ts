import { reactive } from './components/reactive';
import { render } from './components/render';
import { use } from './core/use';
import { config } from './const/config';
import { mutation } from './decorators/mutation';
import { effect } from './decorators/effect';
import { reactor } from './decorators/reactor';
import { Domain } from './core/domain';
import { init } from './core/init';
import { undo, redo, getTimeTravelStatus } from './core/collector';

// Proxy、Reflect、Symbol、Promise、Map、Set
// "plugins": [
//   "transform-decorators-legacy",
//   "transform-class-properties"
// ]

export default {
  reactive,
  render,
  effect,
  mutation,
  use,
  config,
  reactor,
  Domain,
  init,
  undo,
  redo,
  getTimeTravelStatus,
}

export {
  reactive,
  render,
  effect,
  mutation,
  use,
  config,
  reactor,
  Domain,
  init,
  undo,
  redo,
  getTimeTravelStatus,
}
