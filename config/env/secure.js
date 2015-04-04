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
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js'
			]
		},
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'
	},
	mailer: {
		from: 'Elmer <mezae10@gmail.com>',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'Mailtrap',
	            	auth: {
	                	user: process.env.MAILER_EMAIL_ID || '328212ee68d2e7a2c@mailtrap.io',
	                	pass: process.env.MAILER_PASSWORD || '3c104d180787e1'
	            	}
		}
	}
};
