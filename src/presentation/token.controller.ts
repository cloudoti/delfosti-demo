import { Controller, Post } from '../libs/api/types';
import { TokenService } from '../service/token.service';
import {
  Card,
  CardRequest,
  TokenizationResponse
} from '../domain/entity/token.entity';

@Controller
class TokenController {
  @Post('/card')
  public getToken(body: CardRequest) {
    return new TokenService().getCard(body.token);
  }

  @Post('/token')
  public saveToken(
    body: Card,
    headers: unknown
  ): Promise<TokenizationResponse> {
    return new TokenService().tokenization(body);
  }
}

export default new TokenController();
