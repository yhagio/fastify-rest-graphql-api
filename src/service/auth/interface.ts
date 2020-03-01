import { IUserAccount } from '../user/interface';

export interface IAuthService {
  checkPassword(inputPassword: string, dbPassword: string): Promise<boolean>;
  issueToken(user_id: IUserAccount): string;
  verifyToken(token: string): Promise<IUserToken>;
}

export interface IUserToken {
  id: string;
  first_name: string;
  email: string;
  iat: number;
  exp: number;
}
