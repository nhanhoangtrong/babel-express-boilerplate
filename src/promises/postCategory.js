import PostCategory from '../models/PostCategory'

export const getPostCategoryById = (catId) => {
    return PostCategory.findById(catId).exec()
}

export const getPostCategoryBySlug = (catSlug) => {
    return PostCategory.findOne({slug: catSlug}).exec()
}

export const getAllPostCategories = () => {
    return PostCategory.find().exec()
}

export const postNewPostCategory = (body) => {
    const newPostCategory = new PostCategory({
        name: body.name,
        description: body.description,
        slug: body.slug,
    })
    return newPostCategory.save()
}

export const updatePostCategory = (body) => {
    return PostCategory.findById(body._id)
        .exec()
        .then(function(postCategory) {
            if (postCategory) {
                postCategory.name = body.name
                postCategory.description = body.description
                postCategory.slug = body.slug
                return postCategory.save()
            }
            return postCategory
        })
}

export const removePostCategory = (catId) => {
    return PostCategory.findByIdAndRemove(catId).exec()
}
