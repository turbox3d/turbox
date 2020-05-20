import { reactor, reactive, mutation, Domain, Service, createPlugin } from 'turbox';

// const Services = {
//   TPZZ_PLUGINA: pluginAServices,
// };

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
  // reactive(() => {
  //   if (!Service.services.TPZZ_PLUGINA) {
  //     return;
  //   }
  //   Service.services.TPZZ_PLUGINA.changeAge(18);
  //   const designId = Service.services.TPZZ_PLUGINA.getDesignId();
  //   console.log('pluginB获取A的Id：', designId);
  // });
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
