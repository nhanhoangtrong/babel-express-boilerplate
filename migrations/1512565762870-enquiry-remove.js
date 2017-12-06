'use strict';

const mongoose = require('mongoose');
const { enquirySchema } = require('../schemas/enquiry');

const Enquiry = mongoose.model('Enquiry', enquirySchema);

exports.up = function (next) {
    next();
};

exports.down = function (next) {
    Enquiry.remove({}, next);
};
