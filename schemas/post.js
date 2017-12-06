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
    publishedAt: {
        type: Date,
        default: () => new Date(),
    },
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
}, { strict: true, timestamps: true });

postSchema.pre('remove', function (next) {
    if (!this.default) {
        return next();
    }
    const err = new Error('Cannot remove default category.');
    return next(err);
});

/**
 * Telling post model to indexing the fields
 */
postSchema.index({
    createdAt: -1,
    updatedAt: -1,
    publishedAt: -1,
});

/**
 * Finally, creating Post model from defined schema and exporting as default
 */
exports.postSchema = postSchema;

/**
 * Finally, creating PostCategory model from defined schema and exporting as default
 */
exports.postCategorySchema = postCategorySchema;
