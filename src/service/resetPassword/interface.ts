import Knex from 'knex';

import { IResetPassword } from '../../domain/resetPassword';

export interface IResetPasswordService {
  create(resetPassword: IResetPassword): Promise<void>;
  getOneByTokenTrx(trx: Knex.Transaction, token: string): Promise<IResetPassword>;
  deleteTrx(trx: Knex.Transaction, user_id: IResetPassword['user_id']): Promise<void>;
  completeResetPassword(token: string, password: string): Promise<void>;
}

export interface IResetPasswordValidator {
  getOneByTokenTrx(trx: Knex.Transaction, token: string): Promise<IResetPassword>;
  deleteTrx(trx: Knex.Transaction, user_id: IResetPassword['user_id']): Promise<void>;
  create(resetPassword: IResetPassword): Promise<void>;
}
