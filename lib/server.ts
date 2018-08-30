import {Injectable} from "./injector";
import fastify, {FastifyReply, FastifyRequest, JSONSchema, RequestHandler} from "fastify";
import {IncomingMessage, ServerResponse} from "http";
import {Gateway} from "./gateway";
import {Api} from "./api";


export interface Reply extends FastifyReply<ServerResponse> {
  chunk: (str: string) => void;
}

export interface Request extends FastifyRequest<IncomingMessage> {

}

export interface ReplyDescriptor extends PropertyDescriptor {
  value: Handler;
}

export interface DecoratorRoute {
  routes: Route[];
  method: HTTP_METHODS;
  handler: Handler;
  schema?: JsonSchema;
}

export type Middleware = (req: IncomingMessage, reply: ServerResponse, next: Function) => void;
export type Handler = (req: Request, reply: Reply) => void;

export enum HTTP_METHODS {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  HEAD = 'HEAD',
  DELETE = 'DELETE'
}

export interface JsonChild {
  [key: string]: {
    type: string;
    properties?: JsonChild
  };
}

export interface JsonSchema {
  response?: {
    [statusCode: number]: {
      type: string;
      properties?: JsonChild;
    };
  };
  body?: {
    type: 'object',
    properties: JsonChild
    required?: string[];
  };
  querystring?: {
    type: 'object',
    properties: JsonChild
    required?: string[];
  };
  params?: {
    type: 'object',
    properties: JsonChild
    required?: string[];
  };
  headers?: {
    type: 'object',
    properties: JsonChild
    required?: string[];
  };
}

/**
 * Generates decorator to bind route to method
 * @param {HTTP_METHODS} method
 * @returns {(routes: (Route[] | Route), schema?: JsonSchema) => <T extends Gateway>(target: T, propertyKey: string, descriptor: PropertyDescriptor) => ReplyDescriptor}
 */
const decoratedRouteGenerator = (method: HTTP_METHODS) => (routes: Route[] | Route, schema?: JsonSchema) => {
  return <T extends Gateway | Api>(target: T, propertyKey: string, descriptor: PropertyDescriptor) => {
    const decoratedHandler = {
      routes,
      method,
      handler: descriptor.value,
      schema
    };

    if (target.constructor.prototype.decoratorRoutes) {
      target.constructor.prototype.decoratorRoutes.push(decoratedHandler);
    } else {
      target.constructor.prototype.decoratorRoutes = [decoratedHandler];
    }

    return descriptor as ReplyDescriptor;
  };
};

export const get = decoratedRouteGenerator(HTTP_METHODS.GET);
export const post = decoratedRouteGenerator(HTTP_METHODS.POST);
export const head = decoratedRouteGenerator(HTTP_METHODS.HEAD);
export const put = decoratedRouteGenerator(HTTP_METHODS.PUT);
export const del = decoratedRouteGenerator(HTTP_METHODS.DELETE);

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
  addRoute(route: Route[] | Route, method: HTTP_METHODS, handler: Handler, schema?: JsonSchema) {
    const routes = Array.isArray(route) ? route.map(route => route.toString()) : [route.toString()];

    routes.forEach(route => {
      this.app.route({
        method,
        url: route,
        ...schema ? {schema: schema as JSONSchema} : {},
        handler: (handler as RequestHandler<IncomingMessage, ServerResponse>),
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

  append(route?: Route) {
    if (!route) return new Route(this.path);

    return new Route(this.path + route.toString());
  }

  prepend(route?: Route) {
    if (!route) return new Route(this.path);

    return new Route(route.toString() + this.path);
  }

  toString() {
    return this.path;
  }
}
