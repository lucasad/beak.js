'use strict';

var MIME_TYPES = {
    'txt'  : 'text/plain',
    'html' : 'text/html',
    'xml'  : 'application/xml',
    'css'  : 'text/css',
    'js'   : 'text/javascript',
    'png'  : 'image/png',
    'json' : 'application/json',
    'jpg'  : 'image/jpeg',
    'jpeg' : 'image/jpeg',
    'gif'  : 'image/gif',
    'svg'  : 'image/svg+xml',
    'ico'  : 'image/x-icon',
    'pdf'  : 'application/pdf',
    'mid'  : 'audio/midi',
    'midi' : 'audio/midi',
    'wav'  : 'audio/x-wav',
    'mp3'  : 'audio/mpeg',
    'ogg'  : 'audio/ogg',
    'mp4'  : 'video/mp4',
    'mpeg' : 'video/mpeg',
    'avi'  : 'video/x-msvideo'
};

// List of supported http methods.
var HTTP_METHODS = ['get', 'post', 'put', 'delete'];

// Regexp for path keys.
var KEYS = /(:[\w\-]+)/g;
var SLASH = /([\/.])/g;

//Static route
var STATIC_ROUTE = /^\/public/;

var fs = require('fs');
var path = require('path');
var getContentType;

/*
 * Get mime type.
 * @param {string} extension File extension.
 * @return {string} MIME type.
 */
 function getContentType(extension) {
    return MIME_TYPES[extension] || 'text/html';
}

/*
 * Get file data.
 *
 * @param {string} file Path to file.
 * @param {object} callbacks Callbacks objects.
 */
function getFile(file, callbacks) {
    var extension = path.extname(file).substring(1).toLowerCase();

    fs.exists('.' + file, function(exists) {
        if (!exists) {
            callbacks.error(404);
            return;
        }

        fs.readFile('.' + file, function(error, data) {
            if (error) {
                callbacks.error(500);
                return;
            }

            callbacks.success(data, getContentType(extension), 'utf-8');
        });
    });
}

var Router = function(config) {
    if (config) {
        if (typeof config.notFound === 'function') {
            this.notFound = config.notFound;
        }

        this._staticRoute = typeof config.static === 'string' ? config.static : STATIC_ROUTE;
    }

    this._routes = {};

    HTTP_METHODS.forEach(function(method) {
        this._routes[method] = [];
    }.bind(this));
};

/**
 * Parse path to regexp
 * @param  {String} path
 * @return {Object} Object with new RegExp and keys
 */
Router.prototype.pathRegexp = function(path) {
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
};

/**
 * Find route
 * @param  {String} method HTTP method
 * @param  {String} path
 * @return {Object|Boolean} Found route object or false
 */
Router.prototype.matchRoute = function(method, path) {
    var route;

    method = method.toLowerCase();

    if (HTTP_METHODS.indexOf(method) < 0) {
        throw new Error('Not supported HTTP method: ' + method);
    }

    if (!path && Object.prototype.toString.call(path) !== '[object String]') {
        throw new Error('Path must to be string!');
    }

    for (var i in this._routes[method]) {
        route = this._routes[method][i];

        if (route.path.test(path)) {
            return route;
        }
    }

    return false;
};

/**
 * Get params from URL
 * @param  {String} url
 * @param  {Object} route
 * @return {Object} params Object with parsed params
 */
Router.prototype.getParams = function(url, route) {
    // TODO: Add query params.
    var params = {};
    var key;

    url.match(route.path).slice(1).forEach(function(value, index) {
        key = route.keys[index];
        params[key] = value;
    });

    return params;
};

/**
 * Response 404
 * @param {Object} request
 * @param {Object} response
 */
function defaultNotFound(request, response) {
    response.writeHead(404, { 'Content-Type': 'text/html' });
    response.end();
};

Router.prototype.notFound = defaultNotFound;

/**
 * Uniqueness check the path
 * @param  {Object} route
 * @return {Boolean}
 */
Router.prototype.isUniqPath = function(route) {
    return !this._routes[route.method].some(function(item) {
        return item.path.toString() === route.path.toString();
    });
};

Router.prototype.listener = function(request, response) {
    var url = request.url;
    var route = this.matchRoute(request.method, url);

    if (this._staticRoute.test(url)) {
        return getFile(request.url, {
            success: function(data, type, encoding) {
                response.statusCode = 200;
                response.setHeader('Content-Type', type );
                response.end(data, encoding);
            },
            error: function(status) {
                response.statusCode = status;
                response.end();
            }
        });
    }

    if (!route) {
        return this.notFound(request, response);
    }

    request.params = this.getParams(url, route);
    route.callback(request, response);
};

// Add to route object method like get, post etc.
// User can bind route: router.get() or router.post().
HTTP_METHODS.forEach(function(method) {
    Router.prototype[method] = function(path, callback) {
        var route = this.pathRegexp(path);

        if (typeof callback !== 'function') {
            throw new Error('Callback is not a function');
        }

        route.callback = callback;
        route.method = method;

        if (!this.isUniqPath(route)) {
            throw new Error('Path '+ path +' already exist.');
        }

        this._routes[method].push(route);
    };
});

module.exports = Router;
