import "reflect-metadata";
import {ERROR_CODES, PuzzleError} from "./errors";
// noinspection TsLint
type Ctor<T> = new (...args: any[]) => T;

type constructedInstance = {
  // noinspection TsLint
  constructor: Ctor<any>;

  // noinspection TsLint
  instance: any;

  config: object;
};

// noinspection TsLint
interface ConfiguredDecorator extends Ctor<any> {
  config?: object;
}

export class Injector {
  private static instances: constructedInstance[] = [];

  static decorate(cb: Function, config?: object) {
    // noinspection TsLint
    return (constructor: any): any => {
      cb(constructor);
      const configuredConstructor = Injector.inject(constructor, config);
      configuredConstructor.config = config;
      return configuredConstructor;
    };
  }

  static Injectable<T>(constructor: Ctor<T>): Ctor<T> {
    return Injector.inject(constructor);
  }

  static get<T>(constructor: Ctor<T>): object {
    const injectionToken = Injector.instances.find((f: constructedInstance) => f.constructor === constructor);

    if (!injectionToken) {
      throw new PuzzleError(ERROR_CODES.CLASS_NOT_REGISTERED_AS_INJECTABLE, constructor.name);
    }

    let instance;
    if(!injectionToken.instance){
      instance = Object.assign(injectionToken.instance || new injectionToken.constructor(...Injector.getInjectionParameters(injectionToken.constructor)), {config: injectionToken.config});
    }

    injectionToken.instance = instance;
    return injectionToken.instance;
  }

  private static inject<T>(constructor: Ctor<T>, config: object = {}): ConfiguredDecorator {
    Injector.instances.push({constructor, instance: null, config});
    return constructor;
  }

  private static getToken<T>(constructor: Ctor<T>): constructedInstance {
    const injectionToken = Injector.instances.find((f: constructedInstance) => f.constructor === constructor);

    if (!injectionToken) {
      throw new PuzzleError(ERROR_CODES.CLASS_NOT_REGISTERED_AS_INJECTABLE, constructor.name);
    }

    let instance;
    if(!injectionToken.instance){
      instance = Object.assign(injectionToken.instance || new injectionToken.constructor(...Injector.getInjectionParameters(injectionToken.constructor)), {config: injectionToken.config});
    }

    injectionToken.instance = instance;
    return injectionToken;
  }

  private static getInjectionParameters<T>(constructor: Ctor<T>){
    const parameters = Reflect.getMetadata("design:paramtypes", constructor);
    if(!!parameters){
      return parameters.map((f: Ctor<T>) => Injector.getToken(f).instance);
    }else{
      return [];
    }
  }
}

export const Injectable = Injector.Injectable;
