import { Logger } from '@aws-lambda-powertools/logger';
import { Route } from './types';

const logger = new Logger({ serviceName: 'Api' });

class Api {
  private static instance: Api;

  private _routes: Route[] = [];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): Api {
    if (!this.instance) {
      this.instance = new Api();
    }

    return this.instance;
  }

  get routes(): Route[] {
    return this._routes;
  }

  public get(path: string, handle: (...args: unknown[]) => Promise<unknown>) {
    logger.debug(`se agrega el path ${path}`);
    this._routes.push(new Route('GET', path, handle));
  }

  public async run(event: any): Promise<unknown> {
    logger.debug(event);
    const router = this._routes.filter(
      (r) =>
        event.rawPath === r.path &&
        event.requestContext?.http?.method === r.method
    );

    logger.debug(
      `se buscó el path: ${event.rawPath} y el metodo: ${event.requestContext?.http?.method} ${router.length} routers`
    );

    if (router.length > 0) {
      const params = [];
      if (event.body) {
        logger.debug(`Body: ${event.body}`);

        params.push(JSON.parse(event.body));
      }

      if (event.headers) {
        params.push(event.headers);
      }

      const response = await router[0].handler!(...params);

      return response;
    }
  }
}

export default Api;
