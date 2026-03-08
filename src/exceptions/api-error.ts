
export default class ApiError extends Error {

  status: number;
  errors: any[];

  constructor(status: number, message: string, errors: any[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;

    if (new.target === ApiError) {
      Object.setPrototypeOf(this, ApiError.prototype);
    }
  }

  static UnauthorizedError() {
    return new ApiError(401, 'Пользователь не авторизован');
  }
  static BadRequest(message: string, errors: any[] = []) {
    return new ApiError(400, message, errors);
  }
  static InternalError(message: string, errors: any[] = []) {
    return new ApiError(500, message, errors);
  }

}