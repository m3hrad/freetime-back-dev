var express = require('express');

var app = express();

var url = require('url');

const pg = require('pg');
var port = process.env.PORT || 3000;
const connectionString = process.env.DATABASE_URL || 'postgres://freetime:freetime@localhost:5432/freetime';

const client = new pg.Client(connectionString);

client.connect();

const query = client.query(
  `CREATE TABLE IF NOT EXISTS "account" (
    "id" serial,
    "first_name" text,
    "last_name" text,
    "email" text,
    "password_hash" text,
    "deleted" bool,
    "phone_number" text,
    "birthdate" date,
    "created_on" timestamp with time zone,
    "photo_url" text,
    "available" text DEFAULT "FALSE",
    "token" text,
    PRIMARY KEY ("id"),
    UNIQUE ("email"),
    UNIQUE ("phone_number"),
    UNIQUE ("token")
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
  `INSERT INTO "account"("id", "first_name", "last_name", "email", "deleted", "phone_number", "token")
  VALUES(0, 'Mehrad', 'Mohammadi', 'm3hrad@gmail.com', FALSE, '0505977458', '1');
`);

const query3 = client.query(`
  INSERT INTO "account"("id", "first_name", "last_name", "email", "deleted", "phone_number", "token")
  VALUES(1, 'Mahyar', 'Mohammadi', 'mahyar@gmail.com', FALSE, '0417543124', '2');
`);

const query4 = client.query(`
  INSERT INTO "account"("id", "first_name", "last_name", "email", "deleted", "phone_number", "token")
  VALUES(2, 'Shima', 'Edalatkhah', 'shima@gmail.com', FALSE, '0449512964', '3');
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
  // console.log(error");
});
query6.on('error', function(error) {
  // console.log(error);
});
app.get('/', function(req, res) {
  res.send('OK');
});

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));

var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://free-time-c6774.firebaseio.com"
  });

app.post('/auth/', function(req, res) {
  console.log("The connection is OK");
  var token = req.get('Authorization');
  var email = req.body.email;

  admin.auth().verifyIdToken(req.get('Authorization'))
  .then(function(decodedToken) {

    const query9 = client.query(
      `UPDATE account SET token = $2 WHERE email = $1 RETURNING id,first_name,
      last_name, email, available`,[email, token],
        function(err, result) {
          if (err) {
            console.log(err);
          }
          if (result) {
            if (result.rowCount == 0) {
              console.log('row count = 0');
                //create a new user
                const query100 = client.query(
                  `INSERT INTO account (id,first_name,last_name, email, password_hash,
                     deleted, phone_number, birthdate, created_on, photo_url, available, token)
                     VALUES (DEFAULT, NULL, NUll, $1, NULL, FALSE, NULL, NULL, NULL, NULL, "FALSE", $2)
                     RETURNING id,first_name, last_name, email, available`,[email, token],
                    function(err, result) {
                      if (err) {
                        console.log('duplicate token:');
                        console.log(err);
                        res.sendStatus(400);
                      }
                      if (result) {
                        res.send(result.rows[0]);
                      }
                    }
                  )
            } else {
              //return the existing customers' info
              res.json(result.rows[0]);
            }
          }
        }
    );

    var uid = decodedToken.uid;
    console.log("The auth is ok");
  }).catch(function(error) {
    // Handle error
    res.sendStatus(401);
    console.log("Error");
  });
});

function getUserByToken(token, callback) {
  const query = client.query(
    `SELECT * FROM account WHERE token = $1`,[token],
     function(err, result) {
      if (err) {
        callback(err, null);
      }
      if (result) {
        callback(null, result.rows[0]);
      }
    }
  );
}

app.get('/user/:userId/friends', function(req, res, next) {
  if (typeof req.get('Authorization') == 'undefined') {
    res.sendStatus(401);
    res.end();
  }
  admin.auth().verifyIdToken(req.get('Authorization'))
  .then(function(decodedToken) {
    //verify the token
    getUserByToken(req.get('Authorization'), function(err, result){
      if(err) {
        console.log(err);
      }
      if (result) {
        if (result.id == req.params.userId) {
          console.log('valid');
              //check if the id exist
              const query9 = client.query(`SELECT id FROM account where id = $1::int ;`
                ,[parseInt(req.params.userId)], function(err, result) {
                  if (err) {
                    console.log(err);
                  }
                  if (result) {
                    //if the id doesnt exists
                    if (typeof result.rows[0] == 'undefined') {
                      //error handling
                      var err = new Error();
                      err.status = 404;
                      err.message = 'The ID does not exist.';
                      next(err);

                    } else {
                      const query7 = client.query(
                        `SELECT array_agg(friend_id) FROM friend WHERE user_id = $1::int group by user_id;`
                        ,[parseInt(req.params.userId)], function(err, result) {
                        if (err) {
                          throw err;
                        }
                        if (result) {
                          if (typeof result.rows[0] !== 'undefined' ) {
                            var friendsIds = result.rows[0].array_agg;
                            var results = [];
                            var resultCount = 0;
                            for (i = 0; i < friendsIds.length; i++) {
                              getUserInfo(friendsIds[i], function(err, result){
                                if (result) {
                                  resultCount ++;
                                  results.push(result);
                                  if (resultCount == friendsIds.length) {
                                    res.json({friends: results});
                                  }
                                }
                              });
                            };
                          } else {
                              res.json({friends: []});
                          }
                        };
                      })
                    }
                  }
                }
              );
        } else {
          res.send(401);
        }
      }
    });

    }).catch(function(error) {
      // Handle error
      console.log("Error");
      res.sendStatus(401);
    });
})

app.put('/user/:id', function(req, res, next) {
  var available = req.body.available;
  var id = req.params.id;

  if (typeof req.get('Authorization') == 'undefined') {
    res.sendStatus(401);
    res.end();
  }

  //verify request token
  admin.auth().verifyIdToken(req.get('Authorization'))
  .then(function(decodedToken) {

    // check user ID from the token and compare it to the request ID
    getUserByToken(req.get('Authorization'), function(err, result){
      if(err) {
        console.log(err);
        res.sendStatus(500);
      }
      if (result) {
        if (result.id == id) {
          //same id
          //update available status
          if (typeof req.body.available !== 'undefined' ) {
            const query7 = client.query(
              `UPDATE account SET available = $1 WHERE id = $2 RETURNING id,first_name,
              last_name, email, available;`
              ,[available, id], function(err, result) {
              if (err) {
                res.sendStatus(500);
              }
              if (result) {
                res.send(result.rows[0]);
                // res.json({user: result.rows[0]});
                // res.send(result.rows[0]);
              }
            })
          } else {
            res.sendStatus(405);
          }
        } else {
          res.sendStatus(401);
        }
      }
    })
  }).catch(function(error) {
    // Handle error
    console.log("Error");
    res.sendStatus(401);
  });
})

function getUserInfo(id, callback) {
  const query8 = client.query(
      `SELECT id, email, first_name, last_name, available FROM account WHERE id = $1::int`,[parseInt(id)],
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

app.listen(port, function() {
  console.log('Our app is running on http://localhost:' + port);
});
