if (!window.gl)
	gl = {};
if (!gl.uri)
	gl.uri = {};
if (!gl.unit)
	gl.unit = {};

/**
 * Implementation of URI parsing and base URI resolving algorithm in RFC 3986.
 * 
 * Question: should it be URI.resolve(BaseURI) or BaseURI.resolve(URI)?
 *
 * @param {string} uri the relative URI to resolve
 */
gl.uri.URI = function(sURI) {
	if (sURI) {
		var c = sURI.match(gl.uri.URI._regexp);
		this.scheme = c[1];
		this.authority = c[2];
		this.path = c[3];
		this.query = c[4];
		this.fragment = c[5];
	}
}

gl.uri.URI.prototype = new Object();

// Initial values on the prototype
gl.uri.URI.prototype.scheme    = null;
gl.uri.URI.prototype.authority = null;
gl.uri.URI.prototype.path      = '';
gl.uri.URI.prototype.query     = null;
gl.uri.URI.prototype.fragment  = null;

// Regular expression from RFC 2396 appendix B
gl.uri.URI._regexp = new RegExp('^(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*)(?:\\?([^#]*))?(?:#(.*))?');

/**
 * Convenience method
 * @param {String} uri the relative URI to resolve
 * @param {String} baseURI the base URI (must be absolute) to resolve against
 */
gl.uri.URI.resolve = function(sURI, sBaseURI) {
	return new gl.uri.URI(sURI).resolve(new gl.uri.URI(sBaseURI)).toString();
}

/**
 * Clones this URI object
 */
gl.uri.URI.prototype.clone = function() {
	var oURI = new gl.uri.URI();
	oURI.scheme = this.scheme;
	oURI.authority = this.authority;
	oURI.path = this.path;
	oURI.query = this.query;
	oURI.fragment = this.fragment;
	return oURI;
}

/**
 * Checks for the restriction described in RFC 3986 section 4.3
 */
gl.uri.URI.prototype.isAbsolute = function() {
	return this.scheme && !this.fragment;
}

/**
 * Checks whether the URI is a fragment-only reference
 */
gl.uri.URI.prototype.isFragmentOnly = function() {
	return !this.scheme && !this.authority && !this.path && !this.query;
}

///**
//* Extensive validation of the URI against the ABNF in RFC 3986
//*/
//gl.uri.URI.prototype.validate

///**
//* Extensive validation of the URI against the ABNF in RFC 3986
//*/
//gl.uri.URI.prototype.equals

/**
 * Resolve a relative URI (this) against a base URI.
 * See RFC 3986 section 5.2
 */
gl.uri.URI.prototype.resolve = function(oBaseURI) {
	var oURI = new gl.uri.URI();
	if (this.scheme) {
		oURI.scheme = this.scheme;
		oURI.authority = this.authority;
		oURI.path = this.path;
		oURI.query = this.query;
	} else {
		oURI.scheme = oBaseURI.scheme;
		if (this.authority) {
			oURI.authority = this.authority;
			oURI.path = this.path;
			oURI.query = this.query;
		} else {
			oURI.authority = oBaseURI.authority;
			if (this.path == '') {
				oURI.path = oBaseURI.path;
				oURI.query = this.query || oBaseURI.query;
			} else {
				if (this.path.charAt(0) == '/') {
					oURI.path = this.path;
					oURI.removeDotSegments();
				} else {
					if (oBaseURI.authority && oBaseURI.path == '') {
						oURI.path = '/' + this.path;
					} else {
						oURI.path = oBaseURI.path.substring(0, oBaseURI.path.lastIndexOf('/') + 1) + this.path;
					}
					oURI.removeDotSegments();
				}
				oURI.query = this.query;
			}
		}
	}
	oURI.fragment = this.fragment;
	return oURI;
}

/**
 * Remove dot segments from path.
 * See RFC 3986 section 5.2.4
 */
gl.uri.URI.prototype.removeDotSegments = function() {
	var aInput = this.path.split('/'),
		aOutput = [],
		sSegment;
	var bAbsPath = aInput[0] == '';
	if (bAbsPath)
		aInput.shift();
	var sFirst = aInput[0] == '' ? aInput.shift() : null;
	while (aInput.length) {
		sSegment = aInput.shift();
		if (sSegment == '..') {
			aOutput.pop();
		} else if (sSegment != '.') {
			aOutput.push(sSegment);
		}
	}
	if (sSegment == '.' || sSegment == '..')
		aOutput.push('');
	if (bAbsPath)
		aOutput.unshift('');
	this.path = aOutput.join('/');
}


/**
 * Serialises the URI to a string
 */
gl.uri.URI.prototype.toString = function() {
	var result = '';
	if (this.scheme)
		result += this.scheme + ':';
	if (this.authority)
		result += '//' + this.authority;
	result += this.path;
	if (this.query)
		result += '?' + this.query;
	if (this.fragment)
		result += '#' + this.fragment;
	return result;
}


/**
 * Unit tests
 */
gl.uri.URIUnit = function() {
	gl.unit.JSUnit.call(this);
}
gl.Class.create(gl.uri.URIUnit, gl.unit.JSUnit);

gl.uri.URIUnit.prototype.tests = [
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

gl.uri.URIUnit.prototype.start = function() {
	this.writeln(
			this.performanceTest()
		);
	var html = this.unitTests();
	var outputDiv = document.getElementById('output');
	outputDiv.innerHTML = html;
	this.end();
}

/*
 * Unit tests
 * See RFC 3986 appendix C
 */
gl.uri.URIUnit.prototype.unitTests = function() {
	// add:
	// absolute URI tests: http://a
	//
	var html = '<table>';
	html += '<tr><th>Base URI</th><th>URI</th><th>Result</th><th>Expected</th><th>Correct</th></tr>';
	for (var i = 0; i < this.tests.length; i++) {
		var test = this.tests[i];
		var sURI = gl.uri.URI.resolve(test[1], test[0]);
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

gl.uri.URIUnit.prototype.performanceTest = function() {
	this.timeStart();
	var oBaseURI = new gl.uri.URI('http://a/b/c/d;p?q');
	for (var i=0; i<10000; i++) {
		gl.uri.URI.resolve('a/.././b', 'http://a/b/c/d;p?q');
//		var oURI = new gl.uri.URI('a/.././b');
//		oURI.resolve(oBaseURI);
	}
	return 'Running 10000x, milliseconds needed: ' + this.timeEnd();
}
