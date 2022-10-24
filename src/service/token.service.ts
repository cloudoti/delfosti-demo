import {
  Card,
  CardValidate,
  TokenizationResponse
} from '../domain/entity/token.entity';
import { ClientMongo } from '../data/data.sources/db';
import { ForbiddenException } from '../presentation/http.exception';
import { v4 as uuid } from 'uuid';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'TokenService' });

export class TokenService {
  public async getCard(token: string): Promise<unknown> {
    const client = await new ClientMongo().connect();

    const card = await client
      .collection('tokenization')
      .findOne({ uuid: token });

    if (!card || card.expireTime < new Date().getTime()) {
      throw new ForbiddenException(['El token no existe o expiró']);
    }

    return {
      ...card,
      cvv: undefined,
      uuid: undefined,
      expireTime: undefined,
      _id: undefined
    };
  }

  public async tokenization(card: Card): Promise<TokenizationResponse> {
    const errors = new CardValidate().validate(card);
    if (errors) {
      throw new ForbiddenException(errors);
    }

    logger.debug('After mongo');

    const client = await new ClientMongo().connect();

    const fifteenMinutes = 15 * 60 * 1000;

    logger.debug('After replaceAll');

    const saveCard = {
      ...card,
      expireTime: new Date().getTime() + fifteenMinutes,
      uuid: uuid().split('-').join('')
    };

    logger.debug('Before replaceAll');

    await client.collection('tokenization').insertOne(saveCard);

    logger.debug('Before sabve collection');

    //TODO: No tuve el tiempo para la generación de un ID único de 16 caractéres
    return { token: saveCard.uuid };
  }
}
