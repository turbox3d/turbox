import { appMetaData } from './app';
import { Service } from './service';
import { DepGraph } from './dep';

declare global {
  function requestIdleCallback(callback: () => void): number;
}

export interface PluginParams {
  name: string;
  /** 强制懒加载 */
  lazy: boolean;
  deps?: string[];
  services?: object;
  main: (meta: object) => void;
}

/**
 * Create plugin.
 */
export function createPlugin({
  name,
  lazy = false,
  deps = [],
  services,
  main,
}: PluginParams) {
  DepGraph.collect(name, lazy, deps);
  services && Service.register(name, services);
  main(appMetaData.meta);
  // if (requestIdleCallback) {
  //   requestIdleCallback(() => {
  //     DepGraph.preload(name);
  //   });
  // } else {
  //   setTimeout(() => {
  //     DepGraph.preload(name);
  //   }, 0);
  // }
}
