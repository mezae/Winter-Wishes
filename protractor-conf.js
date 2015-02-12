'use strict';

/**
 * Module dependencies.
 */
var applicationConfiguration = require('./config/config');

// conf.js
module.exports = function(config) {
	config.set({
  		seleniumAddress: 'http://localhost:8000/app',
  		specs: ['e2e/scenarios.js']
  	}
}