import { reactive } from './components/reactive';
import { render } from './components/render';
import { use } from './core/use';
import { config, enableTimeTravel, disableTimeTravel } from './const/config';
import { mutation } from './decorators/mutation';
import { effect } from './decorators/effect';
import { reactor } from './decorators/reactor';
import { Domain } from './core/domain';
import { init } from './core/init';
import { undo, redo, getTimeTravelStatus } from './core/collector';
import { autoRun } from './core/autoRun';

export default {
  reactive,
  autoRun,
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
  enableTimeTravel,
  disableTimeTravel,
}

export {
  reactive,
  autoRun,
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
  enableTimeTravel,
  disableTimeTravel,
}
