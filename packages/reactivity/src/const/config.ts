import { ConfigCtx } from '../interfaces';
import { deepMerge } from '../utils/deep-merge';

export let ctx: ConfigCtx = {
  middleware: {
    logger: process.env.NODE_ENV !== 'production',
    diffLogger: true,
    effect: false,
    perf: process.env.NODE_ENV !== 'production',
  },
  timeTravel: {
    isActive: false,
    maxStepNumber: 20,
  },
  strictMode: process.env.NODE_ENV !== 'production',
  devTool: false,
};

/**
 * framework global config method.
 */
export function config(conf: Partial<ConfigCtx>) {
  ctx = deepMerge(ctx, conf);
}
