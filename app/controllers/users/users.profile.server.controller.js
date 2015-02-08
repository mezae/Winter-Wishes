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
	User.find().exec(function(err, users) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			for(var i=0; i < users.length; i++) {
				// Remove sensitive data before login
				users[i].password = undefined;
				users[i].salt = undefined;
				users[i].acceptance = undefined;
				users[i].roles = undefined;
			}
			res.json(users);
		}
	});
};

//Allows admin access to individual community partner accounts
exports.agencyByID = function(req, res, next, id) {
	User.findOne({_id: id}).exec(function(err, agency) {
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

//Helps make all label numbers the same number of digits
function pad(num, size) {
	return ('00' + num).substr(-size); 
}

//Make changes to the letters collection that the user requested; 
//delete extras if accepted number of letters decreased
//make new letter records otherwise
function updateRecords(code, types, recs) {
	for(var type in types) {
		var letters = _.filter(recs, function(reco) { return reco.track.indexOf(code + type) > -1; });
		var numAccepted = types[type];

		if(numAccepted < letters.length) {
			var extras = _.pluck(letters.slice(numAccepted), 'track');
			Article.remove({track: {$in: extras}}, function() {
				console.log('Deleted extra records');
			});
		}
		else if(numAccepted > letters.length) {
			for(var i=1; i<=numAccepted; i++) {
				var newTrack = code + type + pad(i,3);
				if(_.filter(letters, function(reco) { return reco.track === newTrack; }).length === 0) {
					var letter = new Article({track: newTrack});
					letter.save(function(err) {
						if(err) {
							console.log('Failed to create a letter. Stopping...');
							return;
						}
					});
				}
			}
			console.log('Created new records, avoided duplicates');
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
	delete req.body.roles;

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
			Article.find({'track': { $regex: '^' + user.username}}).sort('track').exec(function(err, letters) {
				updateRecords(user.username, {'C': user.children, 'T': user.teens, 'S': user.seniors}, letters);
				res.json(user);
			});
		}
	});
};

//Delete a community partner's account, including all associated letters
exports.delete = function(req, res) {
	var user = req.user;
	if(user.username !== 'AAA') {
		user.remove(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				Article.remove({'track': { $regex: '^' + user.username }}, function() {
					console.log('Deleted all of ' + user.agency + '\'s letters');
				});
				res.json(user);
			}
		});
	}
	else {
		return res.status(400).send({
			message: req.body
		});
	}
};

//Send User
exports.me = function(req, res) {
	res.json(req.user || null);
};