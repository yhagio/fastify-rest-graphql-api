import Knex from 'knex';
import {
  IUserSignUp,
  IUserAccount,
  IUserWithPassword,
  IUserWithCustomerToken
} from '../../service/user/interface';
import { IUser } from '../../domain/user';

export interface IUserDataAccess {
  create(user: IUserSignUp): Promise<IUserAccount>;
  update(id: IUser['id'], update: Partial<IUser>): Promise<void>;
  getByEmailWithPassword(email: IUser['email']): Promise<IUserWithPassword>;
  getOneById(id: IUser['id']): Promise<IUserAccount>;
  // updateProfile(user: IUserWithPassword): Promise<IUserAccount>;
  delete(id: IUser['id']): Promise<IUserAccount['id']>;
  getOneByIdTrx(trx: Knex.Transaction, id: IUser['id']): Promise<IUserWithCustomerToken>;
  updateTrx(
    trx: Knex.Transaction,
    id: IUser['id'],
    update: Partial<IUser>
  ): Promise<void>;
}
