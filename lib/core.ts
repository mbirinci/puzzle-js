import "reflect-metadata";
import {Ctor, Injector} from "./injector";
import {Gateway} from "./gateway";

export interface BootstrapConfig {
  gateway?: Array<Ctor<Gateway>> | Ctor<Gateway>;
  storefront?: Array<Ctor<any>> | Ctor<any>;
}

export function Bootstrap(config: BootstrapConfig) {
  return Injector.decorate((constructor: () => void) => {
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
  }, config);
}
