import Knex from 'knex';

import { IResetPassword } from '../../domain/resetPassword';

export interface IResetPasswordDataAccess {
  getOneByTokenTrx(trx: Knex.Transaction, token: string): Promise<IResetPassword>;
  deleteTrx(trx: Knex.Transaction, user_id: IResetPassword['user_id']): Promise<void>;
  create(resetPassword: IResetPassword): Promise<void>;
}
