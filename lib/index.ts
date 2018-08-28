import {Gateway, PuzzleGateway} from "./gateway";
import {Application, PuzzleApplication} from "./application";
import {Api, PuzzleApi} from "./api";
import {Route} from "./server";

@PuzzleApi({
  name: 'product',
  endpoints: [],
  route: new Route('/')
})
class ProductApi extends Api {
  constructor() {
    super();

  }
}

@PuzzleGateway({
  port: 8080,
  api: {
    handlers: [ProductApi],
  },
  fragments: {
    handlers: []
  }
})
class Browsing extends Gateway {
  OnBeforeStart() {
    console.log('Starting Search gateway');
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
