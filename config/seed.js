/**
 * Populate DB with seed data on server start if admin account does not exist
 */

'use strict';

var chalk = require('chalk');
var User = require('../app/models/user.server.model.js');
var Letters = require('../app/models/article.server.model.js');

User.count({
    'username': 'AAA'
}, function(err, exists) {
    if (!exists) {
        User.create({
            provider: 'local',
            role: 'admin',
            username: 'AAA',
            email: 'meza.elmer@gmail.com',
            password: process.env.ADMIN_PW,
            agency: 'New York Cares',
            contact: 'Elmer Meza',

        }, {
            provider: 'local',
            username: 'WWT',
            email: 'meza.elmer@test.com',
            password: 'demo2015',
            children: 5,
            teens: 0,
            seniors: 0,
            contact: 'Elmer Meza',
            agency: 'Winter Wishes Team'

        }, function() {
            Letters.find({}, function() {
                Letters.create({
                    track: 'WWTC001'
                }, {
                    track: 'WWTC002'
                }, {
                    track: 'WWTC003'
                }, {
                    track: 'WWTC004'
                }, {
                    track: 'WWTC005'
                });
                console.log(chalk.green('Finished populating DB with seed data'));
            });

        });
    }
});