'use strict'

const faker = require('faker');
const MongoClient = require('mongodb').MongoClient;

var users = [];

for(var i=0; i<1000; i++){
  users.push({
    'username': faker.internet.userName(),
    'displayname': faker.name.findName(),
    'email': faker.internet.email()
  });
}

MongoClient.connect("mongodb://localhost:27017/music", function(err, db) {
  console.log("Connected");
  db.createCollection(
    'users',
    {
      'validator':{
        $and:[
          { username: { $type: "string" } },
          { displayname: { $type: "string" } },
          { email: { $regex: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i} }
        ]
      }
    }
  )
  .then((users) => users.remove({})).catch(err => { console.log(err); })// Suppression des anciens éléments pour n'avoir que 1000 users
  .then(() => db.collection('users').insert(users)).catch(err => { console.log(err); })
  .then(function(){
    console.log("Done");
    db.close();
  });
})
