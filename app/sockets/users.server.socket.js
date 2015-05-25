/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var users = require('../models/user.server.model');

exports.register = function(socket) {
    users.schema.post('save', function(doc) {
        onSave(socket, doc);
    });
    users.schema.post('remove', function(doc) {
        onRemove(socket, doc);
    });
};

function onSave(socket, doc, cb) {
    socket.emit('users:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('users:remove', doc);
}