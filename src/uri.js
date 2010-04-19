gl.module('gl.uri', [], function() {
	
	/**
	 * Constructs a URI object.
	 * @constructor
	 * @class Implementation of URI parsing and base URI resolving algorithm in RFC 3986.
	 * @param {string|URI} uri A string or URI object to create the object from.
	 */
	var URI = function(vURI) {
		if (vURI instanceof URI) {	// copy constructor
			this.scheme = vURI.scheme;
			this.authority = vURI.authority;
			this.path = vURI.path;
			this.query = vURI.query;
			this.fragment = vURI.fragment;
		} else if (vURI) { // vURI is URI string or cast to string
			var c = oParseRegex.exec(vURI);
			this.scheme = c[1];
			this.authority = c[2];
			this.path = c[3];
			this.query = c[4];
			this.fragment = c[5];
		}
	};
	this.URI = URI;
	
	// Initial values on the prototype
	URI.prototype.scheme    = null;
	URI.prototype.authority = null;
	URI.prototype.path      = '';
	URI.prototype.query     = null;
	URI.prototype.fragment  = null;
	
	// Regular expression from RFC 2396 appendix B
	var oParseRegex = new RegExp('^(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*)(?:\\?([^#]*))?(?:#(.*))?');
	
	/**
	 * Resolves a relative URI against an absolute base URI.
	 * Convenience method.
	 * @param {String} uri the relative URI to resolve
	 * @param {String} baseURI the base URI (must be absolute) to resolve against
	 */
	URI.resolve = function(sURI, sBaseURI) {
		var oURI = hCache[sURI] || (hCache[sURI] = new URI(sURI));
		var oBaseURI = hCache[sBaseURI] || (hCache[sBaseURI] = new URI(sBaseURI));
		return oURI.resolve(oBaseURI).toString();
	};
	
	var hCache = {};
	
	/**
	 * Tests whether the URI is an absolute URI.
	 * See RFC 3986 section 4.3.
	 */
	URI.prototype.isAbsolute = function() {
		return this.scheme && !this.fragment;
	};
	
	///**
	//* Extensive validation of the URI against the ABNF in RFC 3986
	//*/
	//URI.prototype.validate
	
	/**
	 * Tests whether the URI is a same-document reference.
	 * See RFC 3986 section 4.4.
	 * 
	 * To perform more thorough comparison, you can normalise the URI objects.
	 */
	URI.prototype.isSameDocumentAs = function(oURI) {
		return oURI.scheme == this.scheme &&
		    oURI.authority == this.authority &&
		         oURI.path == this.path &&
		        oURI.query == this.query;
	};
	
	/**
	 * Simple String Comparison of two URIs.
	 * See RFC 3986 section 6.2.1.
	 * 
	 * To perform more thorough comparison, you can normalise the URI objects.
	 */
	URI.prototype.equals = function(oURI) {
		return this.isSameDocumentAs(oURI) && oURI.fragment == this.fragment;
	};
	
	/**
	 * Normalizes the URI using syntax-based normalization.
	 * This includes case normalization, percent-encoding normalization and path segment normalization.
	 * XXX: Percent-encoding normalization does not escape characters that need to be escaped.
	 *      (Although that would not be a valid URI in the first place. See validate().)
	 * See RFC 3986 section 6.2.2.
	 */
	URI.prototype.normalize = function() {
		this.removeDotSegments();
		if (this.scheme)
			this.scheme = this.scheme.toLowerCase();
		if (this.authority)
			this.authority = this.authority.replace(oAuthorityRegex, fAuthority).
									replace(oCaseRegex, fCase);
		if (this.path)
			this.path = this.path.replace(oCaseRegex, fCase);
		if (this.query)
			this.query = this.query.replace(oCaseRegex, fCase);
		if (this.fragment)
			this.fragment = this.fragment.replace(oCaseRegex, fCase);
	};
	
	var oCaseRegex = /%[0-9a-z]{2}/gi;
	var oPercentRegex = /[a-zA-Z0-9\-\._~]/;
	var oAuthorityRegex = /(.*@)?([^@:]*)(:.*)?/;
	
	function fCase(sStr) {
		var sDec = unescape(sStr);
		return oPercentRegex.test(sDec) ? sDec : sStr.toUpperCase();
	}
	
	function fAuthority(sStr, p1, p2, p3) {
		return (p1 || '') + p2.toLowerCase() + (p3 || '');
	}
	
	/**
	 * Resolve a relative URI (this) against a base URI.
	 * The base URI must be an absolute URI.
	 * See RFC 3986 section 5.2
	 */
	URI.prototype.resolve = function(oBaseURI) {
		var oURI = new URI();
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
	URI.prototype.removeDotSegments = function() {
		var aInput = this.path.split('/'),
			aOutput = [],
			sSegment,
			bAbsPath = aInput[0] == '';
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
	 * Serialises the URI to a string.
	 */
	URI.prototype.toString = function() {
		var sResult = '';
		if (this.scheme)
			sResult += this.scheme + ':';
		if (this.authority)
			sResult += '//' + this.authority;
		sResult += this.path;
		if (this.query)
			sResult += '?' + this.query;
		if (this.fragment)
			sResult += '#' + this.fragment;
		return sResult;
	};

});
