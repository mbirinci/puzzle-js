import {Injector} from "./injector";
import {Server} from "./server";
import {ERROR_CODES, PuzzleError} from "./errors";

export interface GatewayConfig {
  port: number;
}

export interface PuzzleGatewayInterface {
  OnCreate?: () => void;
  OnBeforeStart?: () => void;
  OnReady?: () => void;
  OnListen?: () => void;
  listen: () => void;
}

export function PuzzleGateway<T>(config: GatewayConfig) {
  return Injector.decorate((constructor: () => void) => {
    console.log(`Registering Gateway: ${constructor.name}`);

  }, config);
}

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
  }

  listen() {
    this.server.app.listen(this.config.port);
  }
}
