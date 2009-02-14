/**
 * @fileoverview
 * 
 * Class that wraps the Grauw Selectors to provide a Selectors API-like interface.
 * Element selectors only available on browsers that support adding to the Element prototype (i.e. not IE).
 * 
 * Known issues:
 * - Queries with selector groups will not return elements in the correct order.
 * 
 * Selector problems exposed by John Resig’s test suite:
 * - :not not supported yet
 * - :hover not supported
 * - escaping #, [, : and . not supported yet
 */

Element.prototype.querySelector = function(sSelector) {
	return parse(sSelector).query(this, true)[0] || null;
}

Element.prototype.querySelectorAll = function(sSelector) {
	return parse(sSelector).query(this, false);
}

DocumentFragment.prototype.querySelector = function(sSelector) {
	return parse(sSelector).query(this.firstChild, true)[0] || null;
}

DocumentFragment.prototype.querySelectorAll = function(sSelector) {
	return parse(sSelector).query(this.firstChild, false);
}

document.querySelector = function(sSelector) {
	return parse(sSelector).query(this.documentElement, true)[0] || null;
}

document.querySelectorAll = function(sSelector) {
	return parse(sSelector).query(this.documentElement, false);
}

function parse(sSelector) {
	if (!sSelector)
		throw syntax_err(sSelector);
	try {
		sSelector = sSelector.replace(/^\s+/, '').replace(/\s+$/, '');
		var oSelector = gl.selector.parser.parse(sSelector);
	} catch(e) {
		if (e instanceof gl.selector.ParsingException)
			throw syntax_err(sSelector);
		else
			throw e;
	}
	return oSelector;
}

function syntax_err(sSelector) {
	var oException = new Error('Selector parse error: ' + sSelector);
	oException.code = DOMException.SYNTAX_ERR;
	return oException;
}
