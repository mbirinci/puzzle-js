import "reflect-metadata";
import {Error} from "tslint/lib/error";

// noinspection TsLint
type Ctor<T> = new (...args: any[]) => T;

type constructedInstance = {
  // noinspection TsLint
  constructor: Ctor<any>;

  // noinspection TsLint
  instance: any;

  config: any
};

interface ConfiguredDecorator extends Ctor<any> {
  config?: any;
}

export class Injector {
  private static instances: constructedInstance[] = [];

  private static inject<T>(constructor: Ctor<T>, config: object = {}): ConfiguredDecorator {
    const parameters = Reflect.getMetadata("design:paramtypes", constructor);
    if (!!parameters) {
      const newArgs = parameters.map((f: Ctor<T>) => Injector.getToken(f));
      const injectedConstructor = constructor.bind(null, newArgs);

      Injector.instances.push({constructor: injectedConstructor, instance: null, config});
      return injectedConstructor;
    } else {
      Injector.instances.push({constructor, instance: null, config});
      return constructor;
    }
  }

  static get<T>(constructor: Ctor<T>): object {
    const injectionToken = Injector.instances.find((f: constructedInstance) => f.constructor === constructor);

    if (!injectionToken) {
      throw new Error("Invalid injection");
    }

    let instance;
    if(!injectionToken.instance){
      instance = Object.assign(injectionToken.instance || new injectionToken.constructor(), {config: injectionToken.config});
    }

    injectionToken.instance = instance;
    return injectionToken.instance;
  }

  private static getToken<T>(constructor: Ctor<T>): object {
    const injectionToken = Injector.instances.find((f: constructedInstance) => f.constructor === constructor);

    if (!injectionToken) {
      throw new Error("Invalid injection");
    }

    let instance;
    if(!injectionToken.instance){
      instance = Object.assign(injectionToken.instance || new injectionToken.constructor(), {config: injectionToken.config});
    }

    injectionToken.instance = instance;
    return injectionToken;
  }

  static decorate(cb: Function, config?: any) {
    return <T>(constructor: Ctor<T>): any => {
      cb(constructor);
      const configuredConstructor = Injector.inject(constructor, config);
      configuredConstructor.config = config;
      return configuredConstructor;
    };
  }

  static Injectable<T>(constructor: Ctor<T>): Ctor<T> {
    return Injector.inject(constructor);
  }
}

export const Injectable = Injector.Injectable;