export default abstract class AppError extends Error {
  name: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'Application Error';
    this.statusCode = 500;
  }
}
