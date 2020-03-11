import AppError from './app';

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'Forbidden';
    this.statusCode = 403;
  }
}
