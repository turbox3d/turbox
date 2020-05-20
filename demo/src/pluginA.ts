import { reactor, reactive, mutation, Domain } from 'turbox';
import { createPlugin, Service } from './atom';
import { pluginBServices } from './pluginB';

// const Services = {
//   TPZZ_PLUGINB: pluginBServices,
// };

const Services = Service.services;

class HumanModel extends Domain {
  @reactor name = 'xxxA';
  @reactor() age = 20;

  @mutation
  changeName = (name) => {
    this.name = name;
  };

  @mutation()
  changeAge = (age) => {
    this.age = age;
  };
}

class CommonModel extends Domain {
  @reactor() designId = 'pluginA';

  @mutation()
  changeDesignId = (designId) => {
    this.designId = designId;
  };
}

const store = {
  hm: new HumanModel(),
  cm: new CommonModel(),
};

const render = () => {
  console.log('***pluginA render done***');
  reactive(() => {
    if (!Services.TPZZ_PLUGINB) {
      return;
    }
    setTimeout(() => {
      Services.TPZZ_PLUGINB.changeDesignId('newPluginB');
    }, 3000);
  });

  reactive(() => {
    if (!Services.TPZZ_PLUGINB) {
      return;
    }
    const designId = Services.TPZZ_PLUGINB.getDesignId();
    console.log(designId);
  });
};
const initI18N = () => {
}

export const PLUGIN_NAME = 'TPZZ_PLUGINA';

export const pluginAServices = {
  changeAge: (age: number) => {
    store.hm.changeAge(age);
  },
  getDesignId: () => {
    return store.cm.designId;
  },
};

createPlugin({
  name: PLUGIN_NAME,
  lazy: false,
  deps: ['TPZZ_PLUGINB'],
  services: pluginAServices,
  main: (meta) => {
    initI18N();
    render();
  },
});
