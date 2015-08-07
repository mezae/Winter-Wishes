'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
    // User Routes
    var users = require('../../app/controllers/users.server.controller');

    // Setting up the users profile api
    app.route('/users/me').get(users.me);
    app.route('/users').put(users.update);
    app.route('/users/reset').get(users.hasAuthorization('admin'), users.resetData);

    app.route('/agency').get(users.requiresLogin, users.list);

    app.route('/agency/:agencyId')
        .get(users.requiresLogin, users.read)
        .put(users.update)
        .delete(users.delete);

    app.route('/users/pdf')
        .post(users.requiresLogin, users.topdf);

    // Setting up the users password api
    app.route('/users/password').post(users.changePassword);
    app.route('/auth/forgot').post(users.forgot);
    app.route('/auth/reset/:token').get(users.validateResetToken);
    app.route('/auth/reset/:token').post(users.reset);

    // Setting up the users authentication api
    app.route('/auth/newadmin').post(users.hasAuthorization('admin'), users.addAdmin);
    app.route('/auth/signup').post(users.hasAuthorization('admin'), users.signup);
    app.route('/auth/signups').post(users.hasAuthorization('admin'), users.signups);
    app.route('/auth/signin').post(users.signin);
    app.route('/auth/signout').get(users.signout);

    app.route('/accept').post(users.hasAuthorization('admin'), users.sendAcceptance);

    // Finish by binding the user middleware
    app.param('agencyId', users.agencyByID);
    app.param('userId', users.userByID);

};