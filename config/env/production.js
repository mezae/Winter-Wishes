'use strict';

module.exports = {
	db: 'mongodb://nycares:volunteer87@ds031571.mongolab.com:31571/winterwishes',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.min.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
				'public/lib/c3/c3.min.css'
			],
			js: [
				'public/lib/angular/angular.min.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js', 
				'public/lib/angular-animate/angular-animate.js', 
				'public/lib/angular-touch/angular-touch.js', 
				'public/lib/angular-sanitize/angular-sanitize.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.min.js',
				'public/lib/angular-ui-utils/ui-utils.min.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
				'public/lib/d3/d3.min.js',
				'public/lib/c3/c3.min.js'
			]
		},
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'
	},
	mailer: {
		from: 'The Winter Wishes Team <mezae10@gmail.com>',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'Mailtrap.io',
			auth: {
				user: process.env.MAILER_EMAIL_ID || '328212ee68d2e7a2c@mailtrap.io',
				pass: process.env.MAILER_PASSWORD || '3c104d180787e1'
			}
		}
	}
};
