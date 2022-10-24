import { Logger } from '@aws-lambda-powertools/logger';

export class Card {
  email?: string;
  card_number?: string;
  cvv?: string;
  expiration_year?: string;
  expiration_month?: string;
}

export class Brand {
  public static getBrand(cardNumber: string) {
    switch (cardNumber.charAt(0)) {
      case '3':
        return 'AMEX';
      case '4':
        return 'VISA';
      case '5':
        return 'MASTERCARD';
      default:
        return '';
    }
  }
}

export interface TokenizationResponse {
  token: string;
}

export interface CardRequest {
  token: string;
}

const logger = new Logger({ serviceName: 'Card' });

export class CardValidate {
  validate(card: Card): null | string[] {
    const errors: string[] = [];

    //TODO: validar algoritmo de LUHN

    if (
      (card.cvv ?? '').length !== 3 &&
      ['VISA', 'MASTERCARD'].find(
        (c) => c === Brand.getBrand(card.card_number ?? '')
      )
    ) {
      errors.push('El cvv no tiene el formato correcto');
    }

    if (
      (card.cvv ?? '').length !== 4 &&
      Brand.getBrand(card.card_number ?? '') === 'AMEX'
    ) {
      errors.push('El cvv no tiene el formato correcto');
    }

    const monthRegex = /^(0[1-9]{1}|1[0-2]{1})$/;
    if (!monthRegex.test(card.expiration_month ?? '0')) {
      errors.push('Mes incorrecto');
    }

    const year = new Date().getFullYear();
    const yearRegex = new RegExp(
      `^(${year}|${year + 1}|${year + 2}|${year + 3}|${year + 4})$`
    );
    if (!yearRegex.test(card.expiration_year ?? '')) {
      errors.push('Año incorrecto');
    }

    //TODO: validar email con regex o alguna librería de validación

    logger.debug(`ERRORS ${JSON.stringify(errors)}`);
    return errors.length === 0 ? null : errors;
  }
}
