export enum HttpCode {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalError = 500
}

export class HttpException extends Error {
  code: HttpCode;
  errors: string[];

  constructor(code: HttpCode, errors: string[]) {
    super(errors[0]);
    this.code = code;
    this.errors = errors;
  }
}

export class ForbiddenException extends HttpException {
  constructor(errors: string[]) {
    super(HttpCode.Forbidden, errors);
  }
}

export class InternalException extends HttpException {
  constructor(errors: string[]) {
    super(HttpCode.InternalError, errors);
  }
}
