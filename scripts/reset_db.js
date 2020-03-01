const Knex = require('knex');
const config = require('config');

async function resetDB() {
  console.info('...resetting db starts...');
  const knex = Knex({
    ...config.get('knex')
  });

  const users = knex('users').del();
  const gigs = knex('gigs').del();

  await Promise.all([
    users,
    gigs
  ])
  console.info('...restting db done...');
  process.exit(0);
}

resetDB();
