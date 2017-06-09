import Post from '../models/Post'

export const getPostById = (postId) => {
    return Post.findById(postId).exec()
}

export const getPostBySlug = (postSlug) => {
    return Post.findOne({slug: postSlug}).exec()
}

export const getPostsByCategory = (catId, page, nPerPage) => {
    return Post.find({
        categories: catId,
    }).populate({
        path: 'author',
        select: 'firstName lastName',
        model: 'User',
    }).sort({
        publishedAt: -1
    }).select('-content -createdAt -updatedAt -isPublished')
    .skip(page * nPerPage)
    .limit(nPerPage)
    .exec()
}

export const getPostsByPage = (page, postsPerPage) => {
    return Post.find({})
        .populate({
            path: 'author',
            model: 'User',
            select: '_id firstName lastName',
        })
        .populate({
            path: 'categories',
            model: 'PostCategory',
            select: '_id name slug',
        })
        .sort({
            publishedAt: -1,
        })
        .skip(page * postsPerPage)
        .limit(postsPerPage)
        .exec()
}

export const postNewPost = (body) => {
    const newPost = new Post({
        title: body.title,
        description: body.description,
        slug: body.slug,
        isPublished: (body.isPublished || false),
        author: body.author,
        publishedAt: (body.publishedAt || Date.now()),
        content: body.content,
        categories: body.categories,
    })
    return newPost.save()
}

export const updatePost = (body) => {
    return Post.findById(body._id).exec()
        .then(function(post) {
            if (post) {
                post.title = body.title
                post.description = body.description
                post.slug = body.slug
                post.isPublished = (body.isPublished || false)
                post.author = body.author
                post.publishedAt = (body.publishedAt || Date.now())
                post.content = body.content
                post.categories = body.categories
                return post.save()
            }
            throw new Error('Could not find the post')
        })
}

export const removeCategoryFromPost = (catId) => {
    return Post.where({ categories: catId, })
        .update({
            $pull: {
                categories: catId,
            }
        }).exec()
}

export const removePost = (postId) => {
    return Post.findByIdAndRemove(postId).exec()
}

export const removePostByAuthor = (userId) => {
    return Post.remove({author: userId}).exec()
}
