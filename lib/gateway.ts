import {Ctor, Injector} from "./injector";
import {DecoratorRoute, HTTP_METHODS, Route, Server} from "./server";
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
    handlers: any[];
  };
  healthCheck?: Route;
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
  decoratorRoutes?: DecoratorRoute[];
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

  /**
   * Initializes gateway
   * @returns {Promise<void>}
   */
  async start() {
    this.healthCheckConfiguration();

    if (this.constructor.prototype.decoratorRoutes) {
      this.addDecoratedRoutes();
    }

    this.addApiRoutes();

    await this.OnBeforeStart();

    this.listen();

    this.OnListen();
  }

  OnBeforeStart() {
  }

  OnListen() {

  }

  /**
   * Adss gateway global endpoints
   */
  private addDecoratedRoutes() {
    this.constructor.prototype.decoratorRoutes.forEach((decoratedRoute: DecoratorRoute) => {
      this.server.addRoute(decoratedRoute.routes, decoratedRoute.method, decoratedRoute.handler.bind(this), decoratedRoute.schema);
    });
  }

  /**
   * Adds api endpoints
   */
  private addApiRoutes() {
    this.config.api.handlers.forEach(handler => {
      const handlerInstance = new handler();
      if (handler.prototype.decoratorRoutes) {
        (handler.prototype.decoratorRoutes).forEach((decoratedRoute: DecoratorRoute) => {
          const routes = Array.isArray(decoratedRoute.routes) ? decoratedRoute.routes : [decoratedRoute.routes];

          this.server.addRoute(routes.map(route => {
            return handlerInstance.config.route.prepend(this.config.api.routePrefix).append(route);
          }), decoratedRoute.method, decoratedRoute.handler.bind(handlerInstance), decoratedRoute.schema);
        });
      }
    });
  }

  /**
   * Adds healthcheck endpoint if config exists
   */
  private healthCheckConfiguration() {
    if (!this.config.healthCheck) return;

    this.server.addRoute(this.config.healthCheck, HTTP_METHODS.GET, (req, reply) => {
      reply.send({
        ts: Date.now()
      });
    }, {
      response: {
        200: {
          type: 'object',
          properties: {
            ts: {
              type: 'number'
            }
          }
        }
      }
    });
  }

  /**
   * Starts gateway server
   */
  private listen() {
    this.server.app.listen(this.config.port);
  }
}
