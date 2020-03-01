import Knex from 'knex';

import { IResetPasswordService, IResetPasswordValidator } from './interface';
import { IResetPassword } from '../../domain/resetPassword';
import { InvalidError } from '../../common/error/invalid';
import { isMoreThanXHours } from '../../common/date';
import { IUserService } from '../user/interface';
import { OperationError } from '../../common/error/operation';
import { hashString } from '../../common/hash';

export default class ResetPasswordService implements IResetPasswordService {
  constructor(
    private readonly knex: Knex,
    private readonly userService: IUserService,
    private readonly validator: IResetPasswordValidator
  ) { }

  async create(resetPassword: IResetPassword): Promise<void> {
    await this.validator.create(resetPassword);
  }

  async getOneByTokenTrx(trx: Knex.Transaction, token: string): Promise<IResetPassword> {
    return this.validator.getOneByTokenTrx(trx, token);
  }

  async deleteTrx(
    trx: Knex.Transaction,
    user_id: IResetPassword['user_id']
  ): Promise<void> {
    await this.validator.deleteTrx(trx, user_id);
  }

  async completeResetPassword(token: string, password: string): Promise<void> {
    const trx = await this.knex.transaction();
    try {
      const record = await this.getOneByTokenTrx(trx, token);
      if (!record) {
        throw new InvalidError('Token is already used or invalid!');
      }
      const { user_id, created_at } = record;
      // Check if token is created within 1 hr or not
      if (!created_at || isMoreThanXHours(created_at, 1)) {
        throw new InvalidError('Token is expired!');
      }
      // Update user's password
      const pass = await hashString(password);
      await this.userService.updateTrx(trx, user_id, { password: pass });
      // Delete reset_password record
      await this.deleteTrx(trx, user_id);
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      throw new OperationError(`Failed to complete resetting password; ${err.message}`);
    }
  }
}
