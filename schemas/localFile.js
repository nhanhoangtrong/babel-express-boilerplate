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
    createdAt: {
        type: Number,
        index: true,
    },
    updatedAt: {
        type: Number,
        index: true,
    },
});

/**
 * Auto add createdAt field if document is first-time creating
 */
localFileSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    if (!this.createdAt) {
        this.createdAt = this.updatedAt;
    }
    next();
});

exports.localFileSchema = localFileSchema;
