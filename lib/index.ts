import {Gateway, PuzzleGateway} from "./gateway";
import {Bootstrap} from "./core";

@PuzzleGateway({
  port: 8080
})
class Browsing extends Gateway {
  constructor() {
    super();

    console.log('Starting Browsing Gateway');
  }
}

@PuzzleGateway({
  port: 8079
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
