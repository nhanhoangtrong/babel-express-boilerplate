import mongoose, { Schema } from 'mongoose'

/**
 * Defining User schema includes some required fields
 */
const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    createdAt: Number,
    updatedAt: {
        type: Number,
        index: true,
    },
}, { strict: true })

/**
 * Before saving a new user, we need to create and update date-time fields
 */
userSchema.pre('save', function(next) {
    // Set the updated field to current time
    this.updatedAt = Date.now()

    // Check if this saving is creating a new user or updating a new user
    if (!this.createdAt) {
        // Set the created field to current time
        this.createdAt = this.updatedAt
    }
    // Perform next action
    next()
})

/**
 * Adding a new function to User schema to request user's administrator rule
 */
userSchema.methods.checkAdmin = function() {
    return this.isAdmin
}

/**
 * Adding a new function to User schema to compare password
 */
userSchema.methods.comparePassword = function(candidatePassword, cb) {
    if (candidatePassword == this.password) {
        return cb(null, true)
    }
    return cb(null, false)
}

/**
 * Finally, creating User model from defined schema and exporting as default
 */
export default mongoose.model('User', userSchema)
