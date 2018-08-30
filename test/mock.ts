import {GatewayConfig} from "../lib/gateway";
import * as faker from "faker";
import {Route} from "../lib/server";
import {Api, ApiConfig} from "../lib/api";
import {Ctor} from "../lib/injector";

export const mockGatewayConfiguration = (config: {port?: number, healthCheck?: Route, api?: {
    routePrefix?: Route;
    handlers: Array<Ctor<Api>>;
  }}) : GatewayConfig => {
  return {
    port: config.port || faker.random.number(),
    api: config.api || {
      handlers: []
    },
    fragments: {
      handlers: []
    },
    healthCheck: config.healthCheck || undefined
  };
};

export const mockApiConfiguration = (config: {route?: Route}) : ApiConfig => {
  return {
    route: config.route || new Route(faker.random.word())
  };
};
