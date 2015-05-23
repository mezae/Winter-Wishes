'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Email = mongoose.model('Email'),
    User = mongoose.model('User'),
    async = require('async'),
    _ = require('lodash');

/**
 * Create a email
 */
exports.create = function(req, res) {
    var email = new Email(req.body);

    email.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(email);
        }
    });
};

/**
 * Show the current email
 */
exports.read = function(req, res) {
    res.json(req.email);
};

/**
 * Update a email
 */
exports.update = function(req, res) {
    var email = req.email;

    email = _.assign(email, req.body);
    email.updated = email.name ? Date.now() : '';

    email.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(email);
        }
    });
};

/**
 * Delete an email
 */
exports.delete = function(req, res) {
    var email = req.email;

    email.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(email);
        }
    });
};

/**
 * List of Emails
 */
exports.index = function(req, res) {
    Email.find({}, 'title description').exec(function(err, emails) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(emails);
        }
    });
};

/**
 * Email middleware
 */
exports.emailByID = function(req, res, next, id) {
    Email.findOne({
        _id: id
    }, '-created').exec(function(err, email) {
        if (err) return next(err);
        if (!email) return next(new Error('Failed to load email ' + id));
        req.email = email;
        next();
    });
};