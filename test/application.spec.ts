import {Application, BootstrapConfig, PuzzleApplication} from "../lib/application";
import {expect} from "chai";
import sinon from "sinon";
import {Injector} from "../lib/injector";
import {Gateway, PuzzleGateway} from "../lib/gateway";
import {mockGatewayConfiguration} from "./mock";

let sandbox: sinon.SinonSandbox;

describe('ApplicationCore', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('should init application and instance using decorator', () => {
    //Arrange
    class Test {
      init() {

      }

      start() {

      }
    }

    const config = {};
    const spyInit = sandbox.stub(Test.prototype, "init");
    const spyStart = sandbox.stub(Test.prototype, "start");

    //Act
    PuzzleApplication(config)(Test);

    //Assert
    expect(spyInit.calledWithExactly(config)).to.eq(true);
    expect(spyStart.calledOnce).to.eq(true);
    expect(Injector.get(Test)).to.be.instanceof(Test);
  });

  it('should set config when init called', () => {
    //Arrange
    const config = {};
    const application = new Application();

    //Act
    application.init(config);

    //Assert
    expect(application.config).to.eq(config);
  });

  it('should start gateways calling onBeforeStart event with single gateway', async () => {
    //Arrange
    class GatewayTest extends Gateway {
      OnBeforeStart() {
      }
    }

    PuzzleGateway(mockGatewayConfiguration({port: 8080}))(GatewayTest);

    const config = {
      gateway: GatewayTest
    } as BootstrapConfig;
    const stub = sandbox.stub(Gateway.prototype, "start");
    const application = new Application();

    //Act
    application.init(config);
    await application.start();


    //Assert
    expect(stub.calledOnce).to.eq(true);
  });

  it('should try to start without any gateway or storefronts registered', async () => {
    //Arrange
    const config = {} as BootstrapConfig;
    const application = new Application();

    //Act
    application.init(config);
    await application.start();
  });

  it('should start gateways calling onBeforeStart event with multiple gateways', async () => {
    //Arrange
    class GatewayTest extends Gateway {
      OnBeforeStart() {
      }
    }

    PuzzleGateway(mockGatewayConfiguration({port: 8080}))(GatewayTest);

    class GatewayTest2 extends Gateway {
      OnBeforeStart() {
      }
    }

    PuzzleGateway(mockGatewayConfiguration({port: 8080}))(GatewayTest2);

    const config = {
      gateway: [GatewayTest, GatewayTest2]
    } as BootstrapConfig;
    const stub = sandbox.spy(Gateway.prototype, "start");
    const application = new Application();

    //Act
    application.init(config);
    await application.start();


    //Assert
    expect(stub.calledTwice).to.eq(true);
  });
});
