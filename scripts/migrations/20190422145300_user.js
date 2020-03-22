exports.up = async (knex) => {
  await knex.raw(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE TABLE users (
        id             uuid DEFAULT gen_random_uuid (),
        first_name     VARCHAR NOT NULL,
        last_name      VARCHAR NOT NULL,
        email          VARCHAR NOT NULL UNIQUE,
        password       VARCHAR NOT NULL,
        token          VARCHAR,
        customer_token VARCHAR,
        admin          BOOLEAN DEFAULT false,
        active         BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL default NOW(),
        updated_at TIMESTAMP NOT NULL default NOW(),
        PRIMARY KEY (id)
    );


    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = now();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_users_updated_at BEFORE UPDATE
      ON users FOR EACH ROW EXECUTE PROCEDURE
      update_updated_at_column();
  `);
};

exports.down = async (knex) => {
  await knex.raw(`
    DROP TABLE IF EXISTS users;
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    DROP EXTENSION pgcrypto;
  `);
};
