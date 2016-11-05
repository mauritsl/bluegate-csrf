"use strict";

const path = require('path');
const crypto = require('crypto');

const _ = require('lodash');


module.exports = function(app, options) {
  options = _.defaults(options, {
    files: path.join(process.cwd(), 'routes/**.js'),
    parameters: {}
  });

  // Register annotation.
  if (typeof app._class_annotations === 'undefined') {
    app._class_annotations = [];
  }
  app._class_annotations.push(path.join(__dirname, 'annotations/csrf.js'));

  // Register prevalidation hook.
  // This hook will calculate the CSRF token.
  app.prevalidation(function(session) {
    if (typeof session !== 'object') {
      throw Error('The CSRF module requires that you setup the session module.');
    }
    let token = '0';
    if (!session.empty()) {
      token = session.getId().substring(0, 6);
      // The session id is in base64 encoding. Replace characters that are not safe for use in URL's.
      token = token.split('+').join('-').split('/').join('_').split('=').join();
    }
    this.setParameter('_csrfToken', token);
  });

  // Copy the calculated _csrfToken to csrfToken. The latter was used for token input before.
  app.postvalidation(function(_csrfToken) {
    this.setParameter('csrfToken', _csrfToken);
  });
};
