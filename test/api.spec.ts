import {expect} from "chai";
import {Api, Gateway, Endpoint, get, ApiRequest, ApiResponse, PuzzleGateway} from "../lib/core";
import {Injectable, Injector} from "../lib/injector";

@Injectable
class ProductService {
  constructor(){
    console.log("product");
  }
}

@Endpoint({
  routes: []
})
class GetVersions {
  constructor(private productService: ProductService) {
    console.log('test service');
  }

  @get("/")
  getVersions(req: ApiRequest, res: ApiResponse) {

  }
}

@Api({
  endpoints: [
    GetVersions
  ],
  test: "5"
})
class TestApi {}


@Gateway({
  apiConfiguration: {
    prefix: {},
    api: [
      TestApi
    ]
  },
  fragments: [],
  port: 22
})
class BrowsingGateway extends PuzzleGateway{
  constructor(){
    super();

    console.log(BrowsingGateway.config);
  }
}

export interface Test {
port: number;
}

Injector.get(BrowsingGateway)


describe('Test', () => {
  it('should export api decorator', () => {
    //expect(Core).to.be.a('function');
  });

  it('should return Api type', () => {
    // const testApi = new TestApi();
    // console.log(testApi);
  });
});