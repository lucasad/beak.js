var Router = require('../lib/beak');
var chai   = require('chai');
var expect = chai.expect;

describe('Beak router', function() {
	var staticPath = '/test/path/';
	var optionalPath = '/test/:optional/:path/';
	var router;

	beforeEach(function(){
		router = new Router();
	});

	describe('#pathRegexp()', function() {

		it('should convert static path to route object', function() {
			var route = router.pathRegexp(staticPath);

			expect(route).to.be.a('object');
			expect(route).to.have.property('path');
			expect(route).to.have.property('keys');
		});

		it('should throw Error when path is not a string', function() {
			expect(router.pathRegexp.bind(router, {})).to.throw(Error);
		});

		it('should convert optional path to route object', function() {
			var route = router.pathRegexp(optionalPath);

			expect(route).to.be.a('object');
			expect(route).to.have.property('path');
			expect(route).to.have.deep.property('keys[0]', 'optional');
			expect(route).to.have.deep.property('keys[1]', 'path');
		});

	});

	describe('#matchRoute()', function() {

		it('should return route object only for defined method', function() {
			var getRoute, postRoute, putRoute, deleteRoute;

			router.get(staticPath, function() {});
			getRoute = router.matchRoute('GET', staticPath);
			postRoute = router.matchRoute('POST', staticPath);
			putRoute = router.matchRoute('PUT', staticPath);
			deleteRoute = router.matchRoute('DELETE', staticPath);

			expect(getRoute).to.be.a('object');
			expect(postRoute).to.equal(false);
			expect(putRoute).to.equal(false);
			expect(deleteRoute).to.equal(false);
		});

		it('should return false if route not found', function() {
			expect(router.matchRoute('DELETE', staticPath)).to.equal(false);
		});

		it('should throw Error when current HTTP method is not supported', function() {
			expect(router.matchRoute.bind(router, 'TEST', staticPath)).to.throw(Error);
		});

		it('should throw Error when HTTP method is not defined', function() {
			expect(router.matchRoute.bind(router)).to.throw(Error);
		});

		it('should throw Error when path is not a string', function() {
			expect(router.matchRoute.bind(router, 'GET', false)).to.throw(Error);
		});

		it('should throw Error when path is undefined', function() {
			expect(router.matchRoute.bind(router, 'GET')).to.throw(Error);
		});

	});

	describe('#getParams()', function() {
		it('should return object with params', function() {
			var url = '/test/3/list/'
			var route = router.pathRegexp(optionalPath);
			var params = router.getParams(url, route);

			expect(params).to.be.a('object');
			expect(params).to.have.deep.property('optional', '3');
			expect(params).to.have.deep.property('path', 'list');
		});

		it('should return object with empty params object', function() {
			var url = '/test/path/'
			var route = router.pathRegexp(staticPath);

			expect(router.getParams(url, route)).to.be.empty;
		});

	});

	describe('#isUniqPath()', function() {

		it('should return false if path already exist', function() {
			var route = router.pathRegexp(staticPath);

			route.method = 'get';
			router.get(staticPath, function() {});
			expect(router.isUniqPath(route)).to.equal(false);
		});

		it('should return true if new path', function() {
			var path = '/really/new/path/';
			var route = router.pathRegexp(path);

			route.method = 'get';
			router.get(staticPath, function() {});
			expect(router.isUniqPath(route)).to.equal(true);
		});

	});

	describe('#get()/post()/put()/delete()', function() {
		it('should support use 1 path for a few HTTP methods', function() {
			expect(router.get.bind(router, staticPath, function() {})).to.not.throw(Error);
			expect(router.post.bind(router, staticPath, function() {})).to.not.throw(Error);
			expect(router.put.bind(router, staticPath, function() {})).to.not.throw(Error);
			expect(router.delete.bind(router, staticPath, function() {})).to.not.throw(Error);
		});

		it('should throw Error when callback is not a function', function() {
			expect(router.get.bind(router, staticPath, {})).to.throw(Error);
		});
	});

});
