/* eslint-env node, mocha */
"use strict";

var Promise = require('bluebird');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;
var path = require('path');

var BlueGate = require('bluegate');
var Needle = Promise.promisifyAll(require('needle'), {multiArgs: true});

describe('BlueGate CSRF', function() {
  var app;
  var url = 'http://localhost:3000';

  before(function() {
    app = new BlueGate({
      log: false
    });
    require('bluegate-session')(app);
    require('bluegate-class')(app, {
      files: path.join(__dirname, '/test/**.js')
    });
    require('./bluegate-csrf.js')(app);
    return app.listen(3000);
  });

  after(function() {
    return app.close();
  });

  it('will not affect forms when annotation was not added', function() {
    var data = {name: 'Alice'};
    return Needle.postAsync(url + '/unsafe', data).then(function(response) {
      expect(response[0].statusCode).to.equal(200);
      expect(response[1]).to.have.property('name', 'Alice');
    });
  });

  it('will give the same token for all users when no session is active', function() {
    let token;
    return Needle.getAsync(url + '/form').then(function(response) {
      token = response[1].csrfToken;
      return Needle.getAsync(url + '/form');
    }).then(function(response) {
      expect(response[1].csrfToken).to.equal(token);
    });
  });

  it('will allow posting form with valid token - without session', function() {
    let token;
    return Needle.getAsync(url + '/form').then(function(response) {
      token = response[1].csrfToken;
      let data = {csrfToken: token, name: 'Bob'};
      return Needle.postAsync(url + '/form', data);
    }).then(function(response) {
      expect(response[0].statusCode).to.equal(200);
      expect(response[1]).to.have.property('name', 'Bob');
    });
  });

  it('will allow posting form with valid token - with session', function() {
    let token, cookies;
    return Needle.postAsync(url + '/login', {user: 'Chris'}, {parse_cookies: true}).then(function(response) {
      cookies = response[0].cookies;
      return Needle.getAsync(url + '/form', {cookies});
    }).then(function(response) {
      token = response[1].csrfToken;
      let data = {csrfToken: token, name: 'Bob'};
      return Needle.postAsync(url + '/form', data, {cookies});
    }).then(function(response) {
      expect(response[0].statusCode).to.equal(200);
      expect(response[1]).to.have.property('name', 'Bob');
    });
  });

  it('will deny posting form with invalid token - without session', function() {
    return Needle.getAsync(url + '/form').then(function(response) {
      let data = {csrfToken: 'invalid', name: 'Bob'};
      return Needle.postAsync(url + '/form', data);
    }).then(function(response) {
      expect(response[0].statusCode).to.equal(400);
    });
  });

  it('will deny posting form when token is missing - without session', function() {
    return Needle.getAsync(url + '/form').then(function(response) {
      let data = {name: 'Bob'};
      return Needle.postAsync(url + '/form', data);
    }).then(function(response) {
      expect(response[0].statusCode).to.equal(400);
    });
  });

  it('will deny posting form with invalid token - with session', function() {
    let cookies;
    return Needle.postAsync(url + '/login', {user: 'Chris'}, {parse_cookies: true}).then(function(response) {
      cookies = response[0].cookies;
      return Needle.getAsync(url + '/form', {cookies});
    }).then(function(response) {
      let data = {csrfToken: 'invalid', name: 'Bob'};
      return Needle.postAsync(url + '/form', data, {cookies});
    }).then(function(response) {
      expect(response[0].statusCode).to.equal(400);
    });
  });

  it('will deny posting form when token is missing - with session', function() {
    let cookies;
    return Needle.postAsync(url + '/login', {user: 'Chris'}, {parse_cookies: true}).then(function(response) {
      cookies = response[0].cookies;
      return Needle.getAsync(url + '/form', {cookies});
    }).then(function(response) {
      let data = {name: 'Bob'};
      return Needle.postAsync(url + '/form', data, {cookies});
    }).then(function(response) {
      expect(response[0].statusCode).to.equal(400);
    });
  });

  it('will allow GET with valid token - without session', function() {
    let token;
    return Needle.getAsync(url + '/link').then(function(response) {
      return Needle.getAsync(url + response[1].href);
    }).then(function(response) {
      expect(response[0].statusCode).to.equal(200);
    });
  });

  it('will allow GET with valid token - with session', function() {
    let token, cookies;
    return Needle.postAsync(url + '/login', {user: 'Chris'}, {parse_cookies: true}).then(function(response) {
      cookies = response[0].cookies;
      return Needle.getAsync(url + '/link', {cookies});
    }).then(function(response) {
      return Needle.getAsync(url + response[1].href, {cookies});
    }).then(function(response) {
      expect(response[0].statusCode).to.equal(200);
    });
  });

  it('will deny GET with invalid token - without session', function() {
    return Needle.getAsync(url + '/link').then(function(response) {
      return Needle.getAsync(url + response[1].href + 'a');
    }).then(function(response) {
      expect(response[0].statusCode).to.equal(400);
    });
  });

  it('will deny GET with invalid token - with session', function() {
    let cookies;
    return Needle.postAsync(url + '/login', {user: 'Chris'}, {parse_cookies: true}).then(function(response) {
      cookies = response[0].cookies;
      return Needle.getAsync(url + '/link', {cookies});
    }).then(function(response) {
      return Needle.getAsync(url + response[1].href + 'a', {cookies});
    }).then(function(response) {
      expect(response[0].statusCode).to.equal(400);
    });
  });

  it('will give an error when session is not loaded', function() {
    let error;
    let app = new BlueGate({
      log: false
    });
    app.error(function() { error = this.error; });
    require('./bluegate-csrf.js')(app);
    return app.listen(3001).then(() => {
      return Needle.getAsync('http://localhost:3001/link');
    }).then(function(response) {
      expect(response[0].statusCode).to.equal(400);
      expect(error instanceof Error).to.equal(true);
      expect(error.message).to.contain('session module');
      return app.close();
    });
  });
});
