'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
    return (password && password.length > 6);
};

/**
 * User Schema
 */
var UserSchema = new Schema({
    email: {
        type: String,
        trim: true,
        required: 'Please fill in your email',
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    zip: {
        type: Number
    },
    username: {
        type: String,
        unique: 'username is already taken',
        required: 'Please fill in a username',
        trim: true
    },
    password: {
        type: String,
        validate: [validateLocalStrategyPassword, 'Password should be longer']
    },
    children: {
        type: Number,
        default: 0
    },
    teens: {
        type: Number,
        default: 0
    },
    seniors: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 0
    },
    rating: {
        type: Object,
        default: {
            overall: 0,
            content: 0,
            decoration: 0
        }
    },
    salt: {
        type: String
    },
    provider: {
        type: String,
        default: 'local'
    },
    role: {
        type: String,
        default: 'user'
    },
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    },
    /* For reset password */
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    agency: {
        type: String
    },
    contact: {
        type: String
    },
    due: {
        type: Date
    }
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
    if (this.password && this.password.length > 6 && this.password.length < 88) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
    } else {
        return password;
    }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password);
};

module.exports = mongoose.model('User', UserSchema);