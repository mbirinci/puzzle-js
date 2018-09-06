import "reflect-metadata";
import {Ctor, Injector} from "./injector";
import {Gateway} from "./gateway";
import cluster from "cluster";
import os from "os";

export interface BootstrapConfig {
  gateway?: Array<Ctor<Gateway>> | Ctor<Gateway>;
  storefront?: Array<Ctor<any>> | Ctor<any>;
  clusterMode?: boolean; //todo cluster.fork
}

/**
 * Starts application
 * @param {BootstrapConfig} config
 * @returns {(constructor: any) => any}
 * @constructor
 */
export function PuzzleApplication(config: BootstrapConfig) {
  const injectStarter = (constructor: Ctor<any>) => {
    const configuredConstructor = Injector.inject(constructor, config as any);
    configuredConstructor.config = config;
    const application = Injector.get(configuredConstructor);
    application.init(config);
    application.start();
    return constructor;
  };

  return (constructor: Ctor<any>) => injectStarter(constructor) as Ctor<any>;
}


export class Application {
  config!: BootstrapConfig;

  init(config: BootstrapConfig) {
    this.config = config;
  }

  async start() {
    if (this.config.clusterMode && cluster.isMaster) {
      this.clusterMaster();
    } else {
      await this.OnBeforeStart();
      await this.startGateways();
    }
    //this.startStorefronts();
  }

  private clusterMaster() {
    const cpus = os.cpus();
    cpus.forEach(cpu => {
      cluster.fork();
    });

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      cluster.fork();
    });
  }

  private async startGateways() {
    const gateways = (this.config.gateway ?
      (Array.isArray(this.config.gateway) ? this.config.gateway : [this.config.gateway]) : [])
      .map(gateway => Injector.get(gateway)) as Gateway[];

    return Promise.all(gateways.map(async gateway => {
      await gateway.start();
    }));
  }

  // private startStorefronts() {
  //   const storefronts = (Array.isArray(this.config.storefront) ? this.config.storefront : (this.config.storefront ? [this.config.storefront] : []))
  //     .map(storefront => Injector.get(storefront)) as any[];
  //
  //   storefronts.forEach(storefront => {
  //     storefront.listen();
  //   });
  // }

  protected OnBeforeStart() {
  }
}
