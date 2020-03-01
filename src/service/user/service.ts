import Knex from 'knex';

import {
  IUserService,
  IUserSignUp,
  IUserAccount,
  IUserWithPassword,
  IUserWithCustomerToken
} from './interface';
import { IUser } from '../../domain/user';

export default class UserService implements IUserService {
  constructor(private validator: IUserService) {}

  async create(user: IUserSignUp): Promise<IUserAccount> {
    return this.validator.create(user);
  }

  async update(id: IUser['id'], update: Partial<IUser>): Promise<void> {
    return this.validator.update(id, update);
  }

  async getByEmailWithPassword(email: IUser['email']): Promise<IUserWithPassword> {
    return this.validator.getByEmailWithPassword(email);
  }

  async getOneById(id: IUser['id']): Promise<IUserAccount> {
    return this.validator.getOneById(id);
  }

  async getOneByIdTrx(
    trx: Knex.Transaction,
    id: IUser['id']
  ): Promise<IUserWithCustomerToken> {
    return this.validator.getOneByIdTrx(trx, id);
  }

  async updateTrx(
    trx: Knex.Transaction,
    id: IUser['id'],
    update: Partial<IUser>
  ): Promise<void> {
    return this.validator.updateTrx(trx, id, update);
  }
}
