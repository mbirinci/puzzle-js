import sinon from "sinon";
import faker from "faker";
import {expect} from "chai";
import {Injector, Injectable} from "../lib/injector";
import {ERROR_CODES, PuzzleError} from "../lib/errors";

describe('Injector', () => {
  it('should export class Injector', () => {
    expect(Injector).to.be.a('function');
  });

  it('should export decorator injectable with constructor', () => {
    //Arrange
    const propValue = faker.random.number();

    class Test {
      prop: number;

      constructor() {
        this.prop = propValue;
      }
    }

    //Act
    const fn = Injectable(Test);
    const instance = new fn();

    //Assert
    expect(fn).to.be.a('function');
    expect(instance).to.be.instanceof(Test);
    expect(instance.prop).to.eq(propValue);
  });

  it('should export decorator injectable without constructor', () => {
    //Arrange
    class Test {
    }

    //Act
    const fn = Injectable(Test);
    const instance = new fn();

    //Assert
    expect(fn).to.be.a('function');
    expect(instance).to.be.instanceof(Test);
  });

  it('should return instance with .get', () => {
    //Arrange
    @Injectable
    class Test {
    }

    //Act
    const instance = Injector.get(Test);

    //Assert
    expect(instance).to.be.instanceof(Test);
  });

  it('should export decorator injectable with injectable parameter', () => {
    //Arrange
    @Injectable
    class Dependency {
    }

    @Injectable
    class Test {
      injectedDependency: Dependency;

      constructor(dependency: Dependency) {
        this.injectedDependency = dependency;
      }
    }

    //Act
    const instance = Injector.get(Test) as Test;

    //Assert
    expect(instance).to.be.instanceof(Test);
    expect(instance.injectedDependency).to.be.instanceof(Dependency);
  });

  it('should throw error for not registered class trying to get instance', () => {
    //Arrange
    class NonInjected {
    }

    //Act
    const test = () => {
      Injector.get(NonInjected);
    };

    //Assert
    expect(test).to.throw(PuzzleError, (new PuzzleError(ERROR_CODES.CLASS_NOT_REGISTERED_AS_INJECTABLE, NonInjected.name)).message);
  });

  it('should throw error for not registered class trying to inject from arguments', () => {
    //Arrange
    class NonInjected {
    }

    @Injectable
    class Test {
      nonInjected: NonInjected;

      constructor(nonInjected: NonInjected) {
        this.nonInjected = nonInjected;
      }
    }

    //Act
    const test = () => {
      Injector.get(Test);
    };

    //Assert
    expect(test).to.throw(PuzzleError, (new PuzzleError(ERROR_CODES.CLASS_NOT_REGISTERED_AS_INJECTABLE, NonInjected.name)).message);
  });

  it('should decorate class with config', () => {
    //Arrange
    const randomConfig = faker.helpers.userCard();

    class Super {
      static config?: object;
    }

    class Test extends Super {
      constructor() {
        super();
      }
    }

    //Act
    const configDecorator = Injector.decorate(() => {
    }, randomConfig);
    configDecorator(Test);

    //Assert
    expect(Test.config).to.eq(randomConfig);
  });

  it('should give previously generated instance', () => {
    //Arrange
    @Injectable
    class Test {
    }

    //Act
    const instance = Injector.get(Test);
    const anotherInstance = Injector.get(Test);

    //Assert
    expect(instance).to.eq(anotherInstance);
  });

  it('should inject previously generated instance', () => {
    //Arrange
    const instances: Test[] = [];

    @Injectable
    class Test {
    }

    //Act
    @Injectable
    class Test2 {
      constructor(test: Test) {
        instances.push(test);
      }
    }

    @Injectable
    class Test3 {
      constructor(test: Test) {
        instances.push(test);
      }
    }

    Injector.get(Test2);
    Injector.get(Test3);

    //Assert
    expect(instances[0]).to.eq(instances[1]);
    expect(instances[0]).to.be.instanceof(Test);
  });

  it('should set custom instance for class when it is not set yet', () => {
    //Arrange
    class Test {
    }

    const customInstance = new Test();

    //Act
    Injector.set(Test, customInstance);

    //Assert
    const instance = Injector.get(Test);
    expect(instance).to.eq(customInstance);
  });

  it('should set custom instance for class when it is already set', () => {
    //Arrange
    @Injectable
    class Test {
    }

    const prevInstance = Injector.get(Test);
    const customInstance = new Test();

    //Act
    Injector.set(Test, customInstance);

    //Assert
    const instance = Injector.get(Test);
    expect(instance).to.eq(customInstance);
    expect(instance).to.not.eq(prevInstance);
  });

  it('should transform class token to another token without breaking instance', () => {
    //Arrange
    @Injectable
    class Test1 {
    }

    @Injectable
    class Test2 {
    }

    //Act
    const instance = Injector.get(Test1);
    Injector.transform(Test1, Test2);
    const instance2 = Injector.get(Test2);

    //Assert
    expect(instance).to.eq(instance2);
  });

  it('should throw error when target token does not exist', () => {
    //Arrange
    class NonInjectable {
    }

    @Injectable
    class Test2 {
    }

    //Act
    const test = () => {
      Injector.transform(NonInjectable, Test2);
    };

    //Assert
    expect(test).to.throw(PuzzleError, (new PuzzleError(ERROR_CODES.CLASS_NOT_REGISTERED_AS_INJECTABLE, NonInjectable.name)).message);
  });
});
