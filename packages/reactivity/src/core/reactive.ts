import { depCollector } from './collector';
import { store } from './store';
import generateUUID from '../utils/uuid';
import { emitter } from './init';

interface Options {
  name: string;
  /** is computed reactive function */
  computed: boolean;
  /** is lazy computed */
  lazy: boolean;
}

export class Reaction {
  name: string;
  runner: Function;
  computed: boolean;
  lazy: boolean;
  unsubscribeHandler?: () => void;

  dispose() {
    if (this.unsubscribeHandler !== void 0) {
      this.unsubscribeHandler();
    }
    depCollector.clear(this);
  }

  constructor(name: string, runner: Function, computed: boolean, lazy: boolean) {
    this.name = name;
    this.runner = runner;
    this.computed = computed;
    this.lazy = lazy;
  }
}

export function reactive(func: Function, options?: Partial<Options>) {
  const name = (options && options.name) || func.name || `@@TURBOX__REACTIVE_${generateUUID()}`;
  const lazy = options && options.lazy !== void 0 ? options.lazy : true;
  const reaction = new Reaction(name, function () {
    depCollector.start(this);
    func.call(this);
    depCollector.end();
  }, !!(options && options.computed), lazy);

  const subscribe = () => {
    reaction.runner();
    reaction.unsubscribeHandler = store.subscribe(() => {
      reaction.runner();
    }, reaction);
  };

  if (!store) {
    emitter.on('storeOnActive', () => {
      subscribe();
    });
  } else {
    subscribe();
  }

  return reaction;
}
