const Knex = require('knex');
const config = require('config');
const bcrypt = require('bcryptjs');

const {
  currencies,
  rates,
  companies,
  titles,
  description,
  first_names,
  last_names } = require('./seed/data');

async function seed() {
  console.info('Seeding starts!');
  const knex = Knex({ ...config.get('knex') });
  const trx = await getTransaction(knex);
  try {
    await users(trx);
    await gigs(trx);
    await bookmarks(trx);
    await trx.commit();
    console.info('Seeding completed!');
  } catch (err) {
    console.error('Failed seeding: ', err);
    await trx.rollback();
  }
  process.exit(0);
}

async function users(trx) {
  const [exists] = await trx.count('id').from('users');
  if (exists.count > 0) {
    console.log(`Already have ${exists.count} users, no need to seed`)
    return;
  }

  const users = [];
  for (const fn of first_names) {
    users.push({
      first_name: fn,
      last_name: random(last_names),
      email: `${fn.toLocaleLowerCase()}@cc.cc`,
      password: bcrypt.hashSync('password', 10),
      token: undefined,
      admin: fn === 'Alice' ? true : false,
      active: true,
      customer_token: undefined
    });
  }
  await trx.insert(users).into('users');
}

async function gigs(trx) {
  const [exists] = await trx.count('id').from('gigs');
  if (exists.count > 0) {
    console.log(`Already have ${exists.count} gigs, no need to seed`)
    return;
  }

  const gigs = [];
  const gigTags = [];
  const gigLocations = [];
  const gigContracts = [];
  const payments = [];

  const users = await trx.select('id').from('users');
  let tags = await trx.select('id').from('tags');
  const locations = await trx.select('id').from('locations');
  const contracts = await trx.select('id').from('contracts');

  for (let i = 0; i < 100; i++) {
    const userId = random(users).id;

    const [gig_id] = await trx
      .insert({
        title: `${random(titles)} ${i}`,
        description,
        company: random(companies),
        url: 'https://google.com',
        contact: 'some_contact@cc.cc',
        salary: 5000,
        currency: random(currencies),
        rate: random(rates),
        benefit: 'Free lunch every day',
        user_id: userId
      })
      .into('gigs')
      .returning('id');


    const tagId = random(tags).id
    tags = tags.filter(t => (t.id !== tagId))
    const tagId2 = random(tags).id
    tags = tags.filter(t => (t.id !== tagId))
    const tagId3 = random(tags).id

    gigTags.push({
      gig_id,
      tag_id: tagId
    });

    gigTags.push({
      gig_id,
      tag_id: tagId2
    });

    gigTags.push({
      gig_id,
      tag_id: tagId3
    });

    gigLocations.push({
      gig_id,
      location_id: random(locations).id
    });

    gigContracts.push({
      gig_id,
      contract_id: random(contracts).id
    });

    payments.push({
      gig_id,
      amount: 2000,
      user_id: userId,
      charge_id: 'test_charge_id',
      customer_id: 'test_customer_id'
    })
  }

  console.log('gigs...')
  await trx.insert(gigs).into('gigs');
  console.log('gig_tags...')
  await trx.insert(gigTags).into('gig_tags');
  console.log('gig_locations...')
  await trx.insert(gigLocations).into('gig_locations');
  console.log('gig_contracts...')
  await trx.insert(gigContracts).into('gig_contracts');
  console.log('payments...')
  await trx.insert(payments).into('payments');
}

async function bookmarks(trx) {
  const [exists] = await trx.count('id').from('bookmarks');
  if (exists.count > 0) {
    console.log(`Already have ${exists.count} bookmarks, no need to seed`)
    return;
  }

  console.log('bookmarks...');
  const bookmarks = [];
  const userIds = await trx.select('id').from('users').then(users => users.map(u => u.id));
  for (const userId of userIds) {
    const gigs = await trx.select('id').from('gigs').whereNot('user_id', userId);
    for (const gig of gigs) {
      bookmarks.push({
        user_id: userId,
        gig_id: gig.id
      });
    }
  }
  await trx.insert(bookmarks).into('bookmarks');
}

async function getTransaction(knex) {
  return new Promise((resolve, reject) =>
    knex.transaction(trx => resolve(trx)).catch(reject)
  )
}

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

seed();
