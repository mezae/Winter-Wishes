'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Article = mongoose.model('Article'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, article;

/**
 * Article routes tests
 */
describe('Article CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'AAA',
			password: 'password'
		};

		// Create a new user
		user = new User({
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			children: 0, 
			teens: 0,
			seniors: 0,
			agency: 'A Better Chance',
			contact: 'Howard Ratero',
			provider: 'local'
		});

		// Save a user to the test db and create new article
		user.save(function() {
			article = new Article({
			track: 'ABCC001',
			name: 'Elmer Meza',
			age: 6,
			gender: 'M',
			gift: 'a patchwork elephant'
			});

			done();
		});
	});

	it('should be able to save an article if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new article
				agent.post('/articles')
					.send(article)
					.expect(200)
					.end(function(articleSaveErr, articleSaveRes) {
						// Handle article save error
						if (articleSaveErr) done(articleSaveErr);

						// Get a list of articles
						agent.get('/articles')
							.end(function(articlesGetErr, articlesGetRes) {
								// Handle article save error
								if (articlesGetErr) done(articlesGetErr);

								// Get articles list
								var articles = articlesGetRes.body;

								// Set assertions
								(articles[0].name).should.match('Elmer Meza');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save an article if not logged in', function(done) {
		agent.post('/articles')
			.send(article)
			.expect(401)
			.end(function(articleSaveErr, articleSaveRes) {
				// Call the assertion callback
				done(articleSaveErr);
			});
	});

	// it('should not be able to save an article if no title is provided', function(done) {
	// 	// Invalidate title field
	// 	article.title = '';

	// 	agent.post('/auth/signin')
	// 		.send(credentials)
	// 		.expect(200)
	// 		.end(function(signinErr, signinRes) {
	// 			// Handle signin error
	// 			if (signinErr) done(signinErr);

	// 			// Get the userId
	// 			var userId = user.id;

	// 			// Save a new article
	// 			agent.post('/articles')
	// 				.send(article)
	// 				.expect(400)
	// 				.end(function(articleSaveErr, articleSaveRes) {
	// 					// Set message assertion
	// 					(articleSaveRes.body.message).should.match('Title cannot be blank');
						
	// 					// Handle article save error
	// 					done(articleSaveErr);
	// 				});
	// 		});
	// });

	it('should be able to update an article if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new article
				agent.post('/articles')
					.send(article)
					.expect(200)
					.end(function(articleSaveErr, articleSaveRes) {
						// Handle article save error
						if (articleSaveErr) done(articleSaveErr);

						// Update article title
						article.name = 'Elmer Meza Nazario';

						// Update an existing article
						agent.put('/articles/' + articleSaveRes.body._id)
							.send(article)
							.expect(200)
							.end(function(articleUpdateErr, articleUpdateRes) {
								// Handle article update error
								if (articleUpdateErr) done(articleUpdateErr);

								// Set assertions
								(articleUpdateRes.body._id).should.equal(articleSaveRes.body._id);
								(articleUpdateRes.body.name).should.match('Elmer Meza Nazario');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to get a list of articles if not signed in', function(done) {
		// Create new article model instance
		var articleObj = new Article(article);

		// Save the article
		articleObj.save(function() {
			// Request articles
			request(app).get('/articles')
			.expect(401)
			.end(function(articleSaveErr, articleSaveRes) {
				// Call the assertion callback
				done(articleSaveErr);
				// .end(function(req, res) {
				// 	// Set assertion
				// 	res.body.should.be.an.Array.with.lengthOf(1);

				// 	// Call the assertion callback
				// 	done();
				});

		});
	});


	it('should not be able to get a single article if not signed in', function(done) {
		// Create new article model instance
		var articleObj = new Article(article);

		// Save the article
		articleObj.save(function() {
			request(app).get('/articles/' + articleObj._id)
				.expect(401)
				.end(function(articleSaveErr, articleSaveRes) {
					// Call the assertion callback
					done(articleSaveErr);
				// .end(function(req, res) {
				// 	// Set assertion
				// 	res.body.should.be.an.Object.with.property('title', article.title);

				// 	// Call the assertion callback
				// 	done();
				});
		});
	});

	it('should be able to delete an article if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new article
				agent.post('/articles')
					.send(article)
					.expect(200)
					.end(function(articleSaveErr, articleSaveRes) {
						// Handle article save error
						if (articleSaveErr) done(articleSaveErr);

						// Delete an existing article
						agent.delete('/articles/' + articleSaveRes.body._id)
							.send(article)
							.expect(200)
							.end(function(articleDeleteErr, articleDeleteRes) {
								// Handle article error error
								if (articleDeleteErr) done(articleDeleteErr);

								// Set assertions
								(articleDeleteRes.body.message).should.match('remaining tracking labels updated');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete an article if not signed in', function(done) {
		// Set article user 
		article.user = user;

		// Create new article model instance
		var articleObj = new Article(article);

		// Save the article
		articleObj.save(function() {
			// Try deleting article
			request(app).delete('/articles/' + articleObj._id)
			.expect(401)
			.end(function(articleDeleteErr, articleDeleteRes) {
				// Set message assertion
				(articleDeleteRes.body.message).should.match('User is not logged in');

				// Handle article error error
				done(articleDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Article.remove().exec();
		done();
	});
});