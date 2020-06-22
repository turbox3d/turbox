import { Reactive } from './components/Reactive';
import { render } from './core/render';
import { use } from './core/use';
import { config } from './const/config';
import { mutation } from './decorators/mutation';
import { effect } from './decorators/effect';
import { reactor } from './decorators/reactor';
import { computed } from './decorators/computed';
import { Domain } from './core/domain';
import { init } from './core/init';
import { reactive } from './core/reactive';
import { TimeTravel } from './core/time-travel';

export default {
  Reactive,
  reactive,
  render,
  effect,
  mutation,
  computed,
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
  computed,
  use,
  config,
  reactor,
  Domain,
  init,
  TimeTravel,
}
