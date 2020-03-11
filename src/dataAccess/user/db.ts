import Knex from 'knex';

import { IUserDataAccess } from './interface';
import {
  IUserSignUp,
  IUserAccount,
  IUserWithPassword,
  IUserWithCustomerToken
} from '../../service/user/interface';
import { IUser } from '../../domain/user';
import { hashString } from '../../common/hash';

export default class UserDataAccess implements IUserDataAccess {
  constructor(private knex: Knex) {}

  async create(user: IUserSignUp): Promise<IUserAccount> {
    user.password = await hashString(user.password);

    const [created] = await this.knex
      .insert(user)
      .into('users')
      .returning(['id', 'first_name', 'last_name', 'email']);
    return created;
  }

  async update(user_id: IUser['id'], update: Partial<IUser>): Promise<void> {
    const { id, admin, token, customer_token, created_at, updated_at, ...rest } = update;
    if (typeof rest.password !== 'undefined') {
      rest.password = await hashString(rest.password);
    }
    await this.knex
      .from('users')
      .update(rest)
      .where({ id: user_id });
  }

  async getByEmailWithPassword(email: IUser['email']): Promise<IUserWithPassword> {
    return this.knex
      .select('id', 'first_name', 'last_name', 'email', 'admin', 'password')
      .from('users')
      .where({ email })
      .first();
  }

  async getOneById(user_id: string): Promise<IUserAccount> {
    return this.knex
      .select('id', 'first_name', 'last_name', 'email', 'admin')
      .from('users')
      .where({ id: user_id })
      .first();
  }

  async getOneByIdTrx(
    trx: Knex.Transaction,
    id: IUser['id']
  ): Promise<IUserWithCustomerToken> {
    return trx
      .select(['id', 'first_name', 'last_name', 'email', 'customer_token'])
      .from('users')
      .where({ id })
      .first();
  }

  async updateTrx(
    trx: Knex.Transaction,
    id: IUser['id'],
    update: Partial<IUser>
  ): Promise<void> {
    await trx
      .from('users')
      .update(update)
      .where({ id });
  }

  async delete(id: IUser['id']): Promise<IUserAccount['id']> {
    await this.knex('users')
      .where({ id })
      .del();
    return id;
  }
}
