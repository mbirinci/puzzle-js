import {Gateway, PuzzleGateway} from "./gateway";
import {Application, PuzzleApplication} from "./application";
import {Api, PuzzleApi} from "./api";
import {get, Reply, Request, Route} from "./server";
import {Injectable} from "./injector";

@Injectable
class UselessRandomGenerator {
  random() {
    return Math.random();
  }
}

@PuzzleApi({
  route: new Route('/items'),
})
class ProductUserController extends Api {
  rand: number;

  constructor(randomGenerator: UselessRandomGenerator) {
    super();
    this.rand = randomGenerator.random();
  }

  @get(new Route('/all'))
  getProducts(req: Request, reply: Reply) {
    reply.send({
      ts: this.rand
    });
  }
}

@PuzzleApi({
  route: new Route('/user'),
  subApis: [ProductUserController]
})
class ProductApi extends Api {
  rand: number;

  constructor(randomGenerator: UselessRandomGenerator) {
    super();
    this.rand = randomGenerator.random();
  }

  @get(new Route('/'))
  getProducts(req: Request, reply: Reply) {
    reply.send({
      ts: this.rand
    });
  }
}

@PuzzleGateway({
  port: 8080,
  api: {
    handlers: [ProductApi],
    routePrefix: new Route('/api')
  },
  fragments: {
    handlers: []
  },
  healthCheck: new Route('/healthcheck')
})
class Browsing extends Gateway {
  rand: number;

  constructor(randomGenerator: UselessRandomGenerator) {
    super();
    this.rand = randomGenerator.random();
  }

  OnBeforeStart() {
    console.log('Starting Browsing gateway');
  }

  @get(new Route('/globalEndpoint'))
  globalEndpointHandler(req: Request, reply: Reply) {
    reply.send({
      ts: this.rand
    });
  }
}

@PuzzleGateway({
  port: 8079,
  api: {
    handlers: [],
  },
  fragments: {
    handlers: []
  }
})
class Search extends Gateway {
  OnBeforeStart() {
    console.log('Starting Search gateway');
  }
}


@PuzzleApplication({
  gateway: [Browsing, Search],
})
class GatewayApplication extends Application {
  superGlobal: number;

  constructor(randomGenerator: UselessRandomGenerator) {
    super();
    this.superGlobal = randomGenerator.random();
  }

  async OnBeforeStart() {
    console.log('Starting Application');
  }
}
