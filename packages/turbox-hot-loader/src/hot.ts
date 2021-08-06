import { config } from '@turbox3d/reactivity';
import { fail } from './utils/index';

const hotModules: { [id: string]: any } = {};

function hotModule(moduleId: string) {
  if (!hotModules[moduleId]) {
    hotModules[moduleId] = {};
  }
  return hotModules[moduleId];
}

export function hot(sourceModule: NodeModule) {
  if (!sourceModule) {
    fail('`hot` was called without any argument provided');
  }
  const moduleId = sourceModule.id || sourceModule.i || sourceModule.filename;
  if (!moduleId) {
    fail('`hot` could not find the `name` of the `module` you have provided');
  }
  const newModule = hotModule(moduleId);
  if (sourceModule.hot) {
    sourceModule.hot.accept((err) => {
      fail(err.message);
    });
    sourceModule.hot.dispose((data) => {
      data.stores = newModule.stores;
    });
  }
  // @hot
  return (stores) => {
    if (sourceModule.hot && sourceModule.hot.data) {
      config({
        strictMode: false
      });
      if (!stores.document) {
        console.warn('[turbox-hot-loader]: please confirm you have `document` store, or your time travel would be wrong caused by hasn\'t be clear.');
      }
      Object.keys(stores).forEach((key) => {
        const newIns = stores[key];
        const oldIns = sourceModule.hot!.data.stores[key];

        // eslint-disable-next-line guard-for-in
        for (const k in oldIns.$$turboxProperties) {
          const element = oldIns.$$turboxProperties[k];
          newIns[k] = element;
        }

        if (key === 'document') {
          oldIns.updateTimeTravelStatus(false, false);
          newIns.updateTimeTravelStatus(false, false);
          newIns.history = void 0;
          newIns.createHistory();
        }

        sourceModule.hot!.data.stores[key] = newIns;
      });
      config({
        strictMode: true
      });
      newModule.stores = sourceModule.hot!.data.stores;
    } else {
      newModule.stores = stores;
    }
    return newModule.stores;
  };
}
