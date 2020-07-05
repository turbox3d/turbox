import { Reactive } from './components/Reactive';
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
import { Action } from './core/action';
import { ActionStatus } from './const/enums';

export default {
  Reactive,
  reactive,
  effect,
  mutation,
  computed,
  use,
  config,
  reactor,
  init,
  Domain,
  TimeTravel,
  Action,
  ActionStatus,
}

export {
  Reactive,
  reactive,
  effect,
  mutation,
  computed,
  use,
  config,
  reactor,
  init,
  Domain,
  TimeTravel,
  Action,
  ActionStatus,
}
