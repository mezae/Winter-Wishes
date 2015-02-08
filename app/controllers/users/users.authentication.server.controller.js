'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Article = mongoose.model('Article');

//Helps make all label numbers the same number of digits
function pad(num, size) {
	return ('00' + num).substr(-size); 
}

function trackExists(recs, newTrack) {
	return recs.filter(function (reco) {return reco.track === newTrack;}).length === 0;
}

function initRecs(code, types, recs) {
	for(var type in types) {
		for(var i=1; i<=types[type]; i++) {
			var newTrack = code + type + pad(i,3);
			if(trackExists(recs, newTrack)) {
				var letter = new Article();
				letter.track = newTrack;
				letter.save(function(err) {
					if(err) {
						console.log('letter not created');
					}
				});
			}
		}
	}
	console.log('Created letters for ' + code);
}

/**
 * Signup
 */
exports.signup = function(req, res) {
	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	// Init Variables
	var user = new User(req.body);
	var message = null;

	// Add missing user fields
	user.provider = 'local';
	user.displayName = user.agency;
	user.password = 'volunteer87';

	// Then save the user 
	user.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;
			initRecs(user.username, {'C': user.children, 'T': user.teens, 'S': user.seniors}, []);
			res.json(user);
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
			user.password = undefined;
			user.salt = undefined;

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