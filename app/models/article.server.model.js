'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ArticleSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	track: {
		type: String,
		default: ''
	},
	name: {
		type: String,
		default: ''
	},
	age: {
		type: Number,
		default: ''
	},
	gender: {
		type: String,
		default: ''
	},
	gift: {
		type: String,
		default: ''
	},
	flagged: {
		type: Boolean,
		default: false
	},
	received: {
		type: Boolean,
		default: false
	},
	updated: {
		type: Date,
		default: null
	}
});

mongoose.model('Article', ArticleSchema);