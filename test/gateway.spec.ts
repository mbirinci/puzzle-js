import {Gateway, PuzzleGateway} from "../lib/gateway";
import {expect} from "chai";
import {mockGatewayConfiguration} from "./mock";
import * as faker from "faker";
import sinon from "sinon";
import {ERROR_CODES, PuzzleError} from "../lib/errors";

describe('Gateway', () => {
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
    class Test {}

    //Assert
    expect(Test).to.haveOwnProperty('config');
    expect((Test as any).config.port).to.eq(port);
  });

  it('should call server listen', () => {
    //Arrange
    const port = faker.random.number();
    class TestGateway extends Gateway{
      static config = mockGatewayConfiguration({port});
    }
    const gateway = new TestGateway();
    const spy = sinon.stub(gateway.server.app, 'listen');
    //Act
    gateway.listen();

    //Assert
    expect(spy.calledOnce).to.eq(true);
    expect(spy.calledWithExactly(port)).to.eq(true);
  });
});
