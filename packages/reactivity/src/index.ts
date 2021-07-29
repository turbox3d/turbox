import { use } from './core/use';
import { config } from './const/config';
import { mutation } from './decorators/mutation';
// import { effect } from './decorators/effect';
import { reactor } from './decorators/reactor';
import { computed } from './decorators/computed';
import { Domain, createDomain } from './core/domain';
import { init } from './core/init';
import { reactive, Reaction } from './core/reactive';
import { TimeTravel } from './core/time-travel';
import { ActionStatus } from './const/enums';
import { Action } from './core/action';
import { action } from './decorators/action';
import { depCollector } from './core/collector';
import { store, registerExternalBatchUpdate } from './core/store';
import { REACTIVE_COMPONENT_NAME, UNSUBSCRIBE_HANDLER } from './const/symbol';

export * from './utils/event';

init();

export {
  reactive,
  // effect,
  mutation,
  computed,
  use,
  config,
  reactor,
  init,
  Domain,
  createDomain,
  TimeTravel,
  Action,
  ActionStatus,
  action,
  depCollector,
  Reaction,
  store,
  REACTIVE_COMPONENT_NAME,
  UNSUBSCRIBE_HANDLER,
  registerExternalBatchUpdate,
};
