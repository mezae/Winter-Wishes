'use strict';

module.exports = {
    db: 'mongodb://localhost/meanww-dev',
    app: {
        title: 'Winter Wishes - Development Environment'
    },
    mailer: {
        from: 'The Winter Wishes Team <mezae10@gmail.com>',
        options: {
            service: process.env.MAILER_SERVICE_PROVIDER || 'Mailtrap',
            auth: {
                user: process.env.MAILER_EMAIL_ID || '328212ee68d2e7a2c@mailtrap.io',
                pass: process.env.MAILER_PASSWORD || '3c104d180787e1'
            }
        }
    }
};