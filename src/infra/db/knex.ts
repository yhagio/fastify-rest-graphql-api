import Knex from 'knex';
// import path from 'path';

import IConfig from '../../common/config';

export default class DB {
  private connection: Knex;

  constructor(private config: IConfig) {
    this.connection = Knex(this.config.get('infra.knex'));
  }

  getConnection(): Knex {
    return this.connection;
  }

  startTransaction(): Promise<Knex.Transaction> {
    return new Promise((resolve, reject) =>
      this.connection.transaction(trx => resolve(trx)).catch(reject)
    );
  }

  /*
  // Runs all migrations that have not yet been run.
  async migrate(): Promise<void> {
    const migrationKnex = this.getMigrations();
    await migrationKnex.migrate.latest();
    await migrationKnex.destroy();
  }

  // Rolls back the latest migration group.
  async rollback(): Promise<void> {
    const migrationKnex = this.getMigrations();
    await migrationKnex.migrate.rollback();
    await migrationKnex.destroy();
  }

  private getMigrations(): Knex {
    const migrationConfig = {
      ...this.config.get<object>('knex'),
      migrations: {
        directory: path.normalize(`${__dirname}/migrations`),
        tableName: 'knex_migrations'
      }
    };
    return Knex(migrationConfig as any);
  }
  */
}
