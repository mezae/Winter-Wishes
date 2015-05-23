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
        default: ''
    },
    description: {
        type: String,
        default: ''
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