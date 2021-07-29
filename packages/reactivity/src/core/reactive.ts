import { generateUUID } from '@turbox3d/shared';
import { depCollector } from './collector';
import { store } from './store';
import { TURBOX_PREFIX } from '../const/symbol';
import { EEventName, emitter } from '../utils/event';

interface Options {
  name: string;
  /** is computed reactive function */
  computed: boolean;
  /** is lazy computed, only computed reactive have this option */
  lazy: boolean;
  /** deps */
  deps: Function[];
  /** trigger callback synchronously */
  immediately: boolean;
}

export class Reaction {
  name: string;
  runner: Function;
  computed: boolean;
  lazy: boolean;
  deps: Function[];
  immediately: boolean;
  unsubscribeHandler?: () => void;

  constructor(name: string, runner: Function, computed: boolean, lazy: boolean, deps: Function[], immediately: boolean) {
    this.name = name;
    this.runner = runner;
    this.computed = computed;
    this.lazy = lazy;
    this.deps = deps;
    this.immediately = immediately;
  }

  dispose() {
    if (this.unsubscribeHandler !== void 0) {
      this.unsubscribeHandler();
    }
    depCollector.clear(this);
  }
}

export function createReaction(func: Function, options?: Partial<Options>) {
  const name = (options && options.name) || func.name || `${TURBOX_PREFIX}REACTIVE_${generateUUID()}`;
  const lazy = options && options.lazy !== void 0 ? options.lazy : false;
  const deps = (options && options.deps) || [];
  const immediately = options && options.immediately !== void 0 ? options.immediately : true;
  let firstRun = true;
  const reaction = new Reaction(name, (isInner = false) => {
    try {
      depCollector.start(reaction);
      if (reaction.deps.length > 0) {
        const values: any[] = [];
        reaction.deps.forEach((dep) => {
          const value = dep();
          values.push(value);
        });
        depCollector.end();
        !firstRun && func.call(null, ...values);
      } else {
        func.call(null);
        depCollector.end();
      }
      if (firstRun) {
        firstRun = false;
      }
    } catch (error) {
      depCollector.end();
      if (firstRun) {
        firstRun = false;
      }
      if (!isInner) {
        throw error;
      }
    }
  }, !!(options && options.computed), lazy, deps, immediately);

  const subscribe = () => {
    reaction.unsubscribeHandler = store.subscribe((isInner: boolean) => {
      reaction.runner(isInner);
    }, reaction);
    reaction.runner();
  };

  if (!store) {
    emitter.on(EEventName.storeOnActive, () => {
      subscribe();
    });
  } else {
    subscribe();
  }

  return reaction;
}

export function reactive(func: Function, options?: Partial<Pick<Options, 'name' | 'deps' | 'immediately'>>) {
  return createReaction(func, options);
}
