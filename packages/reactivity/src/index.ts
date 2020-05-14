import { Reactive } from './components/reactive';
import { render } from './components/render';
import { use } from './core/use';
import { config } from './const/config';
import { mutation } from './decorators/mutation';
import { effect } from './decorators/effect';
import { reactor } from './decorators/reactor';
import { Domain } from './core/domain';
import { init } from './core/init';
import { reactive } from './core/reactive';
import { TimeTravel } from './core/timeTravel';

export default {
  Reactive,
  reactive,
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
  Reactive,
  reactive,
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
