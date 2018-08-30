import {del, get, head, HTTP_METHODS, post, put, Route, Server} from "../lib/server";
import sinon from "sinon";
import {expect} from "chai";
import {IncomingMessage, ServerResponse} from "http";
import {FastifyReply, FastifyRequest} from "fastify";
import * as faker from "faker";
import {Gateway} from "../lib/gateway";

describe('Route', () => {
  it('should append / to route path if not exists', () => {
    //Arrange
    const word = faker.random.word();
    const route = new Route(word);
    //Act
    const path = route.toString();

    //Assert
    expect(path).to.eq(`/${word}`);
  });

  it('should append new route with new instance', () => {
    //Arrange
    const endpoint = faker.random.word();
    const endpoint2 = faker.random.word();
    const route2 = new Route(`/${endpoint2}`);
    const route1 = new Route(`/${endpoint}`);
    //Act
    const resultingRoute = route1.append(route2);

    //Assert
    expect(resultingRoute.toString()).to.eq(`/${endpoint}/${endpoint2}`);
    expect(resultingRoute).to.not.eq(route1);
    expect(resultingRoute).to.not.eq(route2);
  });

  it('should return new route with same with if provided route is undefined for append', () => {
    //Arrange
    const endpoint = faker.random.word();
    const route = new Route(`/${endpoint}`);
    //Act
    const resultingRoute = route.append(undefined);

    //Assert
    expect(resultingRoute.toString()).to.eq(`/${endpoint}`);
    expect(resultingRoute).to.not.eq(route);
  });

  it('should prepend new route with new instance', () => {
    //Arrange
    const endpoint = faker.random.word();
    const endpoint2 = faker.random.word();
    const route2 = new Route(`/${endpoint2}`);
    const route1 = new Route(`/${endpoint}`);
    //Act
    const resultingRoute = route1.prepend(route2);

    //Assert
    expect(resultingRoute.toString()).to.eq(`/${endpoint2}/${endpoint}`);
    expect(resultingRoute).to.not.eq(route1);
    expect(resultingRoute).to.not.eq(route2);
  });

  it('should return new route with same with if provided route is undefined for prepend', () => {
    //Arrange
    const endpoint = faker.random.word();
    const route = new Route(`/${endpoint}`);
    //Act
    const resultingRoute = route.prepend(undefined);

    //Assert
    expect(resultingRoute.toString()).to.eq(`/${endpoint}`);
    expect(resultingRoute).to.not.eq(route);
  });
});

