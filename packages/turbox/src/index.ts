import { reactive } from './components/reactive';
import { render } from './components/render';
import { use } from './core/use';
import { config } from './const/config';
import { mutation } from './decorators/mutation';
import { effect } from './decorators/effect';
import { reactor } from './decorators/reactor';
import { Domain } from './core/domain';
import { init } from './core/init';
import { autoRun } from './core/autoRun';
import { TimeTravel } from './core/timeTravel';

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
  TimeTravel,
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
  TimeTravel,
}
