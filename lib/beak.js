'use strict';

// List of supported http methods.
var HTTP_METHODS = ['get', 'post', 'put', 'delete'];

// Regexp for path keys.
var KEYS = /(:[\w\-]+)/g;
var SLASH = /([\/.])/g;
var router = {};
var routes = {};

/**
 * Parse path to regexp.
 * @param  {String} path URL path.
 * @return {Object} Object with new RegExp and keys.
 */
function pathRegexp(path) {
    var keys = [];

    if (Object.prototype.toString.call(path) !== '[object String]') {
        throw new Error('Path must to be string!');
    }

    // TODO: Escape char.
    path = path.toLowerCase().replace(KEYS, function() {
        keys.push(arguments[0].slice(1));
        return '(?:([^\/]+?))';
    }).replace(SLASH, '\\$1');

    return {
        path: new RegExp('^' + path + '$'),
        keys: keys
    };
}

/**
 * Find route.
 * @param  {String} method HTTP method.
 * @param  {String} path URL path.
 * @return {OBject|Boolean} Found route object or false.
 */
function matchRoute(method, path) {
    var route;

    method = method.toLowerCase();

    // TODO: Use handler to response Error.
    if (!method && HTTP_METHODS.indexOf(method) < 0) {
        throw new Error('Not supported HTTP method: ' + method);
    }

    if (!path && Object.prototype.toString.call(path) !== '[object String]') {
        throw new Error('Path must to be string!');
    }

    for (var i in routes[method]) {
        route = routes[method][i];

        // TODO: call get Params.
        if (route.path.test(path)) {
            return route;
        }
    }

    return false;
}

/**
 * Get params from URL.
 * @param  {String} url URL path.
 * @param  {Object} route Route object.
 * @return {Object} params Object with parsed params.
 */
function getParams(url, route) {
    // TODO: Add query params.
    var params = {};

    url.match(route.path).slice(1).forEach(function(value, index) {
        params[route.keys[index]] = value;
    });

    return params;
}

/**
 * Response 404.
 * @param {Object} request Request object.
 * @param {Object} response Response object.
 */
function notFound(request, response) {
    response.writeHead(404, { 'Content-Type': 'text/html' });
    response.end();
}

HTTP_METHODS.forEach(function(method) {
    routes[method] = [];

    // TODO: Extract method.
    // TODO: Should to be uniq.
    router[method] = function(route, callback) {
        route = pathRegexp(route);
        route.callback = callback;
        routes[method].push(route);
    };
});

router.listener = function(request, response) {
    var url = request.url;
    var route = matchRoute(request.method, url);

    request.params = getParams(url, route);

    if (route) {
        if (typeof route.callback === 'function') {
            route.callback(request, response);
        }

    } else {
        notFound(request, response);
    }
};

module.exports = router;
