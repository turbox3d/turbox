import { depCollector } from './collector';
import { store } from './store';
import generateUUID from '../utils/uuid';

interface Options {
  name: string;
}

export class Reaction {
  name: string;
  runner: Function;

  dispose() {
    depCollector.clear(this);
  }

  constructor(name: string, runner: Function) {
    this.name = name;
    this.runner = runner;
  }
}

export function reactive(func: Function, options?: Options) {
  const name = (options && options.name) || func.name || `@@TURBOX__REACTIVE_${generateUUID()}`;
  const reaction = new Reaction(name, function() {
    depCollector.start(this);
    func.call(this);
    depCollector.end();
  });
  reaction.runner();
  const unsubscribeHandler = store.subscribe(() => {
    reaction.runner();
  }, reaction);
  return () => {
    if (unsubscribeHandler !== void 0) {
      unsubscribeHandler();
    }
    reaction.dispose();
  };
}
