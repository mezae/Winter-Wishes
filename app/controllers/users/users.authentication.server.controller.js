'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    User = mongoose.model('User'),
    Letter = mongoose.model('Article');

function initRecs(code, types, recs) {
    for (var type in types) {
        _.forEach(_.range(1, types[type] + 1), function(num) {
            var letter = new Letter();
            letter.track = code + type + _.padLeft(num, 3, '0');
            letter.save(function(err) {
                if (err) {
                    console.log('letter not created');
                }
            });
        });
    }
    console.log('Created letters for ' + code);
}

exports.addAdmin = function(req, res) {
    // Init Variables
    var user = new User(req.body);
    var message = null;

    // Add missing user fields
    user.password = process.env.ADMIN_PW;
    user.role = 'admin';

    // Then save the user 
    user.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {

            user.salt = undefined;
            user.password = undefined;
            user.provider = undefined;
            user.created = undefined;

            res.json(user);
        }
    });
};

/**
 * Signup
 */
exports.signup = function(req, res) {
    // For security measurement we remove the role from the req.body object
    delete req.body.role;

    // Init Variables
    var user = new User(req.body);

    // Add missing user fields
    user.due = req.user.due;
    user.password = process.env.USER_PW;
    if (user.children === null) user.children = 0;
    if (user.teens === null) user.teens = 0;
    if (user.seniors === null) user.seniors = 0;

    // Then save the user 
    user.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            initRecs(user.username, {
                'C': user.children,
                'T': user.teens,
                'S': user.seniors
            }, []);

            res.json({
                message: user.username + '\'s tracking form created'
            });
        }
    });
};

exports.signups = function(req, res) {
    var rows = req.body.file;
    var headers = req.body.headers;

    User.find({}, 'username -_id').exec(function(err, users) {
        if (err) {
            console.log('something went wrong');
        } else {
            var partners = _.pluck(users, 'username');

            _.forEach(rows, function(row) {

                var record = row.split(',');

                if (!_.includes(partners, record[headers.code_col])) {
                    var newPartner = new User({
                        due: req.user.due,
                        username: record[headers.code_col],
                        agency: record[headers.agency_col],
                        contact: record[headers.contact_col],
                        email: record[headers.email_col],
                        children: record[headers.child_col] ? parseInt(record[headers.child_col], 10) : 0,
                        teens: record[headers.teen_col] ? parseInt(record[headers.teen_col], 10) : 0,
                        seniors: record[headers.seniors_col] ? parseInt(record[headers.seniors_col], 10) : 0,
                        password: process.env.USER_PW
                    });
                    newPartner.save(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            initRecs(newPartner.username, {
                                'C': newPartner.children,
                                'T': newPartner.teens,
                                'S': newPartner.seniors
                            }, []);
                        }
                    });
                    partners.push(newPartner.username);
                }

            });

            if (req.body.isLast) {
                var user = req.user;
                user.status = 1;
                user.updated = Date.now();

                user.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        user.provider = undefined;
                        user.created = undefined;
                        user.children = undefined;
                        user.teens = undefined;
                        user.seniors = undefined;
                        user.updated = undefined;
                        user.rating = undefined;
                        res.json(user);
                    }
                });
            } else {
                res.send(200);
            }
        }
    });
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err || !user) {
            res.status(400).send(info);
        } else {
            // Remove sensitive data before login
            user.provider = undefined;
            user.password = undefined;
            user.salt = undefined;
            user.rating = undefined;
            user.created = undefined;

            if (user.role === 'admin') {
                user.username = undefined;
                user.children = undefined;
                user.teens = undefined;
                user.seniors = undefined;
                user.updated = undefined;
            }

            req.login(user, function(err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.json(user);
                }
            });
        }
    })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};