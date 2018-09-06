import {Application, BootstrapConfig, PuzzleApplication} from "../lib/application";
import {expect} from "chai";
import sinon from "sinon";
import {Injector} from "../lib/injector";
import {Gateway, PuzzleGateway} from "../lib/gateway";
import {mockGatewayConfiguration} from "./mock";
import faker from "faker";

const cluster = require('cluster');
const os = require('os');

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
    const stub = sandbox.stub(Gateway.prototype, "start");
    const application = new Application();

    //Act
    application.init(config);
    await application.start();


    //Assert
    expect(stub.calledTwice).to.eq(true);
  });

  it('should create cluster for application if clusterMode true and process is master', () => {
    //Arrange
    const application = new Application();
    application.init({
      clusterMode: true
    });
    const cpus = new Array(50).fill(null).map(cpu => faker.random.word());
    sandbox.stub(os, 'cpus').returns(cpus);
    sandbox.stub(cluster, 'isMaster').value(true);
    const spy = sandbox.stub(cluster, 'fork');
    sandbox.stub(cluster, 'on');

    //Act
    application.start();

    //Assert
    expect(spy.callCount).to.eq(cpus.length);
  });

  it('should not create cluster for application if clusterMode true but process is slave', () => {
    //Arrange
    const application = new Application();
    application.init({
      clusterMode: true
    });
    const cpus = new Array(50).fill(null).map(cpu => faker.random.word());
    sandbox.stub(os, 'cpus').returns(cpus);
    sandbox.stub(cluster, 'isMaster').value(false);
    const spy = sandbox.stub(cluster, 'fork');
    sandbox.stub(cluster, 'on');

    //Act
    application.start();

    //Assert
    expect(spy.notCalled).to.eq(true);
  });

  it('should not create cluster for application if cluster mode not activated', () => {
    //Arrange
    const application = new Application();
    application.init({});
    const cpus = new Array(50).fill(null).map(cpu => faker.random.word());
    sandbox.stub(os, 'cpus').returns(cpus);
    sandbox.stub(cluster, 'isMaster').value(true);
    const spy = sandbox.stub(cluster, 'fork');
    sandbox.stub(cluster, 'on');

    //Act
    application.start();


    //Assert
    expect(spy.notCalled).to.eq(true);
  });

  it('should fork cluster again on error', async () => {
    //Arrange
    const application = new Application();
    const cpuCount = faker.random.number({min: 2, max: 5});
    application.init({
      clusterMode: true
    });
    const cpus = new Array(cpuCount).fill(null).map(cpu => faker.random.word());
    sandbox.stub(os, 'cpus').returns(cpus);
    sandbox.stub(cluster, 'isMaster').value(true);
    const spy = sandbox.stub(cluster, 'fork');

    //Act
    application.start();
    cluster.emit("exit", {
      process:{
        pid: faker.random.number()
      }
    });

    //Assert
    expect(spy.callCount).to.eq(cpuCount + 1);
  });
});
