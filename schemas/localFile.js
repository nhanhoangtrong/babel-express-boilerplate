const { Schema, SchemaTypes } = require('mongoose');

const localFileSchema = new Schema({
    // filename on disk
    filename: {
        type: String,
        required: true,
    },
    // File type as an extension
    filetype: {
        type: String,
        required: true,
        index: true,
    },
    // File size as bytes on disk
    filesize: {
        type: Number,
        required: true,
        index: true,
    },
    // Path to file
    path: {
        type: String,
        required: true,
    },
    // Uploaded author
    author: {
        type: SchemaTypes.ObjectId,
        ref: 'User',
        index: true,
    },
}, { strict: true, timestamps: true });

localFileSchema.index({
    createdAt: -1,
    updatedAt: -1,
});

exports.localFileSchema = localFileSchema;
