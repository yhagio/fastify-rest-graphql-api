import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import IConfig from '../../common/config';
import { IAuthService, IUserToken } from './interface';
import { IUserAccount } from '../user/interface';

export default class AuthService implements IAuthService {
  constructor(private config: IConfig) {}

  async checkPassword(inputPassword: string, dbPassword: string): Promise<boolean> {
    return bcrypt.compare(inputPassword, dbPassword);
  }

  issueToken(user: IUserAccount): string {
    const { id, first_name, email, admin } = user;
    return jwt.sign(
      { id, first_name, email, admin },
      this.config.get('infra.jwt.secret'),
      {
        expiresIn: this.config.get('infra.jwt.expiresin')
      }
    );
  }

  async verifyToken(token: string): Promise<IUserToken> {
    return <IUserToken>jwt.verify(token, this.config.get<string>('infra.jwt.secret'));
  }
}
