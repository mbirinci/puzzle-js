import "reflect-metadata";
import {ERROR_CODES, PuzzleError} from "./errors";
// noinspection TsLint
export type Ctor<T> = new (...args: any[]) => T;

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

  /**
   * Returns constructor wrapper for config injection
   * @param {Function} cb
   * @param {object} config
   * @returns {(constructor: any) => any}
   */
  static decorate(cb: Function, config?: object) {
    // noinspection TsLint
    return (constructor: any): any => {
      cb(constructor);
      const configuredConstructor = Injector.inject(constructor, config);
      configuredConstructor.config = config;
      return configuredConstructor;
    };
  }

  /**
   * Marks class as injectable
   * @param {Ctor<T>} constructor
   * @returns {Ctor<T>}
   * @constructor
   */
  static Injectable<T>(constructor: Ctor<T>): Ctor<T> {
    return Injector.inject(constructor);
  }

  /**
   * Gets instance from injectable class
   * @param {Ctor<T>} constructor
   * @returns {object}
   */
  static get<T>(constructor: Ctor<T>): object {
    const injectionToken = Injector.instances.find((f: constructedInstance) => f.constructor === constructor);

    if (!injectionToken) {
      throw new PuzzleError(ERROR_CODES.CLASS_NOT_REGISTERED_AS_INJECTABLE, constructor.name);
    }

    if(!injectionToken.instance){
      injectionToken.instance = Object.assign(injectionToken.instance || new injectionToken.constructor(...Injector.getInjectionParameters(injectionToken.constructor)), {config: injectionToken.config});
    }

    return injectionToken.instance;
  }

  /**
   * Registers class token into instances
   * @param {Ctor<T>} constructor
   * @param {object} config
   * @returns {ConfiguredDecorator}
   */
  private static inject<T>(constructor: Ctor<T>, config: object = {}): ConfiguredDecorator {
    Injector.instances.push({constructor, instance: null, config});
    return constructor;
  }

  /**
   * Returns class token
   * @param {Ctor<T>} constructor
   * @returns {constructedInstance}
   */
  private static getToken<T>(constructor: Ctor<T>): constructedInstance {
    const injectionToken = Injector.instances.find((f: constructedInstance) => f.constructor === constructor);

    if (!injectionToken) {
      throw new PuzzleError(ERROR_CODES.CLASS_NOT_REGISTERED_AS_INJECTABLE, constructor.name);
    }

    if(!injectionToken.instance){
      injectionToken.instance = Object.assign(injectionToken.instance || new injectionToken.constructor(...Injector.getInjectionParameters(injectionToken.constructor)), {config: injectionToken.config});
    }

    return injectionToken;
  }

  /**
   * Gets constructor parameters with Reflect
   * @param {Ctor<T>} constructor
   * @returns {any}
   */
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
