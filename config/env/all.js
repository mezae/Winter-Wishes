'use strict';

module.exports = {
    app: {
        title: 'Winter Wishes',
        description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
        keywords: 'MongoDB, Express, AngularJS, Node.js'
    },
    port: process.env.PORT || 3000,
    templateEngine: 'swig',
    sessionSecret: 'process.env.SESSION',
    sessionCollection: 'sessions',
    assets: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.css',
                'public/lib/textAngular/src/textAngular.css',
                'public/lib/font-awesome/css/font-awesome.css'
            ],
            js: [
                'public/lib/angular/angular.js',
                'public/lib/angular-resource/angular-resource.js',
                'public/lib/angular-cookies/angular-cookies.js',
                'public/lib/angular-animate/angular-animate.js',
                'public/lib/angular-touch/angular-touch.js',
                'public/lib/angular-sanitize/angular-sanitize.js',
                'public/lib/angular-ui-router/release/angular-ui-router.js',
                'public/lib/angular-ui-utils/ui-utils.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                'public/lib/d3/d3.js',
                'public/lib/lodash/lodash.js',
                'public/lib/angular-socket-io/socket.js',
                'public/lib/textAngular/dist/textAngular.min.js',
                'public/lib/textAngular/dist/textAngular-rangy.min.js',
                'public/lib/textAngular/dist/textAngular.min.js',
                'public/lib/textAngular/dist/textAngular-rangy.min.js',
                'public/lib/ng-file-upload/ng-file-upload.js',
                'public/lib/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
                'public/lib/lz-string/libs/lz-string.min.js'
            ]
        },
        css: [
            'public/modules/**/css/*.css'
        ],
        js: [
            'public/config.js',
            'public/application.js',
            'public/modules/*/*.js',
            'public/modules/*/*[!tests]*/*.js'
        ],
        tests: [
            'public/lib/angular-mocks/angular-mocks.js',
            'public/lib/socket.io-client/socket.io.js',
            'public/lib/angular-socket.io-mock/angular-socket.io-mock.js',
            'public/modules/*/tests/*.js'
        ]
    }
};