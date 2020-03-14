import Knex from 'knex';

import {
  IUserService,
  IUserSignUp,
  IUserAccount,
  IUserWithPassword,
  IUserWithCustomerToken
} from './interface';
import { InvalidError } from '../../common/error/invalid';
import { IUser } from '../../domain/user';
import { IUserDataAccess } from '../../dataAccess/user/interface';

export default class UserValidator implements IUserService {
  constructor(private dataAccess: IUserDataAccess) {}

  async create(user: IUserSignUp): Promise<IUserAccount> {
    if (!user || !Object.keys(user).length) {
      throw new InvalidError('user is required');
    } else if (!user.first_name) {
      throw new InvalidError('first_name is required');
    } else if (!user.last_name) {
      throw new InvalidError('last_name is required');
    } else if (!user.email) {
      throw new InvalidError('email is required');
    } else if (!user.password) {
      throw new InvalidError('password is required');
    } else if (user.password.length < 4) {
      throw new InvalidError('password must be longer than 3 characters');
    }
    return this.dataAccess.create(user);
  }

  async update(id: IUser['id'], update: Partial<IUser>): Promise<void> {
    if (!id) {
      throw new InvalidError('id is required');
    }
    if (!update) {
      throw new InvalidError('update object is required');
    }
    if (!update.first_name) {
      throw new InvalidError('first name is required');
    }
    if (!update.last_name) {
      throw new InvalidError('last name is required');
    }
    if (!update.email) {
      throw new InvalidError('email is required');
    }
    return this.dataAccess.update(id, update);
  }

  async getByEmailWithPassword(email: IUser['email']): Promise<IUserWithPassword> {
    if (!email) {
      throw new InvalidError('email is required');
    }
    return this.dataAccess.getByEmailWithPassword(email);
  }

  async getOneById(id: IUser['id']): Promise<IUserAccount> {
    if (!id) {
      throw new InvalidError('id is required');
    }
    return this.dataAccess.getOneById(id);
  }

  async getOneByIdTrx(
    trx: Knex.Transaction,
    id: IUser['id']
  ): Promise<IUserWithCustomerToken> {
    if (!id) {
      throw new InvalidError('id is required');
    }
    if (!trx) {
      throw new InvalidError('trx is required');
    }
    return this.dataAccess.getOneByIdTrx(trx, id);
  }

  async updateTrx(
    trx: Knex.Transaction,
    id: IUser['id'],
    update: Partial<IUser>
  ): Promise<void> {
    if (!id) {
      throw new InvalidError('id is required');
    }
    if (!trx) {
      throw new InvalidError('trx is required');
    }
    if (!update) {
      throw new InvalidError('update object is required');
    }
    return this.dataAccess.updateTrx(trx, id, update);
  }
}
