var router = require('../lib/beak');
var chai   = require('chai');
var expect = chai.expect;

describe('Beak router', function() {
	describe('#pathRegexp()', function() {

		it('should convert static path to route object', function() {
			var path = 'test/convert/static/path/';
			var route = router.pathRegexp(path);

			expect(route).to.be.a('object');
			expect(route).to.have.property('path');
			expect(route).to.have.property('keys');
		});

		it('should throw Error when path is not a string', function() {
			expect(router.pathRegexp.bind(router, {})).to.throw(Error);
		});

		it('should convert optional path to route object', function() {
			var path = 'test/:convert/:optional/path/';
			var route = router.pathRegexp(path);

			expect(route).to.be.a('object');
			expect(route).to.have.property('path');
			expect(route).to.have.deep.property('keys[0]', 'convert');
			expect(route).to.have.deep.property('keys[1]', 'optional');
		});

	});

	describe('#matchRoute()', function() {

		it('should return route object only for defined method', function() {
			var path = '/test/path/http/method';
			var getRoute, postRoute, putRoute, deleteRoute;

			router.get(path, function() {});
			getRoute = router.matchRoute('GET', path);
			postRoute = router.matchRoute('POST', path);
			putRoute = router.matchRoute('PUT', path);
			deleteRoute = router.matchRoute('DELETE', path);

			expect(getRoute).to.be.a('object');
			expect(postRoute).to.equal(false);
			expect(putRoute).to.equal(false);
			expect(deleteRoute).to.equal(false);
		});

		it('should return false if route not found', function() {
			var path = '/not/found/path/';
			var route = router.matchRoute('DELETE', path);

			expect(route).to.equal(false);
		});

		it('should throw Error when current HTTP method is not supported', function() {
			var path = '/test/path';

			expect(router.matchRoute.bind(router, 'TEST', path)).to.throw(Error);
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
			var path = '/path/with/:some/:params';
			var url = '/path/with/3/index'
			var route = router.pathRegexp(path);
			var params;

			params = router.getParams(url, route);
			expect(params).to.be.a('object');
			expect(params).to.have.deep.property('some', '3');
			expect(params).to.have.deep.property('params', 'index');
		});

		it('should return object with empty params object', function() {
			var path = '/path/with/';
			var url = '/path/with/'
			var route = router.pathRegexp(path);
			var params;

			params = router.getParams(url, route);
			expect(params).to.be.empty;
		});

	});

	describe('#isUniqPath()', function() {

		it('should return false if path already exist', function() {
			var path = '/path/already/exist/';
			var route = router.pathRegexp(path);
			var isUniq;

			route.method = 'get';
			router.get(path, function() {});

			isUniq = router.isUniqPath(route);
			expect(isUniq).to.equal(false);
		});

		it('should return true if new path', function() {
			var path = '/really/new/path/';
			var route = router.pathRegexp(path);
			var isUniq;

			route.method = 'get';

			isUniq = router.isUniqPath(route);
			expect(isUniq).to.equal(true);
		});

	});

	describe('#get()/post()/put()/delete()', function() {
		it('should support use 1 path for a few HTTP methods', function() {
			var path = '/test/path/http/methods/2';

			expect(router.get.bind(router, path, function() {})).to.not.throw(Error);
			expect(router.post.bind(router, path, function() {})).to.not.throw(Error);
			expect(router.put.bind(router, path, function() {})).to.not.throw(Error);
			expect(router.delete.bind(router, path, function() {})).to.not.throw(Error);
		});

		it('should throw Error when callback is not a function', function() {
			var path = '/test/path/callbck/is/not/a/function';

			expect(router.get.bind(router, path, {})).to.throw(Error);
		});
	});

});
