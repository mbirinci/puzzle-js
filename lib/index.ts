import {Gateway, PuzzleGateway} from "./gateway";
import {Bootstrap} from "./core";
import {Api, PuzzleApi} from "./api";
import {Route} from "./server";

@PuzzleApi({
  name: 'product',
  endpoints: [],
  route: new Route('/')
})
class ProductApi extends Api {
  constructor(){
    super();


  }
}

@PuzzleGateway({
  port: 8080,
  api: {
    handlers: [PuzzleApi],
  },
  fragments: {
    handlers: []
  }
})
class Browsing extends Gateway {
  constructor() {
    super();

    console.log('Starting Browsing Gateway');
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
  constructor() {
    super();

    console.log('Starting Search Gateway');
  }
}


@Bootstrap({
  gateway: [Browsing, Search],
})
class Application {
}
