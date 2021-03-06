"use strict";

const AnnotationBase = require('bluegate-class').AnnotationBase;

class Csrf extends AnnotationBase {
  /**
   * Get required callbacks.
   */
  getCallbacks(routeClass) {
    var self = this;
    return {
      prevalidation: function(session, csrfToken, _csrfToken) {
        if (typeof session !== 'object') {
          throw Error('The CSRF module requires that you setup the session module.');
        }
        if (typeof this.body === 'object' && typeof this.body.csrfToken === 'string') {
          csrfToken = this.body.csrfToken;
        }
        if (typeof csrfToken === 'undefined') {
          throw new Error('CSRF token not found');
        }
        if (csrfToken !== _csrfToken) {
          throw new Error('CSRF token mismatch');
        }
      }
    };
  }
}

module.exports = Csrf;
