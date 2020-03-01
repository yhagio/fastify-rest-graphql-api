import AppError from './app';

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFound';
    this.statusCode = 404;
  }
}