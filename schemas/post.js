const { Schema, SchemaTypes } = require('mongoose');

/**
 * Defining the PostCategory schema
 */
const postCategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    description: String,
    default: {
        type: Boolean,
        default: false,
    },
}, { strict: true });

/**
 * Defining Post schema
 */
const postSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
        default: '/static/home/images/pic13.jpg',
    },
    description: String,
    author: {
        type: SchemaTypes.ObjectId,
        required: true,
        index: true,
        ref: 'User',
    },
    content: String,
    createdAt: Number,
    updatedAt: {
        type: Number,
        index: true,
    },
    publishedAt: Number,
    isPublished: {
        type: Boolean,
        default: false,
        index: true,
    },
    categories: [
        {
            type: SchemaTypes.ObjectId,
            ref: 'PostCategory',
            index: true,
        }
    ],
}, { strict: true });

/**
 * Before saving a new post, we need to create and update date-time fields
 */
postSchema.pre('save', function (next) {
    // Set the updated field to current time
    this.updatedAt = Date.now();

    // Check if this saving is creating a new user or updating a new user
    if (!this.createdAt) {
        // Set the created field to current time
        this.createdAt = this.updatedAt;
    }
    // Perform next action
    next();
});

/**
 * Telling post model to indexing the fields
 */
postSchema.index({ updatedAt: -1, publishedAt: -1 });

/**
 * Finally, creating Post model from defined schema and exporting as default
 */
exports.postSchema = postSchema;

/**
 * Finally, creating PostCategory model from defined schema and exporting as default
 */
exports.postCategorySchema = postCategorySchema;
