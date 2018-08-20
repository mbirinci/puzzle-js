import {GatewayConfig} from "../lib/gateway";
import * as faker from "faker";

export const mockGatewayConfiguration = (config: {port?: number}) : GatewayConfig => {
  return {
    port: config.port || faker.random.number(),
    api: {
      handlers: []
    },
    fragments: {
      handlers: []
    }
  };
};
