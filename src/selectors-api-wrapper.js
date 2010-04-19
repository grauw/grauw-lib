/**
 * @fileOverview
 * 
 * Class that wraps the Grauw Selectors to provide a Selectors API-like interface.
 * Element selectors only available on browsers that support adding to the Element prototype (i.e. not IE).
 * 
 * Known issues:
 * - Queries with selector groups will not return elements in the correct order.
 * - :hover, :enabled, :disabled, :checked not supported
 * 
 * @author Laurens Holst (http://www.grauw.nl/)
 * 
 *   Copyright 2010 Laurens Holst
 * 
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 * 
 */

if (window.Element) {
	Element.prototype.querySelector = function(sSelector) {
		return parse(sSelector).query(this, true)[0] || null;
	};
	
	Element.prototype.querySelectorAll = function(sSelector) {
		return parse(sSelector).query(this, false);
	};
}

if (window.DocumentFragment) {
	DocumentFragment.prototype.querySelector = function(sSelector) {
		return parse(sSelector).query(this.firstChild, true)[0] || null;
	};
	
	DocumentFragment.prototype.querySelectorAll = function(sSelector) {
		return parse(sSelector).query(this.firstChild, false);
	};
}

document.querySelector = function(sSelector) {
	return parse(sSelector).query(this.documentElement, true)[0] || null;
};

document.querySelectorAll = function(sSelector) {
	return parse(sSelector).query(this.documentElement, false);
};

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
