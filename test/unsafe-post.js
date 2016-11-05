'use strict';

/**
 * @Route("POST /unsafe")
 * @Post("name", type="string")
 */
class UnsafeRoute {
  process(name) {
    return {
      name
    };
  }
}

module.exports = UnsafeRoute;
