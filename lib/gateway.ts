import {Ctor, Injector} from "./injector";
import {Route, Server} from "./server";
import {ERROR_CODES, PuzzleError} from "./errors";
import {Api} from "./api";

export interface GatewayConfig {
  port: number;
  api: {
    routePrefix?: Route;
    handlers: Array<Ctor<Api>>;
  };
  fragments: {
    routePrefix?: Route;
    handlers: any[]
  };
}

/**
 * Decorates class as Gateway
 * @param {GatewayConfig} config
 * @returns {(constructor: any) => any}
 * @constructor
 */
export function PuzzleGateway<T>(config: GatewayConfig) {
  return Injector.decorate((constructor: () => void) => {
    console.log(`Registering Gateway: ${constructor.name}`);

  }, config);
}

export interface GatewayBase {
  OnBeforeStart?: () => Promise<void> | void;
  OnListen?: () => void;
}

/**
 * Gateway base class
 * @constructor
 */
export class Gateway implements GatewayBase {
  config: GatewayConfig;
  server: Server = new Server();

  constructor() {
    const config = (this.constructor as any).config as GatewayConfig;

    if (!config) {
      throw new PuzzleError(ERROR_CODES.CLASS_IS_NOT_DECORATED, this.constructor.name);
    } else {
      this.config = config;
    }
  }

  async start() {
    await this.OnBeforeStart();

    this.listen();

    this.OnListen();
  }

  OnBeforeStart() {
  }

  OnListen() {
  }

  private listen() {
    this.server.app.listen(this.config.port);
  }
}
