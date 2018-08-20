import {Injector} from "./injector";
import {Route, Server} from "./server";
import {ERROR_CODES, PuzzleError} from "./errors";
import {PuzzleApi} from "./api";

export interface GatewayConfig {
  port: number;
  api: {
    routePrefix?: Route;
    handlers: PuzzleApi[];
  };
  fragments: {
    routePrefix?: Route;
    handlers: any[]
  };
}

export interface PuzzleGatewayInterface {
  OnCreate?: () => void;
  OnBeforeStart?: () => void;
  OnReady?: () => void;
  OnListen?: () => void;
  listen: () => void;
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

/**
 * Gateway super class
 * @constructor
 */
export class Gateway implements PuzzleGatewayInterface {
  config: GatewayConfig;
  server: Server = new Server();

  constructor() {
    const config = (this.constructor as any).config as GatewayConfig;

    if (!config) {
      throw new PuzzleError(ERROR_CODES.CLASS_IS_NOT_DECORATED, this.constructor.name);
    } else {
      this.config = config;
    }

    console.log(config.api.handlers[0]);
  }


  listen() {
    this.server.app.listen(this.config.port);
  }
}
