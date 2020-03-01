exports.up = async (knex) => {
  await knex.raw(`
    CREATE TABLE reset_passwords (
      id                  UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
      token               TEXT      NOT NULL,
      user_id             UUID      NOT NULL,
      created_at          TIMESTAMP NOT NULL default NOW()
    );
  `);
}

exports.down = async (knex) => {
  await knex.raw(`
    DROP TABLE IF EXISTS reset_passwords;
  `);
}