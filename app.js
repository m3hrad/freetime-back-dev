const pg = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://freetime:freetime@localhost:5432/freetime';

const client = new pg.Client(connectionString);
client.connect();

const query = client.query(
  `CREATE TABLE IF NOT EXISTS "account" (
    "id" serial ,
    "first_name" text,
    "last_name" text,
    "email" text,
    "password_hash" text,
    "deleted" bool,
    "phone_number" text,
    "birthdate" date,
    "created_on" timestamp with time zone,
    "photo_url" text,
    PRIMARY KEY ("id"),
    UNIQUE ("email"),
    UNIQUE ("phone_number")
  );
  CREATE TABLE IF NOT EXISTS "friends" (
      "id" integer,
      "friend_id" integer,
      PRIMARY KEY ("id"),
      CONSTRAINT "account_id" FOREIGN KEY ("id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "friend_id" FOREIGN KEY ("friend_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

`);



query.on('end', () => { client.end(); });
