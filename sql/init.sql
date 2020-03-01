CREATE user dev_user with password '123test';
ALTER USER dev_user with superuser;

CREATE DATABASE local_db;
GRANT all privileges ON DATABASE local_db TO dev_user;
