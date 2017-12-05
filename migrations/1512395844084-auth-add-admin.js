'use strict';

const mongoose = require('mongoose');
const { userSchema } = require('../schemas/user');

const User = mongoose.model('User', userSchema);

exports.up = function (next) {
    User.create({
        firstName: 'Admin',
        lastName: 'Boss',
        email: 'admin@localhost',
        isAdmin: true,
        password: 'password',
    }, next);
};

exports.down = function (next) {
    User.deleteMany({}, next);
};
