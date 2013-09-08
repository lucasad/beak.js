# Beak.js
Beak.js is a simple URL router for NodeJS.

# Install
	npm install beak

### From Source
	git clone git://github.com/katsgeorgeek/beak.js.git
    cd beak.js
    npm link

# Basic Usage
	var Router = require('beak');
	var router = new Router();

	router.get('/post/:id/', function(request, response) {
    	console.log(request.params.id);
	});

	http.createServer(router.listener).listen(HTTP_PORT, function () {
	    console.log('Server running at http://127.0.0.1:' + HTTP_PORT);
	});

# Methods

* `router.get`:  Match `GET` requests
* `router.post`: Match `POST` requests
* `router.put`:  Match `PUT` requests
* `router.delete`:  Match `DELETE` requests

# Issues
If you find any issues with Beak.js or have any suggestions or feedback, please feel free to visit the [github issues](https://github.com/katsgeorgeek/beak.js/issues) page.

# License
MIT
