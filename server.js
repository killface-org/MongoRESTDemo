//Import libraries
var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var util = require('util');

//Config
var httpListenPort = 8080;
var mongoServerUrl = 'mongodb://127.0.0.1:27017/test';

//Local global vars
var database = null;

//Setup Express
var httpServer = express();
httpServer.use(bodyParser.urlencoded({ extended: true }));
httpServer.use(bodyParser.json());

//Setup Express Router
var router = express.Router();

//Log all request
router.use(function(req, res, next) {
    console.log('%s request received on %s from %s',req.method,req.url,req.headers.host);
    if (database === null) {
        res.json({error:'Database not connected'});
        return;
    }
    next();
});

//Handle basic get request
router.get('/', function(req, res) {
    res.json({message:'Everything is working!'});
});

router.route('/things')
    //Insert a new document to the things collection
    .post(function(req, res) {
        var collection = database.collection('things');
        collection.insert(req.body, function(err, docs) {
            if (err) {
                res.json(err);
            } else {
                res.json(docs);
            }
        })
    })
    //Get a list of documents from the things collection (only gets the name property)
    .get(function(req, res) {
        var collection = database.collection('things');
        collection.find({},{'name':1}).toArray(function(err, results) {
            if (err) {
                res.json(err);
            } else {
                res.json(results);
            }
        });
    });

//This route handles working with specific documents by their ID
router.route('/things/:thing_id')
    //Get a specific document from the things collection.
    .get(function(req, res) {
        var collection = database.collection('things');
        //You will see this a lot, we have to convert the _id field in a mongoDB document to a ObjectID type in order
        //for mongo to use it.
        var objID = new ObjectID(req.params.thing_id);

        collection.find({'_id': objID}).toArray(function(err, result) {
            if (err) {
                res.json(err);
            } else {
                res.json(result);
            }
        });
    })
    //Update a document in the collection
    .put(function(req, res) {
        var collection = database.collection('things');
        var objID = new ObjectID(req.params.thing_id);

        collection.update({'_id': objID},{$set: req.body}, {w:1}, function(err) {
            if (err) {
                res.json(err);
            } else {
                res.json({message:'success'});
            }
        });
    })
    //Delete a document in the collection
    .delete(function(req, res) {
        var collection = database.collection('things');
        var objID = new ObjectID(req.params.thing_id);

        collection.deleteMany({'_id': objID}, {w:1}, function(err) {
            if (err) {
                res.json(err);
            } else {
                res.json({message:'success'});
            }
        });
    });

//Connect database
MongoClient.connect(mongoServerUrl, function(err, db) {
    if(err) throw err;
    console.log('Database connected');
    database = db;
});

//Start Express HTTP server
httpServer.use('/api',router);
httpServer.listen(httpListenPort);
console.log('Server started');





