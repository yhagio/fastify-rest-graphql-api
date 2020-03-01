const Knex = require('knex');
const path = require('path');
const config = require('config');

async function migrate() {
  console.info('...migration starts...');
  const knex = Knex({
    ...config.get('infra.knex'),
    migrations: {
      directory: path.normalize(`${__dirname}/migrations`),
      tableName: 'knex_migrations'
    }
  });

  await knex.migrate.latest();
  await knex.destroy();
  console.info('...migration done...');
  process.exit(0);
}

migrate();
