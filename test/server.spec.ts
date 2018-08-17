import {HTTP_METHODS, Route, Server} from "../lib/server";
import sinon from "sinon";
import {expect} from "chai";
import {IncomingMessage, ServerResponse} from "http";
import {FastifyReply, FastifyRequest} from "fastify";

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
    const handler = (req: FastifyRequest<IncomingMessage>, res: FastifyReply<ServerResponse>) => {};

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

  it('should add middleware route', () => {
    //Arrange
    const route = new Route('/');
    const server = new Server();
    const spy = sinon.spy(server.app, 'use');
    const handler = (req: IncomingMessage, res: ServerResponse, next: Function) => {};

    //Act
    server.addUse(route, handler);

    //Assert
    expect(spy.calledOnce).to.eq(true);
    expect(spy.calledWithExactly(route.toString(), handler)).to.eq(true);
  });
});
