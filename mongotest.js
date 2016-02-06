var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var ObjectID = require('mongodb').ObjectID;

MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if(err) throw err;

    var collection = db.collection('test_insert');
    collection.insert({a:2}, function(err, docs) {

        collection.count(function(err, count) {
            console.log(format("count = %s", count));
        });

        // Locate all the entries using find
        collection.find().toArray(function(err, results) {
            console.log(results.length);
            for (var i = 0; i < results.length -1; i++) {
                console.log(new ObjectID(results[i]._id));
                console.log(results[i]);
            }
            // Let's close the db
            db.close();
        });
    });
});

