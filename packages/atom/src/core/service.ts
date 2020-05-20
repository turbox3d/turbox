import { Domain, reactor, mutation } from '@turbox3d/reactivity';
import { loadScript } from '../utils/load';

class ServiceCenter extends Domain {
  @reactor(true, false, function (target, property) {
    if (target === this.services) {
      loadScript(property as string);
    }
  })
  services = {};

  @mutation()
  addService = (namespace: string, services: object) => {
    this.services[namespace] = services;
  };
}

/**
 * Service Center
 */
export class Service {
  static serviceCenter = new ServiceCenter();

  static register(pluginName: string, services: object) {
    Service.serviceCenter.addService(pluginName, services);
  }

  static get services() {
    return Service.serviceCenter.services;
  }
}
