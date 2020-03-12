const Knex = require('knex');
const config = require('config');

const { users } = require('./seed/users')

async function seed() {
  console.info('Seeding starts!');
  const knex = Knex({ ...config.get('knex') });
  const trx = await getTransaction(knex);
  try {
    // Seed
    await users(trx);

    await trx.commit();
    console.info('Seeding completed!');
  } catch (err) {
    console.error('Failed seeding: ', err);
    await trx.rollback();
  }
  process.exit(0);
}


async function getTransaction(knex) {
  return new Promise((resolve, reject) =>
    knex.transaction(trx => resolve(trx)).catch(reject)
  )
}

seed();
