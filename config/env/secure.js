'use strict';

module.exports = {
    port: 443,
    db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://localhost/meanww',
    assets: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
            ],
            js: [
                'public/lib/angular/angular.min.js',
                'public/lib/angular-resource/angular-resource.min.js',
                'public/lib/angular-animate/angular-animate.min.js',
                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                'public/lib/angular-ui-utils/ui-utils.min.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                'public/lib/textAngular/dist/textAngular.min.js',
                'public/lib/textAngular/dist/textAngular-rangy.min.js'
            ]
        },
        css: 'public/dist/application.min.css',
        js: 'public/dist/application.min.js'
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