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
  `);

  const query1 = client.query(

  `CREATE TABLE IF NOT EXISTS "friend" (
    "user_id" integer,
    "friend_id" integer,
    CONSTRAINT "user_id" FOREIGN KEY ("user_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "friend_id" FOREIGN KEY ("friend_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE
  );
  `);

  const query2 = client.query(
    `INSERT INTO "account"("id", "first_name", "last_name", "email", "deleted", "phone_number")
    VALUES(0, 'Mehrad', 'Mohammadi', 'm3hrad@gmail.com', FALSE, '0505977458');
  `);

  const query3 = client.query(`
    INSERT INTO "account"("id", "first_name", "last_name", "email", "deleted", "phone_number")
    VALUES(1, 'Mahyar', 'Mohammadi', 'mahyar@gmail.com', FALSE, '0417543124');
  `);

  const query4 = client.query(`
    INSERT INTO "account"("id", "first_name", "last_name", "email", "deleted", "phone_number")
    VALUES(2, 'Shima', 'Edalatkhah', 'shima@gmail.com', FALSE, '0449512964');
  `);

  const query5 = client.query(`
    INSERT INTO "friend"("user_id", "friend_id") VALUES(0, 1);
  `);

  const query6 = client.query(`
    INSERT INTO "friend"("user_id", "friend_id") VALUES(0, 2);
  `);

  query2.on('error', function(error) {
    //  console.log(error);
  });

  query3.on('error', function(error) {
    //  console.log(error);
  });

  query4.on('error', function(error) {
    // console.log(error);
  });

  query5.on('error', function(error) {
    // console.log(error);
  });

  query6.on('error', function(error) {
    // console.log(error);
  });

query6.on('end', () => { client.end(); });
