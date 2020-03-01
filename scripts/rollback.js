const Knex = require('knex');
const path = require('path');
const config = require('config');

async function rolback() {
  console.info('...rollback starts...')
  const knex = Knex({
    ...config.get('knex'),
    migrations: {
      directory: path.normalize(`${__dirname}/migrations`),
      tableName: 'knex_migrations'
    }
  });

  await knex.migrate.rollback();
  await knex.destroy();
  console.info('...rollback done...');
  process.exit(0);
}

rolback();
