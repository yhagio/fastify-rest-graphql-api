import AppError from './app';

export class InvalidError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'Invalid';
    this.statusCode = 400;
  }
}