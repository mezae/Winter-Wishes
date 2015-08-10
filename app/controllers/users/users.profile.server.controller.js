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
var fs = require('fs');
var pdf = require('html-pdf');
var azip = require('jszip');
var lz = require('lz-string');


exports.topdf = function(req, res) {
    var options = {
        filename: './pfpletter' + req.body.page + '.pdf',
        format: 'Letter',
        border: {
            top: '0.47in',
            right: '0in',
            bottom: '0in',
            left: '0in'
        }
    };

    res.render('templates/pfp-letter', {}, function(err, html) {
        html = html + lz.decompressFromEncodedURIComponent(req.body.content) + '</body></html>';
        pdf.create(html, options).toBuffer(function(err, buffer) {
            if (err) return console.log(err);
            res.send(buffer);
        });
    });

};

//Allows admin access to all community partner accounts
exports.list = function(req, res) {
    if (req.query.role || req.user.role === 'admin') {
        var query =
            req.query.role ? req.query : {
                role: 'user'
            };
        var offset = req.query.offset > 1 ? req.query.offset : '';
        var limit = req.query.limit ? req.query.limit : '';
        var select = req.query.role && req.user.role !== 'admin' ? 'due -_id' : '-salt -password -created -provider';
        var stream = User.find(query, select).skip(offset).limit(limit).sort('username').lean().stream();
        var first = true;
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.write('[');
        stream.on('data', function(doc) {
            if (first) {
                first = false;
                res.write(JSON.stringify(doc));
            } else {
                res.write(',' + JSON.stringify(doc));
            }
        });

        stream.on('close', function() {
            res.write(']');
        });
        stream.pipe(res);
    } else {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }
};

//Allows admin access to individual community partner accounts
exports.agencyByID = function(req, res, next, id) {
    var fields = '-salt -password -provider';
    User.findOne({
        username: id
    }, fields).exec(function(err, agency) {
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

                user.provider = undefined;
                user.created = undefined;
                user.password = undefined;
                user.salt = undefined;
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

exports.resetData = function(req, res) {
    var user = req.user;
    User.remove({
        'role': {
            $ne: 'admin'
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