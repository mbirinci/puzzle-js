import "reflect-metadata";
import {Ctor, Injector} from "./injector";
import {Gateway} from "./gateway";

export interface BootstrapConfig {
  gateway?: Array<Ctor<Gateway>> | Ctor<Gateway>;
  storefront?: Array<Ctor<any>> | Ctor<any>;
}

/**
 * Starts application
 * @param {BootstrapConfig} config
 * @returns {(constructor: any) => any}
 * @constructor
 */
export function PuzzleApplication(config: BootstrapConfig) {
  return Injector.decorate((constructor: () => void) => {
    Application.start(config);
  }, config);
}

class Application {
  static start(config: BootstrapConfig) {
    const gateways = (Array.isArray(config.gateway) ? config.gateway : (config.gateway ? [config.gateway] : []))
      .map(gateway => Injector.get(gateway) as Gateway);
    const storefronts = (Array.isArray(config.storefront) ? config.storefront : (config.storefront ? [config.storefront] : []))
      .map(storefront => Injector.get(storefront) as any);

    gateways.forEach(gateway => {
      gateway.listen();
    });

    storefronts.forEach(storefront => {
      storefront.listen();
    });
  }
}
