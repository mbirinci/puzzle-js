import {Gateway, PuzzleGateway} from "../lib/gateway";
import {expect} from "chai";
import {mockApiConfiguration, mockGatewayConfiguration} from "./mock";
import * as faker from "faker";
import sinon from "sinon";
import {ERROR_CODES, PuzzleError} from "../lib/errors";
import {get, HTTP_METHODS, Reply, Route} from "../lib/server";
import {Api} from "../lib/api";

let sandbox: sinon.SinonSandbox;

describe('Gateway', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error when trying to create Gateway without decoration', () => {
    //Arrange
    const test = () => {
      const gateway = new Gateway();
    };

    //Act

    //Assert
    expect(test).to.throw(PuzzleError, (new PuzzleError(ERROR_CODES.CLASS_IS_NOT_DECORATED, Gateway.name)).message);
  });

  it('should decorate class with Gateway', () => {
    //Arrange
    const port = faker.random.number();

    //Act
    @PuzzleGateway(mockGatewayConfiguration({port}))
    class Test {
    }

    //Assert
    expect(Test).to.haveOwnProperty('config');
    expect((Test as any).config.port).to.eq(port);
  });

  it('should call server listen on start', async () => {
    //Arrange
    const port = faker.random.number();

    class TestGateway extends Gateway {
      static config = mockGatewayConfiguration({port});
    }

    const gateway = new TestGateway();
    const spy = sandbox.stub(gateway.server.app, 'listen');
    //Act
    await gateway.start();

    //Assert
    expect(spy.calledOnce).to.eq(true);
    expect(spy.calledWithExactly(port)).to.eq(true);
  });

  it('should call OnBeforeStart before starting to listen', async () => {
    //Arrange
    const port = faker.random.number();

    class TestGateway extends Gateway {
      static config = mockGatewayConfiguration({port});

      OnBeforeStart() {
      }

      OnListen() {
      }
    }

    const gateway = new TestGateway();
    const spy = sandbox.stub(gateway.server.app, 'listen');
    const spyOnBeforeStart = sandbox.stub(gateway, 'OnBeforeStart');
    const spyOnListen = sandbox.stub(gateway, 'OnListen');
    //Act
    await gateway.start();

    //Assert
    expect(spyOnBeforeStart.calledBefore(spy)).to.eq(true);
    expect(spy.calledOnce).to.eq(true);
    expect(spyOnListen.calledAfter(spy)).to.eq(true);
  });

  it('should try to add healthCheckRoute if route provided', async () => {
    //Arrange
    const port = faker.random.number();
    const endpoint = new Route(faker.random.word());

    class TestGateway extends Gateway {
      static config = mockGatewayConfiguration({
        port,
        healthCheck: endpoint
      });
    }

    const gateway = new TestGateway();
    const spy = sandbox.stub(gateway.server.app, 'listen');
    const healthCheckRouteSpy = sandbox.spy(gateway.server, 'addRoute');
    //Act
    await gateway.start();

    //Assert
    expect(healthCheckRouteSpy.calledBefore(spy)).to.eq(true);
    expect(healthCheckRouteSpy.calledWithExactly(endpoint, HTTP_METHODS.GET, sinon.match.any, sinon.match.any)).to.eq(true);
    expect(spy.calledOnce).to.eq(true);
  });

  /**
   * todo refactor healthcheck test
   */
  it('should not add healthCheck endpoint if route is not provided', async () => {
    //Arrange
    const port = faker.random.number();
    const endpoint = new Route(faker.random.word());

    class TestGateway extends Gateway {
      static config = mockGatewayConfiguration({
        port,
      });
    }

    const gateway = new TestGateway();
    sandbox.stub(gateway.server.app, 'listen');
    const healthCheckRouteSpy = sandbox.spy(gateway.server, 'addRoute');
    //Act
    await gateway.start();

    //Assert
    expect(healthCheckRouteSpy.calledWithExactly(endpoint, HTTP_METHODS.GET, sinon.match.any, sinon.match.any)).to.not.eq(true);
  });

  it('should reply healthcheck with health model', async () => {
    //Arrange
    const port = faker.random.number();
    const endpoint = new Route(faker.random.word());

    class TestGateway extends Gateway {
      static config = mockGatewayConfiguration({
        port,
        healthCheck: endpoint
      });
    }

    const gateway = new TestGateway();
    sandbox.stub(gateway.server.app, 'listen');
    const healthCheckRouteSpy = sandbox.stub(gateway.server, 'addRoute');

    //Act
    await gateway.start();
    const handler = healthCheckRouteSpy.args[0][2];
    const reply = {
      send: () => {
      }
    };
    const spy = sinon.spy(reply, 'send');
    handler(null, reply);

    //Assert
    expect(spy.calledWithMatch({
      ts: sinon.match.number
    })).to.eq(true);
  });

  it('should add decorated routes if there is any', () => {
    //Arrange
    const port = faker.random.number();
    const routes = new Route(faker.random.word());
    const method = faker.random.arrayElement(Object.values(HTTP_METHODS));
    const handler = () => {
      return routes;
    };

    class TestGateway extends Gateway {
      static config = mockGatewayConfiguration({
        port,
      });
    }

    const gateway = new TestGateway();
    sandbox.stub(gateway.server.app, 'listen');

    const decoratedRoute = {
      routes,
      method,
      handler,
      schema: {}
    };

    const spy = sandbox.stub(gateway.server, 'addRoute');

    //Act
    gateway.constructor.prototype.decoratorRoutes = [decoratedRoute];
    gateway.start();

    //Assert
    expect(spy.calledWithExactly(decoratedRoute.routes, decoratedRoute.method, sinon.match.func, decoratedRoute.schema)).to.eq(true);
    expect(spy.args[0][2]()).to.eq(routes);
  });

  it('should add api routes without prefix', () => {
    //Arrange
    const port = faker.random.number();
    const endpoint = faker.random.word();
    const apiRoute = faker.random.word();
    const schema = {};
    const res = {
      word: faker.random.word()
    };
    const reply = {
      send: () => {}
    };
    const replySpy = sinon.spy(reply, 'send');

    class TestApi extends Api {
      static config = mockApiConfiguration({
        route: new Route(`/${apiRoute}`)
      });

      @get(new Route(`/${endpoint}`), schema)
      handler(req: any, reply: Reply) {
        reply.send(res);
      }
    }

    class TestGateway extends Gateway {
      static config = mockGatewayConfiguration({
        port,
        api: {handlers: [TestApi]}
      });
    }


    //Act
    const gateway = new TestGateway();
    const spy = sandbox.stub(gateway.server, 'addRoute');
    sandbox.stub(gateway.server.app, 'listen');
    gateway.start();
    spy.args[0][2](null, reply);

    //Assert
    expect(spy.calledWithExactly(sinon.match(i => {
      return i.toString() === `/${apiRoute}/${endpoint}`;
    }), HTTP_METHODS.GET, sinon.match.func, schema)).to.eq(true);
    expect(replySpy.calledWithExactly(res));
  });

  it('should add api routes with prefix', () => {
    //Arrange
    const port = faker.random.number();
    const endpoint = faker.random.word();
    const apiRoute = faker.random.word();
    const prefix = faker.random.word();
    const schema = {};
    const res = {
      word: faker.random.word()
    };
    const reply = {
      send: () => {}
    };
    const replySpy = sinon.spy(reply, 'send');

    class TestApi extends Api {
      static config = mockApiConfiguration({
        route: new Route(`/${apiRoute}`)
      });

      @get(new Route(`/${endpoint}`), schema)
      handler(req: any, reply: Reply) {
        reply.send(res);
      }
    }

    class TestGateway extends Gateway {
      static config = mockGatewayConfiguration({
        port,
        api: {
          handlers: [TestApi],
          routePrefix: new Route(`/${prefix}`)
        }
      });
    }


    //Act
    const gateway = new TestGateway();
    const spy = sandbox.stub(gateway.server, 'addRoute');
    sandbox.stub(gateway.server.app, 'listen');
    gateway.start();
    spy.args[0][2](null, reply);

    //Assert
    expect(spy.calledWithExactly(sinon.match(i => {
      return i.toString() === `/${prefix}/${apiRoute}/${endpoint}`;
    }), HTTP_METHODS.GET, sinon.match.func, schema)).to.eq(true);
    expect(replySpy.calledWithExactly(res));
  });

  it('should add api routes with prefix with array of routes', () => {
    //Arrange
    const port = faker.random.number();
    const endpoint = faker.random.word();
    const apiRoute = faker.random.word();
    const prefix = faker.random.word();
    const schema = {};
    const res = {
      word: faker.random.word()
    };
    const reply = {
      send: () => {}
    };
    const replySpy = sinon.spy(reply, 'send');

    class TestApi extends Api {
      static config = mockApiConfiguration({
        route: new Route(`/${apiRoute}`)
      });

      @get([new Route(`/${endpoint}`)], schema)
      handler(req: any, reply: Reply) {
        reply.send(res);
      }
    }

    class TestGateway extends Gateway {
      static config = mockGatewayConfiguration({
        port,
        api: {
          handlers: [TestApi],
          routePrefix: new Route(`/${prefix}`)
        }
      });
    }


    //Act
    const gateway = new TestGateway();
    const spy = sandbox.stub(gateway.server, 'addRoute');
    sandbox.stub(gateway.server.app, 'listen');
    gateway.start();
    spy.args[0][2](null, reply);

    //Assert
    expect(spy.calledWithExactly(sinon.match(i => {
      return i.toString() === `/${prefix}/${apiRoute}/${endpoint}`;
    }), HTTP_METHODS.GET, sinon.match.func, schema)).to.eq(true);
    expect(replySpy.calledWithExactly(res));
  });

  /**
   * todo refactor no endpoint for api test
   */
  it('should not add api routes if not decorated routes', () => {
    //Arrange
    const port = faker.random.number();
    const endpoint = faker.random.word();
    const apiRoute = faker.random.word();
    const prefix = faker.random.word();
    const schema = {};
    const res = {
      word: faker.random.word()
    };
    const reply = {
      send: () => {}
    };
    const replySpy = sinon.spy(reply, 'send');

    class TestApi extends Api {
      static config = mockApiConfiguration({
        route: new Route(`/${apiRoute}`)
      });
    }

    class TestGateway extends Gateway {
      static config = mockGatewayConfiguration({
        port,
        api: {
          handlers: [TestApi],
          routePrefix: new Route(`/${prefix}`)
        }
      });
    }


    //Act
    const gateway = new TestGateway();
    const spy = sandbox.stub(gateway.server, 'addRoute');
    sandbox.stub(gateway.server.app, 'listen');
    gateway.start();


    //Assert
    expect(spy.calledWithExactly(sinon.match(i => {
      return i.toString() === `/${prefix}/${apiRoute}/${endpoint}`;
    }), HTTP_METHODS.GET, sinon.match.func, schema)).to.not.eq(true);
  });
});
