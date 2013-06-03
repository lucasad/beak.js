# Beak.js
Beak.js is a simple URL router for NodeJS.

# Install
### From Source
	git clone git://github.com/katsgeorgeek/beak.js.git
    cd beak.js
    npm link

# Basic Usage
	var Router = require('beak');

	Router.get('/post/:id/', function(request, response) {
    	console.log(request.params.id);
	});

	http.createServer(Router.listener).listen(HTTP_PORT, function () {
	    console.log('Server running at http://127.0.0.1:' + 3000);
	});

# Methods

* `Router.get`:  Match `GET` requests
* `Router.post`: Match `POST` requests
* `Router.put`:  Match `PUT` requests
* `Router.delete`:  Match `DELETE` requests

# Changelog


# Issues
If you find any issues with Beak.js or have any suggestions or feedback, please feel free to visit the [github issues](https://github.com/katsgeorgeek/beak.js/issues) page.

# License
MIT
