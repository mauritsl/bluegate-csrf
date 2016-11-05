'use strict';

/**
 * @Route("GET /link")
 */
class LinkRoute {
  process(csrfToken) {
    return {
      href: `/link/action/${csrfToken}`
    };
  }
}

module.exports = LinkRoute;
