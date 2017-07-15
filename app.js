const pg = require('pg');
const sys = require('util');

const connectionString = process.env.DATABASE_URL || 'postgres://freetime:freetime@localhost:5432/freetime';

const client = new pg.Client(connectionString);
client.connect();


// const accountTableExistsQuery = client.query(`SELECT * FROM pg_catalog.pg_tables WHERE tablename = 'account'`, function(err, result) {
//   // done(err);
//
//   if(err) {
//     return console.error('error running query', err);
//   }
//   console.log(result.rowCount);
//
//   }
// );
// console.log('accountTableExistsQuery:');
// console.log(accountTableExistsQuery);





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
)`);
query.on('end', () => { client.end(); });
