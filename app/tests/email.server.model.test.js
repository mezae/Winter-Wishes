'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    Email = mongoose.model('Email');

/**
 * Globals
 */
var email;

/**
 * Unit tests
 */
describe('Email Model Unit Tests:', function() {
    before(function(done) {
        email = new Email({
            title: 'Acceptance',
            description: 'let agencies know they have been accepted',
        });
        done();
    });

    describe('Method Save', function() {
        it('should begin with no emails', function(done) {
            Email.find({}, function(err, emails) {
                emails.should.have.length(0);
                done();
            });
        });

        it('should be able to save without problems', function(done) {
            email.save(done);
        });

        it('should fail to save without a title', function(done) {
            email.title = '';
            return email.save(function(err) {
                should.exist(err);
                done();
            });
        });

        it('should fail to save without a description', function(done) {
            email.title = 'Acceptance';
            email.description = '';
            return email.save(function(err) {
                should.exist(err);
                done();
            });
        });
    });

    after(function(done) {
        Email.remove().exec();
        done();
    });
});