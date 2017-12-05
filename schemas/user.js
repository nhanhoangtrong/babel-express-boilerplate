const crypto = require('crypto');

const { Schema } = require('mongoose');

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
    hashedPassword: {
        type: String,
        default: '',
    },
    salt: {
        type: String,
        default: '',
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
}, { strict: true });

/**
 * Before saving a new user, we need to create and update date-time fields
 */
userSchema.pre('save', function (next) {
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
 * Authenticate by checking the hashed password and candidate password
 *
 * @param {String} candidatePassword
 * @return {Boolean}
 */
userSchema.methods.authenticate = function (candidatePassword) {
    return this.encryptPassword(candidatePassword) === this.hashedPassword;
};

/**
 * Create password salt
 *
 * @return {String}
 */
userSchema.methods.makeSalt = function () {
    return Math.round(Date.now() * Math.random()) + '';
};

/**
 * Encrypt password
 *
 * @param {String} password
 * @return {String}
 */
userSchema.methods.encryptPassword = function (password) {
    if (!password) {
        return '';
    }
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

userSchema.virtual('password').set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
}).get(function () {
    return this._password;
});

/**
 * Adding a new function to User schema to request user's administrator rule
 */
userSchema.methods.checkAdmin = function () {
    return this.isAdmin;
};

/**
 * Adding a new function to User schema to compare password
 */
userSchema.methods.comparePassword = function (candidatePassword, cb) {
    if (this.encryptPassword(candidatePassword) === this.hashedPassword) {
        return cb(null, true);
    }
    return cb(null, false);
};

/**
 * Finally, export userSchema
 */
exports.userSchema = userSchema;
