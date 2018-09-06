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
class ProductItemController extends Api {
  rand: number;

  constructor(randomGenerator: UselessRandomGenerator) {
    super();
    this.rand = randomGenerator.random();
  }

  @get(new Route('/:id'), {
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        }
      }
    },
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
  })
  getItemsById(req: Request, reply: Reply) {
    reply.send({
      ts: this.rand
    });
  }


  @get(new Route('/'))
  getItems(req: Request, reply: Reply) {
    reply.send({
      ts: this.rand
    });
  }
}

@PuzzleApi({
  route: new Route('/user'),
  subApis: [ProductItemController]
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
  healthCheck: new Route('/healthcheck'),
  swagger: {
    route: new Route('/docs'),
    title: 'Gateway',
    description: 'Documentation'
  }
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
  gateway: [Browsing, Search]
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
