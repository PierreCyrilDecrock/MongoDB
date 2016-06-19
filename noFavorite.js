'use strict'

const MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/music", function(err, db) {
  console.log("Connected");

  var User = db.collection('users');

  User.find({"favoriteSongs": {$size: 0}},{ _id: 0, favoriteSongs: 0}).toArray(function(err, users){
    if (err) { throw err; }
    console.log(users);
    db.close();
  });

});
