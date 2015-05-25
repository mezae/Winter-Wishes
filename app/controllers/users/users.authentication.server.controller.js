'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller'),
    mongoose = require('mongoose'),
    passport = require('passport'),
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

/**
 * Signup
 */
exports.signup = function(req, res) {
    // For security measurement we remove the role from the req.body object
    delete req.body.role;

    // Init Variables
    var user = new User(req.body);
    var message = null;

    // Add missing user fields
    user.password = 'volunteer87';
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

            user.salt = undefined;
            user.password = undefined;
            user.provider = undefined;
            user.role = undefined;
            user.created = undefined;

            res.json(user);
        }
    });
};

exports.signups = function(req, res) {
    var content = req.body.file;
    var rows = content.split(/[\r\n|\n]+/);
    var headers = rows.shift().split(',');
    var code_col = headers.indexOf('Agency Code');
    var agency_col = headers.indexOf('Agency Name');
    var contact_col = headers.indexOf('Contact Name');
    var email_col = headers.indexOf('Contact E-mail');
    var child_col = headers.indexOf('Accepted Children');
    var teen_col = headers.indexOf('Accepted Teens');
    var seniors_col = headers.indexOf('Accepted Seniors');

    User.find({}, 'username -_id').exec(function(err, users) {
        if (err) {
            console.log('something went wrong');
        } else {
            var partners = _.pluck(users, 'username');

            _.forEach(rows, function(row) {
                var record = row.split(',');

                if (!_.includes(partners, record[code_col])) {
                    var newPartner = new User({
                        username: record[code_col],
                        agency: record[agency_col],
                        contact: record[contact_col],
                        email: record[email_col],
                        children: record[child_col] ? parseInt(record[child_col], 10) : 0,
                        teens: record[teen_col] ? parseInt(record[teen_col], 10) : 0,
                        seniors: record[seniors_col] ? parseInt(record[seniors_col], 10) : 0,
                        password: 'volunteer87'
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

            console.log(req.user);
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