'use strict';

module.exports = {
	db: 'mongodb://localhost/meanww-test',
	port: 3001,
	app: {
		title: 'Winter Wishes - Test Environment'
	},
	mailer: {
		from: 'Elmer <mezae10@gmail.com>',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'Mailtrap',
	            	auth: {
	                	user: '328212ee68d2e7a2c@mailtrap.io',
	                	pass: '3c104d180787e1'
	            	}
		}
	}
};
