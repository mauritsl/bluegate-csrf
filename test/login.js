'use strict';

/**
 * @Route("POST /login")
 * @Post("name", type="string")
 */
class LoginRoute {
  process(session, name) {
    session.set('user', {name});
    return {};
  }
}

module.exports = LoginRoute;
