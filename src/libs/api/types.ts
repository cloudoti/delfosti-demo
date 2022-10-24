import Api from './api';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'TypesApi' });

class Route {
  public method?: string;
  public path?: string;
  public handler?: (...args: unknown[]) => Promise<unknown>;

  constructor(
    method: string,
    path: string,
    handler: (...args: unknown[]) => Promise<unknown>
  ) {
    this.method = method;
    this.path = path;
    this.handler = handler;
  }
}

const SubMethods = Symbol('SubMethods'); // just to be sure there won't be collisions

function Get(requestName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    logger.debug('Get load');

    logger.debug('Get Load target:', target);
    logger.debug(`Get Load requestName: ${requestName}`);
    logger.debug(`Get Load propertyKey: ${propertyKey}`);
    logger.debug(`Get Load descriptor:`, descriptor as any);
    target[SubMethods] = target[SubMethods] || new Map();
    // Here we just add some information that class decorator will use
    target[SubMethods].set(propertyKey, { requestName, httpMethod: 'GET' });
  };
}

function Post(requestName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    logger.debug('Post load');

    logger.debug('Post Load target:', target);
    logger.debug(`Post Load requestName: ${requestName}`);
    logger.debug(`Post Load propertyKey: ${propertyKey}`);
    logger.debug(`Post Load descriptor:`, descriptor as any);
    target[SubMethods] = target[SubMethods] || new Map();
    // Here we just add some information that class decorator will use
    target[SubMethods].set(propertyKey, { requestName, httpMethod: 'POST' });
  };
}

// eslint-disable-next-line @typescript-eslint/ban-types
function Controller<T extends { new (...args: unknown[]): {} }>(Base: T) {
  logger.debug('Controller Load');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return class extends Base {
    constructor(...args: unknown[]) {
      super(...args);
      logger.debug('Constructor Controller Load');
      const subMethods = Base.prototype[SubMethods];
      if (subMethods) {
        subMethods.forEach((obj: any, method: string) => {
          logger.debug(JSON.stringify(obj.httpMethod));
          logger.debug(
            `submethod httpMethod: ${obj.httpMethod} requestName: ${obj.requestName}, method: ${method}`
          );
          Api.getInstance().routes.push(
            new Route(obj.httpMethod, obj.requestName, (this as any)[method])
          );
        });
      }
    }
  };
}

export { Route, Controller, Get, Post };
