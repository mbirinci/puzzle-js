import "reflect-metadata";
import {ERROR_CODES, PuzzleError} from "./errors";
// noinspection TsLint
export type Ctor<T> = new (...args: any[]) => T;

type constructedInstance = {
  // noinspection TsLint
  constructor: Ctor<any>;

  // noinspection TsLint
  instance: any;

  config?: any;
};

// noinspection TsLint
export interface ConfiguredDecorator extends Ctor<any> {
  config?: any;
}

export class Injector {
  private static instances: constructedInstance[] = [];

  /**
   * Returns constructor wrapper for config injection
   * @param {Function} cb
   * @param {object} config
   * @returns {(constructor: any) => any}
   */
  static decorate<T>(cb: Function, config?: any) {
    // noinspection TsLint
    return <T>(constructor: Ctor<T>): any => {
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
  static get<T>(constructor: Ctor<T>): T {
    const injectionToken = Injector.instances.find((f: constructedInstance) => f.constructor === constructor);

    if (!injectionToken) {
      throw new PuzzleError(ERROR_CODES.CLASS_NOT_REGISTERED_AS_INJECTABLE, constructor.name);
    }

    if (!injectionToken.instance) {
      injectionToken.instance = Object.assign(injectionToken.instance || new injectionToken.constructor(...Injector.getInjectionParameters(injectionToken.constructor)), {config: injectionToken.config});
    }

    return injectionToken.instance;
  }

  /**
   * Sets instance for Class
   * @param {Ctor<T>} constructor
   * @param {T} instance
   */
  static set<T>(constructor: Ctor<T>, instance: T): void {
    const token = this.instances.find(i => i.constructor === constructor);

    if (token) {
      token.instance = instance;
    } else {
      Injector.instances.push({
        instance,
        constructor
      });
    }
  }

  /**
   * Change token to new class
   * @param {Ctor<T>} target
   * @param {Ctor<R>} to
   */
  static transform<T, R>(target: Ctor<T>, to: Ctor<R>) {
    const transform = this.instances.find(i => i.constructor === target);

    if (transform) {
      transform.constructor = to;
    } else {
      throw new PuzzleError(ERROR_CODES.CLASS_NOT_REGISTERED_AS_INJECTABLE, target.name);
    }
  }

  /**
   * Registers class token into instances
   * @param {Ctor<T>} constructor
   * @param {object} config
   * @returns {ConfiguredDecorator}
   */
  private static inject<T>(constructor: Ctor<T>, config?: T): ConfiguredDecorator {
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

    if (!injectionToken.instance) {
      injectionToken.instance = Object.assign(injectionToken.instance || new injectionToken.constructor(...Injector.getInjectionParameters(injectionToken.constructor)), {config: injectionToken.config});
    }

    return injectionToken;
  }

  /**
   * Gets constructor parameters with Reflect
   * @param {Ctor<T>} constructor
   * @returns {any}
   */
  private static getInjectionParameters<T>(constructor: Ctor<T>) {
    const parameters = Reflect.getMetadata("design:paramtypes", constructor);
    if (!!parameters) {
      return parameters.map((f: Ctor<T>) => Injector.getToken(f).instance);
    } else {
      return [];
    }
  }
}


export const Injectable = Injector.Injectable;
