CREATE EXTENSION IF NOT EXISTS pgcrypto;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id uuid DEFAULT gen_random_uuid (),
    username VARCHAR NOT NULL UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    PRIMARY KEY (id)
);

-- ROLLBACK
-- DROP EXTENSION pgcrypto;
-- DROP TABLE IF EXISTS users;