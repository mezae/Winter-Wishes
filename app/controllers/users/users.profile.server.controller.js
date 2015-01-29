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

exports.agencyByID = function(req, res, next, id) {
	User.findOne({_id: id}).exec(function(err, agency) {
		if (err) return next(err);
		if (!agency) return next(new Error('Failed to load article ' + id));
		req.user = agency;
		next();
	});
};

/**
 * Show the current article
 */
exports.read = function(req, res) {
	res.json(req.user);
};

exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	// Merge existing user
	user = _.extend(user, req.body);
	user.updated = Date.now();

	user.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			//Update letters collection if number accepted changed
			//var letters = Articles.query();
			//if($scope.article.children + $scope.article.teens + $scope.article.seniors > article.letters.length) {
			//	article.letters = initRecs($scope.article.username, {'C': $scope.article.children, 'T': $scope.article.teens, 'S': $scope.article.seniors}, letters);
			//}
			res.json(user);
		}
	});
};

/**
 * Delete an article
 */
exports.delete = function(req, res) {
	var user = req.user;
	if(user.username !== 'AAA') {
		user.remove(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				Article.find({'track': { $regex: user.username + '...' }}).exec(function(error, letters) {
					if (error) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(error)
						});
					} else {
						for(var i=0; i < letters.length; i++) {
							letters[i].remove(function(err) {
								if (err) {
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								} else {
									res.json(letters[i]);
								}
							});
						}
					}
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


/*
/**
 * Update user details
 *
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};*/

/**
 * Send User
 */
exports.me = function(req, res) {
	res.json(req.user || null);
};