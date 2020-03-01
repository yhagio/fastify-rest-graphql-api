import Knex from 'knex';

import { IResetPasswordValidator } from './interface';
import { InvalidError } from '../../common/error/invalid';
import { IResetPassword } from '../../domain/resetPassword';
import { IResetPasswordDataAccess } from '../../dataAccess/resetPassword/interface';

export default class ResetPasswordValidator implements IResetPasswordValidator {
  constructor(private readonly dataAccess: IResetPasswordDataAccess) { }

  async getOneByTokenTrx(trx: Knex.Transaction, token: string): Promise<IResetPassword> {
    if (!trx) {
      throw new InvalidError('Transaction is required');
    }
    if (!token) {
      throw new InvalidError('Token is required');
    }
    return this.dataAccess.getOneByTokenTrx(trx, token);
  }

  async deleteTrx(
    trx: Knex.Transaction,
    user_id: IResetPassword['user_id']
  ): Promise<void> {
    if (!trx) {
      throw new InvalidError('Transaction is required');
    }
    if (!user_id) {
      throw new InvalidError('User ID is required');
    }
    await this.dataAccess.deleteTrx(trx, user_id);
  }

  async create(resetPassword: IResetPassword): Promise<void> {
    if (!resetPassword || !resetPassword.user_id || !resetPassword.token) {
      throw new InvalidError('ResetPassword object is invalid');
    }
    await this.dataAccess.create(resetPassword);
  }
}
