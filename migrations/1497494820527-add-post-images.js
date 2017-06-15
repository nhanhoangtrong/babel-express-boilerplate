'use strict'

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/express-boilerplate');
var connection = mongoose.connection;
var postsCollection = connection.collection('posts');

exports.up = function(next) {
    postsCollection.update({}, {
        $set: {
            image: '/static/home/images/pic01.jpg',
        }
    });
    next();
};

exports.down = function(next) {
    postsCollection.update({}, {
        $unset: {
            image: '',
        }
    });
    next();
};
