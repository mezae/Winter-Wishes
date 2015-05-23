'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    emails = require('../../app/controllers/emails.server.controller');

module.exports = function(app) {
    // Email Routes
    app.route('/emails')
        .get(users.hasAuthorization('admin'), emails.index)
        .post(users.hasAuthorization('admin'), emails.create);

    app.route('/emails/:emailId')
        .get(users.hasAuthorization('admin'), emails.read)
        .put(users.hasAuthorization('admin'), emails.update)
        .delete(users.hasAuthorization('admin'), emails.delete);

    // Finish by binding the article middleware
    app.param('emailId', emails.emailByID);
};