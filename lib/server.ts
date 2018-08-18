import {Injectable} from "./injector";
import fastify, {FastifyReply, FastifyRequest, RequestHandler, RouteSchema} from "fastify";
import {IncomingMessage, ServerResponse} from "http";


export interface Reply extends FastifyReply<ServerResponse> {
  chunk: (str: string) => void;
}

export interface Request extends FastifyRequest<IncomingMessage> {

}

export type Middleware = (req: IncomingMessage, reply: ServerResponse, next: Function) => void;
export type Handler = (req: Request, reply: Reply) => void;


export enum HTTP_METHODS {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  HEAD = 'HEAD'
}

@Injectable
export class Server {
  app: fastify.FastifyInstance;

  constructor() {
    this.app = fastify({
      logger: true,
    });

    //this.decorateChunk();
  }

  /**
   * Adds new route to fastify instance
   * @param {Route[] | Route} route
   * @param {HTTP_METHODS} method
   * @param {Handler} handler
   * @param {fastify.RouteSchema} schema
   */
  addRoute(route: Route[] | Route, method: HTTP_METHODS, handler: Handler, schema?: RouteSchema) {
    const routes = Array.isArray(route) ? route.map(route => route.toString()) : [route.toString()];

    routes.forEach(route => {
      this.app.route({
        method,
        url: route,
        ...schema ? {schema} : {},
        handler: (handler as RequestHandler<IncomingMessage, ServerResponse>)
      });
    });
  }

  /**
   * Adds new middleware to fastify instance
   * @param {Route[] | Route} route
   * @param {Middleware} handler
   */
  addUse(route: Route[] | Route, handler: Middleware) {
    const routes = Array.isArray(route) ? route.map(route => route.toString()) : [route.toString()];

    routes.forEach(route => {
      this.app.use(route, handler as Middleware);
    });
  }

  /**
   * Decorates fastify reply with chunk
   * @description Fastify doesn't support chunks by default, we use native http response to achieve.
   */
  // private decorateChunk(){
  //   // noinspection TsLint
  //   this.app.decorateReply('chunk', function (this: Reply, str: string) {
  //     this.res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  //     this.res.setHeader('transfer-encoding', 'chunked');
  //     this.res.write(str);
  //   });
  // }
}


@Injectable
export class Route {
  path: string;

  constructor(url: string) {
    this.path = url[0] === '/' ? url : `/${url}`;
  }

  toString() {
    return this.path;
  }
}
