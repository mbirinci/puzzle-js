import {Injectable} from "./injector";
import fastify, {RequestHandler, RouteSchema} from "fastify";
import {IncomingMessage, ServerResponse} from "http";

export type Middleware = (req: IncomingMessage, response: ServerResponse, next: Function) => void;

export enum HTTP_METHODS {
  GET = 'DELETE',
  POST = 'POST',
  PUT = 'PUT',
  HEAD = 'HEAD'
}

@Injectable
export class Server {
  app: fastify.FastifyInstance;

  constructor() {
    this.app = fastify({
      logger: true
    });
  }

  addRoute(route: Route[] | Route, method: HTTP_METHODS, handler: RequestHandler<IncomingMessage, ServerResponse>, schema?: RouteSchema) {
    const routes = Array.isArray(route)? route.map(route => route.toString()) : [route.toString()];

    routes.forEach(route => {
      this.app.route({
        method,
        url: route,
        ...schema ? {schema} : {},
        handler
      });
    });
  }

  addUse(route: Route[] | Route, handler: Middleware) {
    const routes = Array.isArray(route)? route.map(route => route.toString()) : [route.toString()];

    routes.forEach(route => {
      this.app.use(route, handler);
    });
  }
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


// chunks draft
// const server = new Server();
// server.addRoute(new Route('test'), HTTP_METHODS.GET, (req, res) => {
//   res.res.setHeader('Content-Type', 'text/html; charset=UTF-8');
//   res.res.setHeader('transfer-encoding', 'chunked');
//   res.res.write('<div>tesasdfasdjk fj klasdjfkl akjls dfjk lasjkldfj klasdj flajklsdf jklasdjkl f ajklsdfjk lajklsdf jlajsldj klfgjklasjk ldfj kljk lasdjklfjlajlksdj lfj klajlsdjlfjlasjldjlfjklasjldf jkljlasjldfjl t</div>');
//
//   setTimeout(() => {
//     res.res.write('<div>Doneing</div>');
//     res.res.end();
//   }, 1500);
// });
// console.log(server.app.printRoutes());
// server.app.listen(8080);