describe('Server', () => {
  it('should create server instance', () => {
    //Arrange
    const server = new Server();

    //Assert
    expect(server).to.be.instanceof(Server);
  });

  it('should add route', () => {
    //Arrange
    const route = new Route('/');
    const server = new Server();
    const method = HTTP_METHODS.GET;
    const spy = sinon.spy(server.app, 'route');
    const handler = (req: FastifyRequest<IncomingMessage>, res: FastifyReply<ServerResponse>) => {
    };

    //Act
    server.addRoute(route, method, handler);

    //Assert
    expect(spy.calledOnce).to.eq(true);
    expect(spy.calledWithExactly({
      method,
      url: route.toString(),
      handler
    })).to.eq(true);
  });

  it('should add routes as array', () => {
    //Arrange
    const route = new Route('/');
    const route2 = new Route('/route2');
    const server = new Server();
    const method = HTTP_METHODS.GET;
    const spy = sinon.spy(server.app, 'route');
    const handler = (req: FastifyRequest<IncomingMessage>, res: FastifyReply<ServerResponse>) => {
    };

    //Act
    server.addRoute([route, route2], method, handler);

    //Assert
    expect(spy.calledTwice).to.eq(true);
    expect(spy.calledWithExactly({
      method,
      url: route.toString(),
      handler
    })).to.eq(true);
    expect(spy.calledWithExactly({
      method,
      url: route2.toString(),
      handler
    })).to.eq(true);
  });

  it('should add middleware route', () => {
    //Arrange
    const route = new Route('/');
    const server = new Server();
    const spy = sinon.spy(server.app, 'use');
    const handler = (req: IncomingMessage, res: ServerResponse, next: Function) => {
    };

    //Act
    server.addUse(route, handler);

    //Assert
    expect(spy.calledOnce).to.eq(true);
    expect(spy.calledWithExactly(route.toString(), handler)).to.eq(true);
  });

  it('should append schema into route definitions', () => {
    //Arrange
    const route = new Route('/');
    const server = new Server();
    const method = HTTP_METHODS.GET;
    const spy = sinon.spy(server.app, 'route');
    const handler = (req: FastifyRequest<IncomingMessage>, res: FastifyReply<ServerResponse>) => {
    };
    const schema = {
      response: {
        200: {
          type: 'object',
          properties: {
            hello: {type: 'string'}
          }
        }
      }
    };

    //Act
    server.addRoute(route, method, handler, schema);

    //Assert
    expect(spy.calledOnce).to.eq(true);
    expect(spy.calledWithExactly({
      method,
      url: route.toString(),
      handler,
      schema
    })).to.eq(true);
  });

  it('should add middleware route as array', () => {
    //Arrange
    const route = new Route('/');
    const route2 = new Route('/route2');
    const server = new Server();
    const spy = sinon.spy(server.app, 'use');
    const handler = (req: IncomingMessage, res: ServerResponse, next: Function) => {
    };

    //Act
    server.addUse([route, route2], handler);

    //Assert
    expect(spy.calledTwice).to.eq(true);
    expect(spy.calledWithExactly(route.toString(), handler)).to.eq(true);
    expect(spy.calledWithExactly(route2.toString(), handler)).to.eq(true);
  });

  it('should generate get decorator', () => {
    //Arrange
    const handler = () => {};
    const targetInstance = {} as Gateway;
    const routes = new Route('/');
    const descriptor = {
      value: handler
    };

    //Act
    const newDescriptor = get(routes)(targetInstance, 'method', descriptor);

    //Assert
    expect(targetInstance.constructor.prototype.decoratorRoutes).to.deep.include({
      routes,
      method: HTTP_METHODS.GET,
      handler,
      schema: undefined
    });
  });

  it('should generate post decorator', () => {
    //Arrange
    const handler = () => {};
    const targetInstance = {} as Gateway;
    const routes = new Route('/');
    const descriptor = {
      value: handler
    };

    //Act
    const newDescriptor = post(routes)(targetInstance, 'method', descriptor);

    //Assert
    expect(targetInstance.constructor.prototype.decoratorRoutes).to.deep.include({
      routes,
      method: HTTP_METHODS.POST,
      handler,
      schema: undefined
    });
  });

  it('should generate put decorator', () => {
    //Arrange
    const handler = () => {};
    const targetInstance = {} as Gateway;
    const routes = new Route('/');
    const descriptor = {
      value: handler
    };

    //Act
    const newDescriptor = put(routes)(targetInstance, 'method', descriptor);

    //Assert
    expect(targetInstance.constructor.prototype.decoratorRoutes).to.deep.include({
      routes,
      method: HTTP_METHODS.PUT,
      handler,
      schema: undefined
    });
  });

  it('should generate delete decorator', () => {
    //Arrange
    const handler = () => {};
    const targetInstance = {} as Gateway;
    const routes = new Route('/');
    const descriptor = {
      value: handler
    };

    //Act
    const newDescriptor = del(routes)(targetInstance, 'method', descriptor);

    //Assert
    expect(targetInstance.constructor.prototype.decoratorRoutes).to.deep.include({
      routes,
      method: HTTP_METHODS.DELETE,
      handler,
      schema: undefined
    });
  });

  it('should generate head decorator', () => {
    //Arrange
    const handler = () => {};
    const targetInstance = {} as Gateway;
    const routes = new Route('/');
    const descriptor = {
      value: handler
    };

    //Act
    head(routes)(targetInstance, 'method', descriptor);

    //Assert
    expect(targetInstance.constructor.prototype.decoratorRoutes).to.deep.include({
      routes,
      method: HTTP_METHODS.HEAD,
      handler,
      schema: undefined
    });
  });
});
