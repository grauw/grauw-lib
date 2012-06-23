(function(exports) {
	
	var Test = gl.unit.Test;
	var SimpleTest = gl.unit.SimpleTest;
	var TestSuite = gl.unit.TestSuite;
	var TestGroup = gl.unit.TestGroup;
	var URI = gl.uri.URI;
	
	
	
	
	function URITest(baseURI, uri, result) {
		Test.call(this);
		this.baseURI = baseURI;
		this.uri = uri;
		this.result = result;
	}
	
	gl.extend(Test, URITest);
	
	URITest.prototype.toString = function() {
		return 'Test resolving “' + this.uri + '” with “' + this.baseURI + '”';
	};
	
	URITest.prototype.test = function() {
		var uri = URI.resolve(this.uri, this.baseURI);
		this.assertEquals(this.result, uri, 'Result URI should match expected URI.');
	};
	
	
	
	
	function URIPerformanceTest1() {
		Test.call(this);
	}
	
	gl.extend(Test, URIPerformanceTest1);
	
	URIPerformanceTest1.prototype.toString = function() {
		return 'Performance test: resolving same URI 10,000 times';
	};
	
	URIPerformanceTest1.prototype.test = function() {
		for (var i = 0; i < 10000; i++) {
			URI.resolve('a/.././b', 'http://a/b/c/d;p?q');
		}
	};
	
	
	
	
	function URIPerformanceTest2() {
		Test.call(this);
	}
	
	gl.extend(Test, URIPerformanceTest2);
	
	URIPerformanceTest2.prototype.toString = function() {
		return 'Performance test: resolving different URI 10,000 times';
	};
	
	URIPerformanceTest2.prototype.test = function() {
		for (var i = 0; i < 10000; i++) {
			URI.resolve('a/.././b' + i, 'http://a/b/c/d;p?q');
		}
	};
	
	
	
	
	function URIPerformanceTest3() {
		Test.call(this);
	}
	
	gl.extend(Test, URIPerformanceTest3);
	
	URIPerformanceTest3.prototype.toString = function() {
		return 'Performance test: resolving URI objects 10,000 times';
	};
	
	URIPerformanceTest3.prototype.test = function() {
		var baseURI = new URI('http://a/b/c/d;p?q');
		for (var i = 0; i < 10000; i++) {
			var uri = new URI('a/.././b');
			uri.resolve(baseURI).toString();
		}
	};
	
	
	
	/**
	 * Unit tests
	 * See RFC 3986 appendix C
	 */
	var uriSuite = new TestSuite([
		new TestGroup('Resolving, normal examples', [
			new URITest('http://a/b/c/d;p?q', 'g:h'          , 'g:h'),
			new URITest('http://a/b/c/d;p?q', 'g'            , 'http://a/b/c/g'),
			new URITest('http://a/b/c/d;p?q', './g'          , 'http://a/b/c/g'),
			new URITest('http://a/b/c/d;p?q', 'g/'           , 'http://a/b/c/g/'),
			new URITest('http://a/b/c/d;p?q', '/g'           , 'http://a/g'),
			new URITest('http://a/b/c/d;p?q', '//g'          , 'http://g'),
			new URITest('http://a/b/c/d;p?q', '?y'           , 'http://a/b/c/d;p?y'),
			new URITest('http://a/b/c/d;p?q', 'g?y'          , 'http://a/b/c/g?y'),
			new URITest('http://a/b/c/d;p?q', '#s'           , 'http://a/b/c/d;p?q#s'),
			new URITest('http://a/b/c/d;p?q', 'g#s'          , 'http://a/b/c/g#s'),
			new URITest('http://a/b/c/d;p?q', 'g?y#s'        , 'http://a/b/c/g?y#s'),
			new URITest('http://a/b/c/d;p?q', ';x'           , 'http://a/b/c/;x'),
			new URITest('http://a/b/c/d;p?q', 'g;x'          , 'http://a/b/c/g;x'),
			new URITest('http://a/b/c/d;p?q', 'g;x?y#s'      , 'http://a/b/c/g;x?y#s'),
			new URITest('http://a/b/c/d;p?q', ''             , 'http://a/b/c/d;p?q'),
			new URITest('http://a/b/c/d;p?q', '.'            , 'http://a/b/c/'),
			new URITest('http://a/b/c/d;p?q', './'           , 'http://a/b/c/'),
			new URITest('http://a/b/c/d;p?q', '..'           , 'http://a/b/'),
			new URITest('http://a/b/c/d;p?q', '../'          , 'http://a/b/'),
			new URITest('http://a/b/c/d;p?q', '../g'         , 'http://a/b/g'),
			new URITest('http://a/b/c/d;p?q', '../..'        , 'http://a/'),
			new URITest('http://a/b/c/d;p?q', '../../'       , 'http://a/'),
			new URITest('http://a/b/c/d;p?q', '../../g'      , 'http://a/g')
		]),
		new TestGroup('Resolving, abnormal examples', [
			new URITest('http://a/b/c/d;p?q', '../../../g'   , 'http://a/g'),
			new URITest('http://a/b/c/d;p?q', '../../../../g', 'http://a/g'),
			new URITest('http://a/b/c/d;p?q', '/./g'         , 'http://a/g'),
			new URITest('http://a/b/c/d;p?q', '/../g'        , 'http://a/g'),
			new URITest('http://a/b/c/d;p?q', 'g.'           , 'http://a/b/c/g.'),
			new URITest('http://a/b/c/d;p?q', '.g'           , 'http://a/b/c/.g'),
			new URITest('http://a/b/c/d;p?q', 'g..'          , 'http://a/b/c/g..'),
			new URITest('http://a/b/c/d;p?q', '..g'          , 'http://a/b/c/..g'),
			new URITest('http://a/b/c/d;p?q', './../g'       , 'http://a/b/g'),
			new URITest('http://a/b/c/d;p?q', './g/.'        , 'http://a/b/c/g/'),
			new URITest('http://a/b/c/d;p?q', 'g/./h'        , 'http://a/b/c/g/h'),
			new URITest('http://a/b/c/d;p?q', 'g/../h'       , 'http://a/b/c/h'),
			new URITest('http://a/b/c/d;p?q', 'g;x=1/./y'    , 'http://a/b/c/g;x=1/y'),
			new URITest('http://a/b/c/d;p?q', 'g;x=1/../y'   , 'http://a/b/c/y'),
			new URITest('http://a/b/c/d;p?q', 'g?y/./x'      , 'http://a/b/c/g?y/./x'),
			new URITest('http://a/b/c/d;p?q', 'g?y/../x'     , 'http://a/b/c/g?y/../x'),
			new URITest('http://a/b/c/d;p?q', 'g#s/./x'      , 'http://a/b/c/g#s/./x'),
			new URITest('http://a/b/c/d;p?q', 'g#s/../x'     , 'http://a/b/c/g#s/../x'),
			new URITest('http://a/b/c/d;p?q', 'http:g'       , 'http:g')
		]),
		new TestGroup('Resolving, other tests (not from the RFC)', [
			new URITest('http:/'  , 'g/h', 'http:/g/h'),
			new URITest('http:/'  , 'g'  , 'http:/g'),
			new URITest('http:/'  , '..' , 'http:/'),
			new URITest('http:/'  , '.'  , 'http:/'),
			new URITest('http:a'  , 'g/h', 'http:g/h'),
			new URITest('http:a'  , 'g'  , 'http:g'),
			new URITest('http:a'  , '..' , 'http:'),
			new URITest('http:a'  , '.'  , 'http:'),
			new URITest('http:a/b', 'g/h', 'http:a/g/h'),
			new URITest('http:a/b', 'g'  , 'http:a/g'),
			new URITest('http:a/b', '..' , 'http:'),
			new URITest('http:a/b', '.'  , 'http:a/')
		]),
		new TestGroup('Resolving, performance tests', [
			new URIPerformanceTest1(),
			new URIPerformanceTest2(),
			new URIPerformanceTest3()
		]),
		new TestGroup('URI object tests', [
			new SimpleTest('URI::constructor(string)', function() {
				var uri = new URI("http://example.com:80/a/b?x#y");
				this.assert(uri instanceof URI);
			}),
			new SimpleTest('URI::constructor(URI)', function() {
				var uri = new URI("http://example.com:80/a/b?x#y");
				var copy = new URI(uri);
				this.assert(copy instanceof URI);
				this.assertEquals('http', copy.getScheme());
				this.assertEquals('example.com:80', copy.getAuthority());
				this.assertEquals('/a/b', copy.getPath());
				this.assertEquals('x', copy.getQuery());
				this.assertEquals('y', copy.getFragment());
			}),
			new SimpleTest('URI::getScheme()', function() {
				var oURI = new URI("http://example.com:80/a/b?x#y");
				this.assertEquals('http', oURI.getScheme());
			}),
			new SimpleTest('URI::getAuthority()', function() {
				var uri = new URI("http://example.com:80/a/b?x#y");
				this.assertEquals('example.com:80', uri.getAuthority());
			}),
			new SimpleTest('URI::getPath()', function() {
				var uri = new URI("http://example.com:80/a/b?x#y");
				this.assertEquals('/a/b', uri.getPath());
			}),
			new SimpleTest('URI::getQuery()', function() {
				var uri = new URI("http://example.com:80/a/b?x#y");
				this.assertEquals('x', uri.getQuery());
			}),
			new SimpleTest('URI::getFragment()', function() {
				var uri = new URI("http://example.com:80/a/b?x#y");
				this.assertEquals('y', uri.getFragment());
			}),
			new SimpleTest('URI::isAbsolute()', function() {
				throw new Error("TODO");
			}),
			new SimpleTest('URI::isSameDocumentAs()', function() {
				throw new Error("TODO");
			}),
			new SimpleTest('URI::equals()', function() {
				throw new Error("TODO");
			}),
			new SimpleTest('URI::normalize()', function() {
				throw new Error("TODO");
			}),
			new SimpleTest('URI.resolve()', function() {
				throw new Error("TODO");
			}),
			new SimpleTest('URI::toString()', function() {
				var uri = new URI("http://example.com:80/a/b?x#y");
				this.assertEquals("http://example.com:80/a/b?x#y", uri.toString());
			}),
			new SimpleTest('URI::toString() about:blank', function() {
				var uri = new URI("about:blank");
				this.assertEquals("about:blank", uri.toString());
			})
		])
	]);
	
	
	
	
	exports.uriTests = uriTests;

})(tests = {});
