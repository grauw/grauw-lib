if (!window.gl)
	gl = {};

/**
 * Unit tests
 */
URIUnit = function() {
	gl.unit.JSUnit.call(this);
}
gl.Class.create(URIUnit, gl.unit.JSUnit);

/**
 * Unit tests
 * See RFC 3986 appendix C
 */
URIUnit.prototype.tests = [
		// normal examples
		['http://a/b/c/d;p?q', 'g:h'          , 'g:h'],
		['http://a/b/c/d;p?q', 'g'            , 'http://a/b/c/g'],
		['http://a/b/c/d;p?q', './g'          , 'http://a/b/c/g'],
		['http://a/b/c/d;p?q', 'g/'           , 'http://a/b/c/g/'],
		['http://a/b/c/d;p?q', '/g'           , 'http://a/g'],
		['http://a/b/c/d;p?q', '//g'          , 'http://g'],
		['http://a/b/c/d;p?q', '?y'           , 'http://a/b/c/d;p?y'],
		['http://a/b/c/d;p?q', 'g?y'          , 'http://a/b/c/g?y'],
		['http://a/b/c/d;p?q', '#s'           , 'http://a/b/c/d;p?q#s'],
		['http://a/b/c/d;p?q', 'g#s'          , 'http://a/b/c/g#s'],
		['http://a/b/c/d;p?q', 'g?y#s'        , 'http://a/b/c/g?y#s'],
		['http://a/b/c/d;p?q', ';x'           , 'http://a/b/c/;x'],
		['http://a/b/c/d;p?q', 'g;x'          , 'http://a/b/c/g;x'],
		['http://a/b/c/d;p?q', 'g;x?y#s'      , 'http://a/b/c/g;x?y#s'],
		['http://a/b/c/d;p?q', ''             , 'http://a/b/c/d;p?q'],
		['http://a/b/c/d;p?q', '.'            , 'http://a/b/c/'],
		['http://a/b/c/d;p?q', './'           , 'http://a/b/c/'],
		['http://a/b/c/d;p?q', '..'           , 'http://a/b/'],
		['http://a/b/c/d;p?q', '../'          , 'http://a/b/'],
		['http://a/b/c/d;p?q', '../g'         , 'http://a/b/g'],
		['http://a/b/c/d;p?q', '../..'        , 'http://a/'],
		['http://a/b/c/d;p?q', '../../'       , 'http://a/'],
		['http://a/b/c/d;p?q', '../../g'      , 'http://a/g'],
		// abnormal examples
		['http://a/b/c/d;p?q', '../../../g'   , 'http://a/g'],
		['http://a/b/c/d;p?q', '../../../../g', 'http://a/g'],
		['http://a/b/c/d;p?q', '/./g'         , 'http://a/g'],
		['http://a/b/c/d;p?q', '/../g'        , 'http://a/g'],
		['http://a/b/c/d;p?q', 'g.'           , 'http://a/b/c/g.'],
		['http://a/b/c/d;p?q', '.g'           , 'http://a/b/c/.g'],
		['http://a/b/c/d;p?q', 'g..'          , 'http://a/b/c/g..'],
		['http://a/b/c/d;p?q', '..g'          , 'http://a/b/c/..g'],
		['http://a/b/c/d;p?q', './../g'       , 'http://a/b/g'],
		['http://a/b/c/d;p?q', './g/.'        , 'http://a/b/c/g/'],
		['http://a/b/c/d;p?q', 'g/./h'        , 'http://a/b/c/g/h'],
		['http://a/b/c/d;p?q', 'g/../h'       , 'http://a/b/c/h'],
		['http://a/b/c/d;p?q', 'g;x=1/./y'    , 'http://a/b/c/g;x=1/y'],
		['http://a/b/c/d;p?q', 'g;x=1/../y'   , 'http://a/b/c/y'],
		['http://a/b/c/d;p?q', 'g?y/./x'      , 'http://a/b/c/g?y/./x'],
		['http://a/b/c/d;p?q', 'g?y/../x'     , 'http://a/b/c/g?y/../x'],
		['http://a/b/c/d;p?q', 'g#s/./x'      , 'http://a/b/c/g#s/./x'],
		['http://a/b/c/d;p?q', 'g#s/../x'     , 'http://a/b/c/g#s/../x'],
		['http://a/b/c/d;p?q', 'http:g'       , 'http:g'],
		// other tests (not from the RFC)
		['http:/'  , 'g/h', 'http:/g/h'],
		['http:/'  , 'g'  , 'http:/g'],
		['http:/'  , '..' , 'http:/'],
		['http:/'  , '.'  , 'http:/'],
		['http:a'  , 'g/h', 'http:g/h'],
		['http:a'  , 'g'  , 'http:g'],
		['http:a'  , '..' , 'http:'],
		['http:a'  , '.'  , 'http:'],
		['http:a/b', 'g/h', 'http:a/g/h'],
		['http:a/b', 'g'  , 'http:a/g'],
		['http:a/b', '..' , 'http:'],
		['http:a/b', '.'  , 'http:a/']
	];

/**
 * Main test function
 */
URIUnit.prototype.test = function() {
	this.performanceTest()
	var html = this.unitTests();
	var outputDiv = document.getElementById('output');
	outputDiv.innerHTML = html;
}

/**
 * Unit tests
 * See RFC 3986 appendix C
 */
URIUnit.prototype.unitTests = function() {
	// add:
	// absolute URI tests: http://a
	//
	var html = '<table>';
	html += '<tr><th>Base URI</th><th>URI</th><th>Result</th><th>Expected</th><th>Correct</th></tr>';
	for (var i = 0; i < this.tests.length; i++) {
		var test = this.tests[i];
		var sURI = gl.uri.URI.resolve(test[1], test[0]);
		this.assertEquals(test[2], sURI, 'Resolving "' + test[1] + '" with "' + test[0] + '"');
		html += '<tr style="background:' + (sURI == test[2] ? '#cfc' : '#fcc') + '">';
		html += '<td>' + test[0] + '</td>';
		html += '<td>' + test[1] + '</td>';
		html += '<td>' + sURI + '</td>';
		html += '<td>' + test[2] + '</td>';
		html += '<td>' + (sURI == test[2]) + '</td>';
		html += '</tr>';
	}
	html += '</table>';
	return html;
}

/**
 * Performance tests
 */
URIUnit.prototype.performanceTest = function() {
	this.timeStart();
	for (var i = 0; i < 10000; i++) {
		gl.uri.URI.resolve('a/.././b', 'http://a/b/c/d;p?q');
	}
	this.writeln('Running 10000x, milliseconds needed: ' + this.timeEnd());
	
	var oBaseURI = new gl.uri.URI('http://a/b/c/d;p?q');
	var j = 0;
	this.timeStart();
	for (var i = 0; i < 10000; i++) {
		gl.uri.URI.resolve('a/.././b' + j++, 'http://a/b/c/d;p?q');
//		var oURI = new gl.uri.URI('a/.././b' + j++);
//		oURI.resolve(oBaseURI).toString();
	}
	this.writeln('Running 10000x w/ different URIs, milliseconds needed: ' + this.timeEnd());
}
