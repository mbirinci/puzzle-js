import {Gateway, PuzzleGateway} from "../lib/gateway";
import {expect} from "chai";
import {mockGatewayConfiguration} from "./mock";
import * as faker from "faker";
import sinon from "sinon";
import {ERROR_CODES, PuzzleError} from "../lib/errors";

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
    class Test {}

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

      OnBeforeStart(){}

      OnListen(){}
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
});
