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
  return Injector.decorate((constructor: new () => Application) => {
    const application = new constructor();
    application.init(config);
    Injector.set(constructor, application);
    application.start();
  }, config);
}


export class Application {
  config!: BootstrapConfig;

  init(config: BootstrapConfig) {
    this.config = config;
  }

  async start() {
    await this.OnBeforeStart();
    this.startGateways();
    this.startStorefronts();
  }

  private startGateways() {
    const gateways = (Array.isArray(this.config.gateway) ? this.config.gateway : (this.config.gateway ? [this.config.gateway] : []))
      .map(gateway => Injector.get(gateway)) as Gateway[];

    gateways.forEach(async gateway => {
      await gateway.OnBeforeStart();
      gateway.listen();
    });
  }

  private startStorefronts() {
    const storefronts = (Array.isArray(this.config.storefront) ? this.config.storefront : (this.config.storefront ? [this.config.storefront] : []))
      .map(storefront => Injector.get(storefront)) as any[];

    storefronts.forEach(storefront => {
      storefront.listen();
    });
  }

  protected OnBeforeStart() {}
}
