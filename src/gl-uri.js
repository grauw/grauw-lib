if (!window.gl)
	gl = {};
if (!gl.uri)
	gl.uri = {};

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
};

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
	var oURI = gl.uri.URI._cache[sURI] || (gl.uri.URI._cache[sURI] = new gl.uri.URI(sURI));
	var oBaseURI = gl.uri.URI._cache[sBaseURI] || (gl.uri.URI._cache[sBaseURI] = new gl.uri.URI(sBaseURI));
	return oURI.resolve(oBaseURI).toString();
};

gl.uri.URI._cache = {};

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
};

/**
 * Checks for the restriction described in RFC 3986 section 4.3
 */
gl.uri.URI.prototype.isAbsolute = function() {
	return this.scheme && !this.fragment;
};

///**
//* Extensive validation of the URI against the ABNF in RFC 3986
//*/
//gl.uri.URI.prototype.validate

/**
 * Checks whether the URI is a same-document reference
 * See RFC 3986 section 4.4
 * 
 * To perform more thorough comparison, you can normalise the URI objects.
 */
gl.uri.URI.prototype.isSameDocumentAs = function(oURI) {
	return oURI.scheme == this.scheme &&
	    oURI.authority == this.authority &&
	         oURI.path == this.path &&
	        oURI.query == this.query;
};

/**
 * Simple String Comparison of two URIs
 * See RFC 3986 section 6.2.1
 * 
 * To perform more thorough comparison, you can normalise the URI objects.
 */
gl.uri.URI.prototype.equals = function(oURI) {
	return this.isSameDocumentAs(oURI) && oURI.fragment == this.fragment;
};

/**
 * Normalizes the URI
 * See RFC 3986 section 6.2.2
 */
gl.uri.URI.prototype.normalize = function() {
	this.removeDotSegments();
	if (this.scheme)
		this.scheme = this.scheme.toLowerCase();
	if (this.authority)
		this.authority = this.authority.replace(gl.uri.URI._authorityRegex, gl.uri.URI._authorityFn).
								replace(gl.uri.URI._caseRegex, gl.uri.URI._caseFn);
	if (this.path)
		this.path = this.path.replace(gl.uri.URI._caseRegex, gl.uri.URI._caseFn);
	if (this.query)
		this.query = this.query.replace(gl.uri.URI._caseRegex, gl.uri.URI._caseFn);
	if (this.fragment)
		this.fragment = this.fragment.replace(gl.uri.URI._caseRegex, gl.uri.URI._caseFn);
};

gl.uri.URI._caseRegex = /%[0-9a-z]{2}/gi;
gl.uri.URI._percentRegex = /[a-zA-Z0-9\-\._~]/;
gl.uri.URI._authorityRegex = /(.*@)?([^@:]*)(:.*)?/;

gl.uri.URI._caseFn = function(sStr) {
	var sDec = unescape(sStr);
	return gl.uri.URI._percentRegex.test(sDec) ? sDec : sStr.toUpperCase();
};

gl.uri.URI._authorityFn = function(sStr, p1, p2, p3) {
	return p1 + p2.toLowerCase() + p3;
};


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
};

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
};


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
};
