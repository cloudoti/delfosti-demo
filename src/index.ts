import { APIGatewayProxyCallback, Context } from 'aws-lambda';
import * as dotenv from 'dotenv';
import { Logger } from '@aws-lambda-powertools/logger';
import Api from './libs/api/api';
import { MongoConnection } from './data/data.sources/db';
import { HttpCode, HttpException } from './presentation/http.exception';

require('./presentation/token.controller');

dotenv.config();
const logger = new Logger({ serviceName: 'Index' });

MongoConnection.getInstance(process.env.MONGO_URL, 'delfosty_db');

export const handler = async (
  event: any,
  context: Context,
  callback: APIGatewayProxyCallback
): Promise<unknown> => {
  logger.debug(`Event: ${JSON.stringify(event, null, 2)}`);
  logger.debug(`Context: ${JSON.stringify(context, null, 2)}`);

  try {
    logger.debug(`before call API`);
    const response = await Api.getInstance().run(event);
    logger.debug(`after call API`);

    logger.debug(`respuesta al invocar Api ${JSON.stringify(response)}`);
    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (e) {
    logger.error(`after call API error`, JSON.stringify(e));
    let code: HttpCode = HttpCode.InternalError;
    let errors: string[] = ['Error inesperado'];

    if (e instanceof HttpException) {
      code = e.code;
      errors = e.errors;
    }

    return {
      statusCode: code,
      body: JSON.stringify(errors)
    };
  }
};
