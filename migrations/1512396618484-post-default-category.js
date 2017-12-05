'use strict';

const mongoose = require('mongoose');
const { postCategorySchema, postSchema } = require('../schemas/post');

const Post = mongoose.model('Post', postSchema);
const PostCategory = mongoose.model('PostCategory', postCategorySchema);

exports.up = function (next) {
    PostCategory.create({
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'This is the default category when creating a new post.',
        default: true,
    }, next);
};

exports.down = function (next) {
    PostCategory.deleteMany({}, () => {
        Post.deleteMany({}, next);
    });
};
