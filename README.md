BlueGate CSRF
==================

[![Build Status](https://travis-ci.org/mauritsl/bluegate-csrf.svg?branch=master)](https://travis-ci.org/mauritsl/bluegate-csrf)
[![Coverage Status](https://coveralls.io/repos/github/mauritsl/bluegate-csrf/badge.svg?branch=master)](https://coveralls.io/github/mauritsl/bluegate-csrf?branch=master)
[![Dependency Status](https://david-dm.org/mauritsl/bluegate-csrf.svg)](https://david-dm.org/mauritsl/bluegate)
[![Known Vulnerabilities](https://snyk.io/test/github/mauritsl/bluegate-csrf/badge.svg)](https://snyk.io/test/github/mauritsl/bluegate-csrf)

Add CSRF protection to forms and links.
This module requires writing routes using ES6 classes with the
[BlueGate class](https://www.npmjs.com/package/bluegate-class) module and
requires sessions using
[BlueGate session](https://www.npmjs.com/package/bluegate-session).

This module can protect forms and links against CSRF-attacks. The protection is
only active for users with a session (i.e. authenticated users). Visitors without
a session are not protected for performance reasons, because that will conflict
with any form of page caching.
The CSRF-token is based on the session id, but does not include the whole
session id to avoid leaking it.
See the
[OWASP site](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_%28CSRF%29)
for more information about CSRF.

## Installation

Install using ``npm install bluegate-csrf bluegate-class bluegate-session``

## Quick example

Load the module in the main application file.

```javascript
var BlueGate = require('bluegate');
var app = new BlueGate();
app.listen(8080);

require('bluegate-class')(app);
require('bluegate-session')(app);
require('bluegate-csrf')(app);
```

Add a hidden element named ``csrfToken`` with the token retrieved from the function paramaters.
```javascript
/**
 * @Route("GET /form")
 */
module.exports = class FormRoute {
  process(csrfToken) {
    return '<html>'
      + '<form action="/form">'
      + '<input type="hidden" name="csrfToken" value="' + csrfToken + '" />'
      + '<input type="submit" />'
      + '</form>'
      + '</html>';
  }
}
```

And add the Csrf-annotation in the POST route:
```javascript
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
```

The form is now protected against CSRF-attacks when the user has a session.
An error is thrown in the ``prevalidation`` hook when the token is missing or invalid.

## Protection of links

You should consider CSRF protection for links that can perform harmful actions.

```javascript
/**
 * @Route("GET /link")
 */
class LinkRoute {
  process(csrfToken) {
    return `<a href="/link/action/${csrfToken}">do something</a>`;
  }
}
```

The route for the linked page needs to have the Csrf-annotation and must map
the path part with the name "csrfToken".
```javascript
/**
 * @Route("GET /link/action/<csrfToken:string>")
 * @Csrf(true)
 */
class LinkActionRoute {
  process() {
    return {};
  }
}
```

Note that using GET requests for state changing requests is discouraged
when using sensitive data. See the
[OWASP site](https://www.owasp.org/index.php/CSRF_Prevention_Cheat_Sheet#Disclosure_of_Token_in_URL)
for more information.
