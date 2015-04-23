'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller.js'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User'),
    Article = mongoose.model('Article');

//Allows admin access to all community partner accounts
exports.list = function(req, res) {
    User.find({}, '-salt -password -acceptance -created -provider -roles').exec(function(err, users) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(users);
        }
    });
};

//Allows admin access to individual community partner accounts
exports.agencyByID = function(req, res, next, id) {
    User.findOne({
        username: id
    }, '-salt -password -created -provider').exec(function(err, agency) {
        if (err) return next(err);
        if (!agency) return next(new Error('Failed to load article ' + id));
        req.user = agency;
        next();
    });
};

//Shows admin selected community partner account
exports.read = function(req, res) {
    res.json(req.user);
};


//delete extra letters if number of accepted letters has decreased
function deleteExtras(letters, newTotal) {
    var extras = _.pluck(letters.slice(newTotal), 'track');
    Article.remove({
        track: {
            $in: extras
        }
    }, function() {
        console.log('Deleted extra records');
    });
}

//creates new letters if number of accepted letters has increased
function createNewAdditions(oldTotal, newTotal, label) {
    _.forEach(_.range(oldTotal + 1, newTotal + 1), function(num) {
        var letter = new Article();
        letter.track = label + _.padLeft(num, 3, '0');
        letter.save(function(err) {
            if (err) {
                console.log(err, 'Failed to create a letter. Stopping...');
                return;
            }
        });
    });
    console.log('Created new records, avoided duplicates');
}

//Make changes to the letters collection that the user requested; 
//delete extras if accepted number of letters decreased
//make new letter records otherwise
function updateRecords(code, types, recs) {
    for (var type in types) {
        var letters = _.filter(recs, function(reco) {
            return _.includes(reco.track, code + type);
        });
        var numAccepted = types[type];
        var numLetters = letters.length;

        if (numAccepted < numLetters) {
            deleteExtras(letters, numAccepted);
        } else if (numAccepted > numLetters) {
            createNewAdditions(numLetters, numAccepted, code + type);
        }
    }
}

//Allows admin to update a community partner account;
//Allows community partner to update their profile info
exports.update = function(req, res) {
    // Init Variables
    var user = req.user;
    var message = null;

    // For security measurement we remove the roles from the req.body object
    delete req.body.role;

    // Merge existing user
    user = _.assign(user, req.body);
    user.updated = Date.now();

    user.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            //Update letters collection if number accepted changed
            Article.find({
                'track': {
                    $regex: '^' + user.username
                }
            }).sort('track').exec(function(err, letters) {
                updateRecords(user.username, {
                    'C': user.children,
                    'T': user.teens,
                    'S': user.seniors
                }, letters);
                res.json(user);
            });
        }
    });
};

//Delete a community partner's account, including all associated letters
exports.delete = function(req, res) {
    var user = req.user;
    if (user.username !== 'AAA') {
        user.remove(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                Article.remove({
                    'track': {
                        $regex: '^' + user.username
                    }
                }, function() {
                    console.log('Deleted all of ' + user.agency + '\'s letters');
                });
                res.json(user);
            }
        });
    } else {
        return res.status(400).send({
            message: req.body
        });
    }
};

//Send User
exports.me = function(req, res) {
    res.json(req.user || null);
};

exports.reset = function(req, res) {
    var user = req.user;
    User.remove({
        'username': {
            $ne: 'AAA'
        }
    }, function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            Article.remove({}, function() {
                console.log('Deleted all letters');
            });
            res.json(user);
        }
    });
};