import 'mocha';
import { expect } from 'chai';

import { Card, CardValidate } from '../../../src/domain/entity/token.entity';

const card: Card = {
  email: 'gian.corzo@gmail.com',
  card_number: '4111111111111111',
  cvv: '123',
  expiration_year: '2025',
  expiration_month: '09'
};

describe('CardValidate', () => {
  it('Successfully', () => {
    const validation = new CardValidate().validate(card);

    expect(validation).to.be.null;
  });

  it('Incorrect cvv ', () => {
    card.cvv = '1234';
    const validation = new CardValidate().validate(card);

    expect(validation).to.be.length(1);
  });

  it('Incorrect year ', () => {
    card.expiration_year = '2029';
    const validation = new CardValidate().validate(card);

    expect(validation).to.be.length(2);
  });

  it('Incorrect month ', () => {
    card.expiration_month = '13';
    const validation = new CardValidate().validate(card);

    expect(validation).to.be.length(3);
  });
});
