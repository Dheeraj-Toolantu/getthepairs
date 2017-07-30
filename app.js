var express = require('express');
var http = require('http');
var server = http.createServer(function(req, res) {
		res.writeHead(200, { 'Content-Type': 'text/plain' });

var MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://ec2-52-14-217-22.us-east-2.compute.amazonaws.com:27017/getthepairs', function (err, db) {
    if (err) {
        throw err;
		res.end("sorry");
    } else {
        console.log("successfully connected to the database");
		res.end("successfully connected to the database");
    }
    db.close();
});

});
server.listen(4000);
