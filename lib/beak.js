'use strict';

// List of supported http methods.
var HTTP_METHODS = ['get', 'post', 'put', 'delete'];

// Regexp for path keys.
var KEYS = /(:[\w\-]+)/g;
var SLASH = /([\/.])/g;
var routes = {};

var router = {
    /**
     * Parse path to regexp
     * @param  {String} path
     * @return {Object} Object with new RegExp and keys
     */
    pathRegexp: function(path) {
        var keys = [];

        if (Object.prototype.toString.call(path) !== '[object String]') {
            throw new Error('Path must to be string!');
        }

        path = path.toLowerCase().replace(KEYS, function() {
            keys.push(arguments[0].slice(1));
            return '(?:([^\/]+?))';
        }).replace(SLASH, '\\$1');

        return {
            path: new RegExp('^' + path + '$'),
            keys: keys
        };
    },

    /**
     * Find route
     * @param  {String} method HTTP method
     * @param  {String} path
     * @return {Object|Boolean} Found route object or false
     */
    matchRoute: function(method, path) {
        var route;

        method = method.toLowerCase();

        if (!method && HTTP_METHODS.indexOf(method) < 0) {
            throw new Error('Not supported HTTP method: ' + method);
        }

        if (!path && Object.prototype.toString.call(path) !== '[object String]') {
            throw new Error('Path must to be string!');
        }

        for (var i in routes[method]) {
            route = routes[method][i];

            if (route.path.test(path)) {
                return route;
            }
        }

        return false;
    },

    /**
     * Get params from URL
     * @param  {String} url
     * @param  {Object} route
     * @return {Object} params Object with parsed params
     */
    getParams: function(url, route) {
        // TODO: Add query params.
        var params = {};
        var key;

        url.match(route.path).slice(1).forEach(function(value, index) {
            key = route.keys[index];
            params[key] = value;
        });

        return params;
    },

    /**
     * Response 404
     * @param {Object} request
     * @param {Object} response
     */
    notFound: function(request, response) {
        response.writeHead(404, { 'Content-Type': 'text/html' });
        response.end();
    },

    /**
     * Uniqueness check the path
     * @param  {Object} route
     * @return {Boolean}
     */
    isUniqPath: function(route) {
        return routes[route.method].some(function(item) {
            return item.path.toString() === route.path.toString();
        });
    },

    listener: function(request, response) {
        var url = request.url;
        var route = this.matchRoute(request.method, url);

        if (!route) {
            return this.notFound(request, response);
        }

        request.params = this.getParams(url, route);
        route.callback(request, response);
    }
};

// Add to route object method like get, post etc.
// User can bind route: router.get() or router.post().
HTTP_METHODS.forEach(function(method) {
    routes[method] = [];
    this[method] = function(path, callback) {
        var route = this.pathRegexp(path);

        if (!typeof route.callback === 'function') {
            throw new Error('Callback is not a function');
        }

        route.callback = callback;
        route.method = method;

        if (this.isUniqPath(route)) {
            throw new Error('Path '+ path +' already exist.');
        }

        routes[method].push(route);
    };
}.bind(router));

Object.freeze(router);

module.exports = router;
