import * as ReactDOM from 'react-dom';
import { registerExternalBatchUpdate, init } from '@turbox3d/reactivity';
import { Reactive } from './components/Reactive';

init();
registerExternalBatchUpdate(ReactDOM.unstable_batchedUpdates);

export * from '@turbox3d/reactivity';
export { Reactive };
