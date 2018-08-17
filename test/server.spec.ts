import {HTTP_METHODS, Request, Response, Route, Server} from "../lib/server";
import sinon from "sinon";
import {expect} from "chai";

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
    const spy = sinon.spy(server.app, 'get');
    const handler = (req: Request, res: Response) => {};

    //Act
    server.addRoute(route, HTTP_METHODS.GET, handler);

    //Assert
    expect(spy.calledOnce).to.eq(true);
    expect(spy.calledWithExactly(route.toString(), handler)).to.eq(true);
  });

  it('should add middleware route', () => {
    //Arrange
    const route = new Route('/');
    const server = new Server();
    const spy = sinon.spy(server.app, 'use');
    const handler = (req: Request, res: Response, next: Function) => {};

    //Act
    server.addUse(route, handler);

    //Assert
    expect(spy.calledOnce).to.eq(true);
    expect(spy.calledWithExactly(route.toString(), handler)).to.eq(true);
  });
});
