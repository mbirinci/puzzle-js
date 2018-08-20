import {Injector} from "./injector";
import {ERROR_CODES, PuzzleError} from "./errors";
import {Route} from "./server";


export interface PuzzleApi {

}

export interface ApiConfig {
  name: string;
  endpoints: any[];
  route: Route;
}

export function PuzzleApi<T>(config: ApiConfig) {
  return Injector.decorate((constructor: () => void) => {
    console.log(`Registering Api: ${constructor.name}`);

  }, config);
}

export class Api implements PuzzleApi {
  config: ApiConfig;

  constructor() {
    const config = (this.constructor as any).config as ApiConfig;

    if (!config) {
      throw new PuzzleError(ERROR_CODES.CLASS_IS_NOT_DECORATED, this.constructor.name);
    } else {
      this.config = config;
    }
  }
}
