const { Schema } = require('mongoose');

const enquirySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: String,
    content: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

enquirySchema.index({ createdAt: -1 });

exports.enquirySchema = enquirySchema;
