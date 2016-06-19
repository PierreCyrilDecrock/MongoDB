'use strict'

const MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/music", function(err, db) {
  console.log("Connected");

  var User = db.collection('users');
  var Song = db.collection('songs');

  var nbUser = 0;

  User.find({}).forEach((user) => {

    var nbFavoriteSongs = Math.floor(Math.random() * 11);// 11 pour avoir aussi le 10 dans les suggestions

    console.log(nbFavoriteSongs)

    Song.aggregate([{$sample: {size: nbFavoriteSongs}}, { $project : {_id: 0, title : 1 , artist : 1 } }]).toArray(function(err, favoriteSongs){
      if (err) { throw err; }

      User.update({"_id": user._id}, {$set: {favoriteSongs: favoriteSongs}}, function(err, result){
        if (err) { throw err; }
        nbUser++;

        if (nbUser === 1000) {
          console.log("Done");
          db.close();
        }
      });
    });

  });
});

