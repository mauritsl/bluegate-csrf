'use strict';

/**
 * @Route("GET /link/action/<csrfToken:string>")
 * @Csrf(true)
 */
class LinkActionRoute {
  process() {
    return {};
  }
}

module.exports = LinkActionRoute;
