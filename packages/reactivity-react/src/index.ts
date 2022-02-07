import * as ReactDOM from 'react-dom';
import { registerExternalBatchUpdate, init } from '@turbox3d/reactivity';
import { Reactive } from './components/Reactive';
import { IdCustomType } from './utils/index';

init();
registerExternalBatchUpdate({
  handler: ReactDOM.unstable_batchedUpdates,
  idCustomType: IdCustomType,
});

export * from '@turbox3d/reactivity';
export { Reactive };
