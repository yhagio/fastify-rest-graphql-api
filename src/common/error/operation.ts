import AppError from './app';

export class OperationError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'Operation';
    this.statusCode = 503;
  }
}
