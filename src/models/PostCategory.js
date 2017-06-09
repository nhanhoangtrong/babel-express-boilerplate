import mongoose, { Schema } from 'mongoose'

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
}, { strict: true })

/**
 * Finally, creating PostCategory model from defined schema and exporting as default
 */
export default mongoose.model('PostCategory', postCategorySchema)
