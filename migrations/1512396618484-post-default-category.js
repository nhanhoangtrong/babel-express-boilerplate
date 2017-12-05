'use strict';

const mongoose = require('mongoose');
const { postCategorySchema } = require('../schemas/post');

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
    PostCategory.deleteOne({ slug: 'uncategorized' }, next);
};
