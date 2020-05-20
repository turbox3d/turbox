import { appMetaData } from './app';

export interface Graph {
  [plugin: string]: {
    lazy: boolean,
    deps: string[],
  };
}

export class DepGraph {
  static graph: Graph = {};

  static collect(name: string, lazy: boolean, deps: string[]) {
    DepGraph.graph[name] = {
      lazy,
      deps,
    };
  }

  static preload(currentPluginKey: string) {
    const range = appMetaData.preload.range;
    const node = DepGraph.graph[currentPluginKey];
    if (node && range > 0) {
      const element = node.deps.forEach((dep) => {
        // dep.lazy && loadScript(dep);
      });
    }
  }
}
