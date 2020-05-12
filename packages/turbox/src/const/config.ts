import { ConfigCtx } from '../interfaces';
import { deepMerge } from '../utils/deep-merge';

export let ctx: ConfigCtx = {
  middleware: {
    logger: process.env.NODE_ENV !== 'production',
    effect: true
  },
  timeTravel: {
    isActive: false,
    maxStepNumber: 5,
  },
  devTool: false,
};

/**
 * framework global config method.
 */
export function config(conf: Partial<ConfigCtx>) {
  ctx = deepMerge(ctx, conf);
}
