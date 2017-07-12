'use strict'

const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.up = function(next) {
    const admin = new User({
        firstName: 'Admin',
        lastName: 'Boss',
        email: 'admin@localhost',
        isAdmin: true,
        password: 'password',
    });
    admin.save(function() {
        next();
    });
};

exports.down = function(next) {
    User.remove({email: 'admin@localhost'}).exec().then(function() {
        next();
    });
};
