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
            password: 'wwadmin2015',
            agency: 'New York Cares',
            acceptance: [{
                target: 'ALL',
                title: 'Acceptance',
                description: 'let agencies know that they have been accepted into this year\'s program',
                subject: 'Winter Wishes 2015 Acceptance',
                message: 'Dear {{partner}},\n\nCongratulations! Your agency has been accepted for {{letters}}.\n\nTo access your tracking form:\nGo to the <a href=\"http://localhost:3000/#!/\">Winter Wishes homepage</a>.\nUsername: {{user}}\nPassword: {{pass}}\n\nSincerely,\nThe Winter Wishes Team'
            }, {
                title: 'Reminder',
                description: 'let agencies know that the deadline is coming up',
                subject: 'Tracking Form is due in 1 week',
                message: 'Dear {{partner}},\n\nPlease keep in mind that tracking forms and letters must be submitted by October 5th.',
                target: 'NYS'
            }, {
                message: 'Thank your for participating in this year\'s Winter Wishes program! Oh,I almost forgot...',
                description: 'thank everyone for their participation in this year \'s program',
                title: 'Thanks',
                subject: 'Thank You!',
                target: 'None'
            }],
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