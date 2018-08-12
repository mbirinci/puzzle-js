import "reflect-metadata";
import {Injector} from "./injector";
import {Request, Response} from "express";

export interface ApiRequest extends Request {

}

export interface ApiResponse extends Response {

}

export function Api(apiConfig: any) {
  return Injector.decorate(() => {
    console.log('Registering api');
  });
}

export function Endpoint(config?: object) {
  return Injector.decorate(() => {
    console.log('Registering route');
  }, config);
}

export function Gateway<T>(config?: T) {
  return Injector.decorate((constructor: () => void) => {
    console.log('Registering Gateway');
  }, config);
}

export interface GatewayConfig {
  port: number;
}

export class PuzzleGateway {
  static config?: GatewayConfig;
}

export function Bootstrap(config?: object) {
  return Injector.decorate((constructor: () => void) => {
    console.log('Registering Gateway');
  }, config);
}

export function get(link: string) {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const newDescriptor = {
      value: (req: ApiRequest, res: ApiResponse) => {
        descriptor.value(req, res);
      }
    };

    return newDescriptor;
  };
}
