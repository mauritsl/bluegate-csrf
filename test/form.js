'use strict';

/**
 * @Route("GET /form")
 */
class FormRoute {
  process(csrfToken) {
    return {
      csrfToken
    };
  }
}

module.exports = FormRoute;
