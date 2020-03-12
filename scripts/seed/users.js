const bcrypt = require('bcryptjs');

const firstNames = [
  'Alice', 'Bob', 'Chris', 'David', 'Erica', 'Fanny', 'Gabe', 'Iris', 'Jake',
  'Kraig', 'Loma', 'Marcelo', 'Natalia', 'Oma', 'Peter', 'Qazi', 'Rooney', 'Scott',
  'Tim', 'Ugo', 'Vix', 'Wyolica', 'Xali', 'Yu', 'Zeniga'
];

const lastNames = [
  'Smith', 'Alonzo', 'Murphy', 'Gomez', 'Lee'
];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function users(trx) {
  const [exists] = await trx.count('id').from('users');
  if (exists.count > 0) {
    console.log(`Already have ${exists.count} users, no need to seed`)
    return;
  }

  const users = [];
  for (const fn of firstNames) {
    users.push({
      first_name: fn,
      last_name: random(lastNames),
      email: `${fn.toLocaleLowerCase()}@cc.cc`,
      password: bcrypt.hashSync('test1234', 10),
      token: undefined,
      admin: fn === 'Alice' ? true : false,
      active: true,
      customer_token: undefined
    });
  }
  await trx.insert(users).into('users');
}

module.exports = {
  users
}