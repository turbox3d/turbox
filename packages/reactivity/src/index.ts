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
import { ActionStatus } from './const/enums';
import { Action } from './core/action';
import { action } from './decorators/action';

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
  action,
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
  action,
}
