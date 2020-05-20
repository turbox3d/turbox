import { reactor, reactive, mutation, Domain } from 'turbox';
import { createPlugin, Service } from './atom';
import { pluginAServices } from './pluginA';

// const Services = {
//   TPZZ_PLUGINA: pluginAServices,
// };

const Services = Service.services;

class HumanModel extends Domain {
  @reactor name = 'xxxB';
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
  @reactor() designId = 'pluginB';

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
  console.log('***pluginB render done***');
  reactive(() => {
    if (!Services.TPZZ_PLUGINA) {
      return;
    }
    Services.TPZZ_PLUGINA.changeAge(18);
    const designId = Services.TPZZ_PLUGINA.getDesignId();
    console.log(designId);
  });
};
const initI18N = () => {
};

export const PLUGIN_NAME = 'TPZZ_PLUGINB';

export const pluginBServices = {
  changeDesignId: (id: string) => {
    store.cm.changeDesignId(id);
  },
  getDesignId: () => {
    return store.cm.designId;
  },
};

createPlugin({
  name: PLUGIN_NAME,
  lazy: false,
  deps: ['TPZZ_PLUGINA'],
  services: pluginBServices,
  main: (meta) => {
    initI18N();
    render();
  },
});
