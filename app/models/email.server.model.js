'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Email Schema
 */
var EmailSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        required: 'Please include a title for this template'
    },
    description: {
        type: String,
        required: 'Please include a short description'
    },
    target: {
        type: String,
        default: ''
    },
    subject: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        default: ''
    },
    updated: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Email', EmailSchema);