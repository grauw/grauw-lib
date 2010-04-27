gl.module('unit',
	[
		'../src/unit.js',
		'../src/uri.js'
	],
	function() {
	
	// imports
	var Test = gl.unit.Test;
	var TestSuite = gl.unit.TestSuite;
	
	
	
	
	var URITest = function(sBaseURI, sURI, sResult) {
		this.baseURI = sBaseURI;
		this.uri = sURI;
		this.result = sResult;
	};
	gl.extend(Test, URITest);
	
	URITest.prototype.toString = function() {
		return 'Test resolving “' + this.uri + '” with “' + this.baseURI + '”';
	};
	
	URITest.prototype.test = function() {
		var sURI = gl.uri.URI.resolve(this.uri, this.baseURI);
		this.assertEquals(this.result, sURI, 'Result URI should match expected URI.');
	};
	
	
	
	
	var URIPerformanceTest1 = function() {
	};
	gl.extend(Test, URIPerformanceTest1);
	
	URIPerformanceTest1.prototype.toString = function() {
		return 'Performance test: resolving same URI 10,000 times';
	};
	
	URIPerformanceTest1.prototype.test = function() {
		for (var i = 0; i < 10000; i++) {
			gl.uri.URI.resolve('a/.././b', 'http://a/b/c/d;p?q');
		}
	};
	
	
	
	
	var URIPerformanceTest2 = function() {
	};
	gl.extend(Test, URIPerformanceTest2);
	
	URIPerformanceTest2.prototype.toString = function() {
		return 'Performance test: resolving different URI 10,000 times';
	};
	
	URIPerformanceTest2.prototype.test = function() {
		for (var i = 0; i < 10000; i++) {
			gl.uri.URI.resolve('a/.././b' + i, 'http://a/b/c/d;p?q');
		}
	};
	
	
	
	
	var URIPerformanceTest3 = function() {
	};
	gl.extend(Test, URIPerformanceTest3);
	
	URIPerformanceTest3.prototype.toString = function() {
		return 'Performance test: resolving URI objects 10,000 times';
	};
	
	URIPerformanceTest3.prototype.test = function() {
		var oBaseURI = new gl.uri.URI('http://a/b/c/d;p?q');
		for (var i = 0; i < 10000; i++) {
			var oURI = new gl.uri.URI('a/.././b');
			oURI.resolve(oBaseURI).toString();
		}
	};
	
	
	
	/**
	 * Unit tests
	 * See RFC 3986 appendix C
	 */
	var oURISuite = new TestSuite([
			// normal examples
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
			new URITest('http://a/b/c/d;p?q', '../../g'      , 'http://a/g'),
			// abnormal examples
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
			new URITest('http://a/b/c/d;p?q', 'http:g'       , 'http:g'),
			// other tests (not from the RFC)
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
			new URITest('http:a/b', '.'  , 'http:a/'),
			// performance tests
			new URIPerformanceTest1(),
			new URIPerformanceTest2(),
			new URIPerformanceTest3()
		]);
	
	
	
	
	// exports
	this.uriSuite = oURISuite;

});
