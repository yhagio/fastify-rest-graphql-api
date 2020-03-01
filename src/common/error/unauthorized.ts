import AppError from './app';

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'Unauthorized';
    this.statusCode = 401;
  }
}