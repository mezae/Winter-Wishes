'use strict';

module.exports = {
    db: 'mongodb://nycares:volunteer87@ds031571.mongolab.com:31571/winterwishes',
    assets: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
                'public/lib/textAngular/src/textAngular.css',
                'public/lib/font-awesome/css/font-awesome.min.css'
            ],
            js: [
                'public/lib/angular/angular.min.js',
                'public/lib/angular-resource/angular-resource.min.js',
                'public/lib/angular-cookies/angular-cookies.min.js',
                'public/lib/angular-animate/angular-animate.min.js',
                'public/lib/angular-touch/angular-touch.min.js',
                'public/lib/angular-sanitize/angular-sanitize.min.js',
                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                'public/lib/angular-ui-utils/ui-utils.min.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                'public/lib/d3/d3.min.js',
                'public/lib/lodash/lodash.min.js',
                'public/lib/angular-socket-io/socket.min.js',
                'public/lib/textAngular/dist/textAngular.min.js',
                'public/lib/textAngular/dist/textAngular-rangy.min.js',
                'public/lib/ng-file-upload/ng-file-upload.min.js'
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