'use strict';

module.exports = {
    db: 'mongodb://localhost/meanww-test',
    port: 3001,
    app: {
        title: 'Winter Wishes - Test Environment'
    },
    mailer: {
        from: 'The Winter Wishes Team <winterwishes@newyorkcares.org>',
        options: {
            service: process.env.MAILER_SERVICE_PROVIDER,
            auth: {
                user: process.env.MAILER_EMAIL_ID,
                pass: process.env.MAILER_PASSWORD
            }
        }
    }
};