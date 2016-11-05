'use strict';

/**
 * @Route("POST /form")
 * @Post("name", type="string")
 * @Csrf(true)
 */
class FormPostRoute {
  process(name) {
    return {
      name
    };
  }
}

module.exports = FormPostRoute;
