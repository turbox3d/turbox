import { ConfigCtx } from '../interfaces';
import { deepMerge } from '../utils/deep-merge';

const isDev = process.env.NODE_ENV !== 'production';

export let ctx: ConfigCtx = {
  middleware: {
    logger: isDev,
    diffLogger: true,
    effect: false,
    perf: isDev,
    skipNestLog: true,
    skipNestPerfLog: true,
  },
  timeTravel: {
    isActive: false,
    maxStepNumber: 20,
    keepActionChain: isDev,
  },
  strictMode: isDev,
  devTool: false,
};

/**
 * framework global config method.
 */
export function config(conf: Partial<ConfigCtx>) {
  ctx = deepMerge(ctx, conf);
}
