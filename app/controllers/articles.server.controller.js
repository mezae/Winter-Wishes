'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Letter = mongoose.model('Article'),
    User = mongoose.model('User'),
    async = require('async'),
    _ = require('lodash');

/**
 * Create a article
 */
exports.create = function(req, res) {
    var article = new Letter(req.body);
    var user = article.track.substring(0, 4);
    var index = Number(article.track.substring(4));

    Letter.find({
        'track': {
            $regex: '^' + user
        }
    }, '-created').sort('track').exec(function(err, letters) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            _.forEach(_.range(index - 1, letters.length), function(num) {
                letters[num].track = user + _.padLeft(num + 2, 3, '0');
                letters[num].save(function(err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    }
                });
            });
            article.save(function(err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.json(article);
                }
            });
        }
    });
};

/**
 * Show the current article
 */
exports.read = function(req, res) {
    res.json(req.article);
};

/**
 * Update a article
 */
exports.update = function(req, res) {
    var article = req.article;

    article = _.assign(article, req.body);
    article.updated = article.name ? Date.now() : '';

    article.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(article);
        }
    });
};

/**
 * Delete an article
 */
exports.delete = function(req, res) {
    var article = req.article;
    var user = article.track.substring(0, 4);
    var index = Number(article.track.substring(4));

    article.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            Letter.find({
                'track': {
                    $regex: '^' + user
                }
            }).sort('track').exec(function(err, letters) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    _.forEach(_.range(index - 1, letters.length), function(num) {
                        letters[num].track = user + _.padLeft(num + 1, 3, '0');
                        letters[num].save(function(err) {
                            if (err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            }
                        });
                    });
                }
            });
            return res.status(200).send({
                message: 'remaining tracking labels updated'
            });
        }
    });
};

/**
 * List of Letters
 */
exports.index = function(req, res) {
    if (req.query.start) {
        User.find({
            'status': 5,
            'updated': {
                $gte: new Date(req.query.start).setHours(0),
                $lt: new Date(req.query.end).setHours(24)
            }
        }).exec(function(err, users) {
            var reviewed = _.pluck(users, 'username');
            reviewed = _.map(reviewed, function(u) {
                return new RegExp('^' + u, 'i');
            });
            var query = {
                'track': {
                    $in: reviewed
                },
                'name': {
                    $ne: ''
                }
            };

            Letter.find(query, '-__v -_id -created -updated').sort('track').exec(function(err, letters) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.json(letters);
                }
            });
        });
    } else {
        var fields = req.user.role === 'admin' ? '-created' : '-created -flagged';
        var query = req.query;
        if (req.query !== {}) {
            query = req.query.username ? {
                'track': {
                    $regex: '^' + req.query.username
                }
            } : {
                updated: {
                    $ne: ''
                }
            };
        }

        var offset = req.query.offset ? req.query.offset : '';
        var limit = req.query.limit ? req.query.limit : '';

        Letter.find(query, fields).sort('track').skip(offset).limit(limit).exec(function(err, letters) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(letters);
            }
        });
    }
};

/**
 * Letter middleware
 */
exports.articleByID = function(req, res, next, id) {
    Letter.findOne({
        _id: id
    }, '-created').exec(function(err, article) {
        if (err) return next(err);
        if (!article) return next(new Error('Failed to load article ' + id));
        req.article = article;
        next();
    });
};