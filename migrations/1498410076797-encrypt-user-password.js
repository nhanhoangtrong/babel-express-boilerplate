'use strict'

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/express-boilerplate');
mongoose.Promise = Promise;
var User = require('../dist/models/User').default;
var usersCollection = mongoose.connection.collection('users');

exports.up = function(next) {
    User.remove().exec().then(function() {
        const admin = new User({
            firstName: 'Admin',
            lastName: 'Boss',
            email: 'admin@localhost',
            isAdmin: true,
            password: 'password'
        });
        admin.save(function() {
            console.log('hashedPassword', admin.hashedPassword);
            next();
        });
    });
};

exports.down = function(next) {
    User.remove().exec().then(function() {
        const admin = new User({
            firstName: 'Admin',
            lastName: 'Boss',
            email: 'admin@localhost',
            isAdmin: true,
            password: 'password'
        });
        admin.save(function() {
            next();
        });
    })
};
