'use strict';

// List of supported http methods.
var HTTP_METHODS = ['get', 'post', 'put', 'delete'],
      router = {},
      routes = {};

 function pathRegexp(path) {
    var keys = [];

    if (Object.prototype.toString.call(path) !== '[object String]') {
        throw new Error('Path must to be string!');
    }

    path = path.toLowerCase().replace(/(:[\w\-]+)/g, function() {
        keys.push(arguments[0].slice(1));
        return '(?:([^\/]+?))';
    }).replace(/([\/.])/g, '\\$1');

    return {
        path: new RegExp('^' + path + '$'),
        keys: keys
    };
}

function matchRoute(method, path) {
    var route;

    method = method.toLowerCase();

    // TODO: Use handler to response Error
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

}

function getParams(url, route) {
    var params = {};

    url.match(route.path).slice(1).forEach(function(value, index) {
        params[route.keys[index]] = value;
    });

    return params;
}

HTTP_METHODS.forEach(function(method) {
    routes[method] = [];
    router[method] = function(route, callback) {
        route = pathRegexp(route);
        route.callback = callback;
        routes[method].push(route);
    };
});

router.listener = function(request, response) {
    var url = request.url,
          route = matchRoute(request.method, url);

    if (route) {
        if (typeof route.callback === 'function') {
            route.callback(request, response, getParams(url, route));
        }
    } else {
        response.writeHead(404, { 'Content-Type': 'text/html' });
        response.end();
    }
};

module.exports = router;
