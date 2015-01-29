'use strict';

module.exports = {
	db: 'mongodb://localhost/meanww-test',
	port: 3001,
	app: {
		title: 'meanww - Test Environment'
	},
	mailer: {
		from: 'Elmer <mezae10@gmail.com>',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'Mailtrap.io',
			auth: {
				user: process.env.MAILER_EMAIL_ID || '328212ee68d2e7a2c@mailtrap.io',
				pass: process.env.MAILER_PASSWORD || '3c104d180787e1'
			}
		}
	}
};
