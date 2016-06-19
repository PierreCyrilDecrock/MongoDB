'use strict'

const MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/music", function(err, db) {
  console.log("Connected");

  db.createCollection('notes');

  var User = db.collection('users');
  var Song = db.collection('songs');

  var nbUser = 0;

  User.find({}).forEach((user) => {

    var nbSongs = Math.floor(Math.random() * 11);// 11 pour avoir aussi le 10 dans les suggestions

    Song.aggregate([{$sample: {size: nbSongs}}, { $project : {_id: 0, title : 1 , artist : 1 } }]).toArray(function(err, favoriteSongs){
      if (err) { throw err; }

      for(var i=0; i < nbSongs; i++){
        db.collection('notes').insert({username: user.username, song: favoriteSongs[i], note: Math.floor((Math.random() * 5))});
      }
      nbUser++;
      if (nbUser === 1000) {
        console.log("Done");
        db.close();
      }
    });
  });
});

