import {Gateway, PuzzleGateway} from "./gateway";
import {Application, PuzzleApplication} from "./application";
import {Api, PuzzleApi} from "./api";
import {get, Reply, Request, Route} from "./server";

@PuzzleApi({
  route: new Route('/product')
})
class ProductApi extends Api {
  rand: number;

  constructor() {
    super();
    this.rand = Math.random();
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

  constructor() {
    super();
    this.rand = Math.random();
  }

  OnBeforeStart() {
    console.log('Starting Search gateway');
  }

  @get(new Route('/globalEndpoint'))
  ge(req: Request, reply: Reply) {
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

  constructor() {
    super();

    this.superGlobal = Math.random();
  }

  OnBeforeStart() {
    console.log('Starting Application');
  }
}
