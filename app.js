var express = require('express');

var url = require('url');

const pg = require('pg');

var app = express();

const connectionString = process.env.DATABASE_URL || 'postgres://freetime:freetime@localhost:5432/freetime';

const client = new pg.Client(connectionString);

client.connect();

//prepare database
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
  PRIMARY KEY (user_id, friend_id),
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

app.get('/friends/:userId', function(req, res, next) {

  //check if the id exist
  const query9 = client.query(`SELECT id FROM account where id = $1::int ;`
    ,[parseInt(req.params.userId)], function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        //if the id doesn't exists
        if (typeof result.rows[0] == 'undefined') {
          //error handling
          var err = new Error();
          err.status = 404;
          err.message = 'The ID does not exist.';
          next(err);

        } else {
          const query7 = client.query(
            `SELECT array_agg(friend_id) FROM friend WHERE user_id = $1::int;`
            ,[parseInt(req.params.userId)], function(err, result) {

            if (err) {
              throw err;
            }
            if (result) {
              if (typeof result.rows[0] == 'undefined' ) {
                res.json({friends: []});

              } else {
                var friendsIds = result.rows[0].array_agg;
                var results = [];
                var resultsCount = 0;
                for (i = 0; i < friendsIds.length; i++) {
                  getUserDetails(friendsIds[i], function(err, result){
                    if (result) {
                      resultsCount ++;
                      results.push(result);
                      if (resultsCount == friendsIds.length) {
                        res.json({friends: results});
                      }
                    }
                  });
                };
              }

            };
          })
        }
      }
    }
  );
})

function getUserDetails(id, callback) {
  const query8 = client.query(
    `SELECT id, first_name, last_name FROM account WHERE id = $1::int`,[parseInt(id)],
     function(err, result) {
      if (err) throw err;
      if (result) {
        callback(null, result.rows[0]);
      }
    }
  );
}

// handling 404 errors
app.use(function(err, req, res, next) {
  if(err.status !== 404) {
    return next();
  }

  res.status(404);
  res.send(err.message || 'ERROR 404');
});

app.listen(3000)
