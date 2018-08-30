import {GatewayConfig} from "../lib/gateway";
import * as faker from "faker";
import {Route} from "../lib/server";
import {ApiConfig} from "../lib/api";

export const mockGatewayConfiguration = (config: {port?: number, healthCheck?: Route}) : GatewayConfig => {
  return {
    port: config.port || faker.random.number(),
    api: {
      handlers: []
    },
    fragments: {
      handlers: []
    },
    healthCheck: config.healthCheck || undefined
  };
};

export const mockApiConfiguration = (config: {name?: string, route?: Route}) : ApiConfig => {
  return {
    endpoints: [],
    name: config.name || faker.random.word(),
    route: config.route || new Route(faker.random.word())
  };
};
