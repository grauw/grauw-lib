/**
 * @fileoverview
 * 
 * Grauw CSS Selectors
 * 
 * Public methods:
 * - gl.selector.match(node, selector)
 * - gl.selector.query(node, selector)
 * - gl.selector.queryAll(node, selector)
 * - gl.selector.queryAncestor(node, selector)
 * 
 * See: http://www.grauw.nl/projects/pc/selectors/
 * 
 * @version 1.0.8
 * @author L. Holst (http://www.grauw.nl/)
 * 
 *   Copyright 2008 Laurens Holst
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

if (!window.gl)
	gl = {};

/**
 * The main CSS Selectors object.
 * Acts as sort of a namespace; all other selector objects are closures of the instance of this object.
 */
gl.selector = new function() {

	var oThis = this;	// to make references to this class without hard coding the actual name

	var browser_ie = !!window.ActiveXObject;
	var browser_webkit = navigator.userAgent.indexOf('AppleWebKit') != -1;

	function extend(fConstructor, cBase) {
		// create new prototype object that inherits from cBase
		var cPrototype = new Function;
		cPrototype.prototype = (cBase || Object).prototype;
		fConstructor.prototype = new cPrototype;
		fConstructor.prototype.constructor = fConstructor;
		return fConstructor;
	}

	/**
	 * Helper function for cross-browser hasAttribute
	 */
	function hasAttribute(oNode, sName) {
		if (browser_ie) {
			var oAttr = oNode.attributes[sName];
			return !!oAttr && oAttr.specified;
		}
		return oNode.hasAttribute(sName);
	}

	/**
	 * Helper function for cross-browser getAttribute
	 */
	function getAttribute(oNode, sName) {
		if (browser_ie) {
			var oAttr = oNode.attributes[sName];
			return oAttr ? oAttr.nodeValue : '';
		}
		return oNode.getAttribute(sName) || '';
	}


	/**
	 * Matches a node against a CSS selector or selector group.
	 * Supports all CSS3 Selectors, except for pseudo-elements and the following
	 * pseuro-classes: :link, :visited, :hover, :active, :focus.
	 * @param node The node
	 * @param selector The selector
	 * @return true if the selector matches.
	 */
	this.match = function(oNode, sSelector) {
		var oSelectorGroup = oThis.parser.parse(sSelector);
		return oSelectorGroup ? oSelectorGroup.match(oNode) : false;
	}

	/**
	 * Queries a CSS selector or selector group against a node.
	 * @param node The node
	 * @param selector The selector
	 * @return An array containing the selected nodes.
	 */
	this.queryAll = function(oNode, sSelector) {
		if (oNode.nodeType == 9)
			oNode = oNode.documentElement;
		var oSelectorGroup = oThis.parser.parse(sSelector);
		return oSelectorGroup ? oSelectorGroup.query(oNode, false) : [];
	}

	/**
	 * Queries a CSS selector or selector group against a node and returns one node.
	 * @param node The node
	 * @param selector The selector
	 * @return The selected node.
	 */
	this.query = function(oNode, sSelector) {
		if (oNode.nodeType == 9)
			oNode = oNode.documentElement;
		var oSelectorGroup = oThis.parser.parse(sSelector);
		var aResult = oSelectorGroup ? oSelectorGroup.query(oNode, true) : [];
		return aResult.length ? aResult[0] : null;
	}

	/**
	 * Use a CSS selector to return the first selection found on a node or subsequent ancestors.
	 * @param node The node
	 * @param selector The selector
	 * @param stop Stop querying after arriving at this node (optional)
	 * @return The selected node.
	 */
	this.queryAncestor = function(oNode, sSelector, oStop) {
		var oSelectorGroup = oThis.parser.parse(sSelector);
		if (!oSelectorGroup)
			return null;

		while (oNode && oNode.nodeType == 1) {
			if (oSelectorGroup.match(oNode))
				return oNode;
			oNode = oNode.parentNode;
			if (oNode == oStop)
				break;
		}
		return null;
	}

	/**
	 * Queries a CSS selector or selector group against the document and returns one node.
	 * @param selector The selector
	 * @return The selected node.
	 */
	this.queryDocument = function(sSelector) {
		return oThis.query(document.documentElement, sSelector);
	}

	/**
	 * Queries a CSS selector or selector group against the document.
	 * @param selector The selector
	 * @return Array containing the selected nodes.
	 */
	this.queryDocumentAll = function(sSelector) {
		return oThis.queryAll(document.documentElement, sSelector);
	}





	/**
	 * SelectorGroup class
	 * See: http://www.w3.org/TR/css3-selectors/#selector-syntax
	 */
	var SelectorGroup = function() {
		this.selectors = [];
	}
	this.SelectorGroup = extend(SelectorGroup, Object);

	/**
	 * Add a selector to the selector group.
	 * @param selector The selector
	 */
	SelectorGroup.prototype.add = function(oSelector) {
		if (!oSelector instanceof Selector)
			throw new Error('Parameter must be instance of Selector!');
		this.selectors[this.selectors.length] = oSelector;
	}

	/**
	 * Check whether the selector is in a valid final state.
	 * @return true if valid final state
	 */
	SelectorGroup.prototype.validate = function() {
		var iLen = this.selectors.length,
			bValid = iLen > 0;
		for (var i = 0; i < iLen && bValid; i++)
			bValid = this.selectors[i].validate();
		return bValid;
	}

	/**
	 * Matches a node against a selector group.
	 * @param node The node
	 * @return true if the selector matches.
	 */
	SelectorGroup.prototype.match = function(oNode) {
		var oSelector,
			iStart,
			bMatch = false;
		for (var i = 0, iLen = this.selectors.length; i < iLen && !bMatch; i++) {
			oSelector = this.selectors[i];
			bMatch = oSelector.match(oNode);
		}
		return bMatch;
	}

	/**
	 * Queries a CSS selector group against a node.
	 * @param node The node
	 * @param singleResult If true, returns immediately when first match is found.
	 * @return The result array
	 */
	SelectorGroup.prototype.query = function(oNode, bSingleResult) {
		var aResult = [],
			bMatch = false;
		for (var i = 0, iLen = this.selectors.length; i < iLen && !(bSingleResult && bMatch); i++)
			bMatch = this.selectors[i].query(oNode, aResult, bSingleResult) || bMatch;
		// reset __queryResult variable
		for (var i = 0, iLen = aResult.length; i < iLen; i++)
			aResult[i].__queryResult = false;
		return aResult;
	}




	/**
	 * Selector class
	 * See: http://www.w3.org/TR/css3-selectors/#selectors
	 */
	var Selector = function() {
		this.combinators = [];
	}
	this.Selector = extend(Selector, Object);

	/**
	 * Add a combinator to the selector.
	 * @param combinator The combinator
	 */
	Selector.prototype.add = function(oCombinator) {
		if (!oCombinator instanceof Combinator)
			throw new Error('Parameter must be instance of Combinator!');
		var iLen = this.combinators.length;
		if (iLen > 0) {
			this.combinators[iLen - 1].nextCombinator = oCombinator;
			oCombinator.previousCombinator = this.combinators[iLen - 1];
		}
		this.combinators[iLen] = oCombinator;
	}

	/**
	 * Check whether the selector is in a valid final state.
	 * @return true if valid final state
	 */
	Selector.prototype.validate = function() {
		var iLen = this.combinators.length,
			bValid = iLen > 0,
			oCombinator;
		for (var i = 0; i < iLen && bValid; i++) {
			oCombinator = this.combinators[i];
			bValid = ((i == 0 && oCombinator.type == Combinator.ROOT) ||
					 (i > 0 && oCombinator.type != Combinator.ROOT)) &&
					oCombinator.validate();
		}
		return bValid;
	}

	/**
	 * Matches a node against a selector.
	 * @param node The node
	 * @return true if the selector matches.
	 */
	Selector.prototype.match = function(oNode) {
		return this.combinators[this.combinators.length - 1].match(oNode);
	}

	/**
	 * Queries a CSS selector group against a node.
	 * @param node The node
	 * @param result The result array
	 * @param singleResult If true, returns immediately when first match is found.
	 * @return true if at least one match
	 */
	Selector.prototype.query = function(oNode, aResult, bSingleResult) {
		return this.combinators[0].query(oNode, aResult, bSingleResult);
	}




	/**
	 * Combinator class
	 * See: http://www.w3.org/TR/css3-selectors/#combinators
	 */
	var Combinator = function(iType) {
		this.type = iType;
		this.matchFunction = this.matchCombinator[iType];
		this.queryFunction = this.queryCombinator[iType];
		this.simpleSelectors = [];
		this.nextCombinator = null;
		this.previousCombinator = null;
	}
	this.Combinator = extend(Combinator, Object);

	// type constants
	Combinator.DESCENDANT = 1;
	Combinator.CHILD      = 2;
	Combinator.ADJACENT   = 3;
	Combinator.SIBLING    = 4;
	Combinator.ROOT       = 5;	// not a real combinator, but corresponds to self-or-descendant

	/**
	 * Add a simpleSelector to the combinator.
	 * @param simpleSelector The simple selector
	 */
	Combinator.prototype.add = function(oSimpleSelector) {
		if (!oSimpleSelector instanceof SimpleSelector)
			throw new Error('Parameter must be instance of SimpleSelector!');
		this.simpleSelectors[this.simpleSelectors.length] = oSimpleSelector;
	}

	/**
	 * Check whether the combinator is in a valid final state.
	 * @return true if valid final state
	 */
	Combinator.prototype.validate = function() {
		var iLen = this.simpleSelectors.length,
			bValid = iLen > 0,
			oSimpleSelector;
		for (var i = 0; i < iLen && bValid; i++) {
			oSimpleSelector = this.simpleSelectors[i];
			bValid = (i == 0 || oSimpleSelector.type != SimpleSelector.UNIVERSAL) &&
					(i == 0 || oSimpleSelector.type != SimpleSelector.TYPE) &&
					oSimpleSelector.validate();
		}
		return bValid;
	}

	/**
	 * Matches a node against a combinator.
	 * @param node The node
	 * @param start The first simple selector to match
	 * @return true if the selector matches.
	 */
	Combinator.prototype.matchSimpleSelectors = function(oNode, iStart) {
		var bMatch = true;
		for (var i = iStart || 0, iLen = this.simpleSelectors.length; i < iLen && bMatch; i++)
			bMatch = this.simpleSelectors[i].match(oNode);
		return bMatch;
	}

	/**
	 * Matches a node against a combinator, and adds it to the query results when it matches.
	 * @param node The node
	 * @param result The result array
	 * @param singleResult If true, returns immediately when first match is found.
	 * @param start The first simpleSelector to match (used to skip selectors that have already been satisfied)
	 * @return true if the selector matches.
	 */
	Combinator.prototype.querySimpleSelectors = function(oNode, aResult, bSingleResult, iStart) {
		if (!this.nextCombinator) {
			// if last combinator
			if (!oNode.__queryResult && this.matchSimpleSelectors(oNode, iStart)) {
				// __queryResult makes sure it never returns an element more than once
				aResult[aResult.length] = oNode;
				return oNode.__queryResult = true;
			}
			// if already matched before, pretend it doesn't match and skip
			return false;
		}
		if (this.matchSimpleSelectors(oNode, iStart))
			return this.nextCombinator.query(oNode, aResult, bSingleResult);
		return false;
	}

	/**
	 * Matches a node against a combinator.
	 * @param node The node
	 * @return true if the selector matches.
	 */
	Combinator.prototype.match = function(oNode) {
		var bMatch = this.matchSimpleSelectors(oNode);
		if (!bMatch)
			return false;
		if (this.type == this.ROOT)
			return true;

		return this.matchFunction(oNode);
	}

	/**
	 * Queries a CSS selector group against a selector.
	 */
	Combinator.prototype.query = function(oNode, aResult, bSingleResult) {
		return this.queryFunction(oNode, aResult, bSingleResult);
	}

	/**
	 * Array of matching combinators
	 */
	Combinator.prototype.matchCombinator = function() {
		var mc = [];
		mc[Combinator.DESCENDANT] = function(oNode) {
			var bMatch = false;
			while (!bMatch && (oNode = oNode.parentNode) && oNode.nodeType == 1)
				bMatch = this.previousCombinator.match(oNode);
			return bMatch;
		}
		mc[Combinator.CHILD] = function(oNode) {
			return !!(oNode = oNode.parentNode) && oNode.nodeType == 1 && this.previousCombinator.match(oNode);
		}
		mc[Combinator.ADJACENT] = function(oNode) {
			while ((oNode = oNode.previousSibling) && oNode.nodeType != 1)
				;
			return !!oNode && this.previousCombinator.match(oNode);
		}
		mc[Combinator.SIBLING] = function(oNode) {
			var bMatch = false;
			while (!bMatch && (oNode = oNode.previousSibling)) {
				if (oNode.nodeType == 1)
					bMatch = this.previousCombinator.match(oNode);
			}
			return bMatch;
		}
		mc[Combinator.ROOT] = null;
		return mc;
	}();

	/**
	 * Array of querying combinators
	 */
	Combinator.prototype.queryCombinator = function() {
		var qc = [];
		qc[Combinator.DESCENDANT] = function(oNode, aResult, bSingleResult) {
			var aNodes,
				oSimpleSelector = this.simpleSelectors[0],
				iStart = 0;
			// Note: possible Firefox optimisation: use .getElementsByClassName
			if (oSimpleSelector.type == SimpleSelector.TYPE) {
				aNodes = oNode.getElementsByTagName(oSimpleSelector.arg1);
				iStart++;
			} else {
				if (oSimpleSelector.type == SimpleSelector.ID) {
					var oNode2 = oNode.ownerDocument.getElementById(oSimpleSelector.arg1);
					if (oNode2 && (oNode.contains ? oNode2 != oNode && oNode.contains(oNode2) : !!(oNode.compareDocumentPosition(oNode2) & 16)))
						return this.querySimpleSelectors(oNode2, aResult, bSingleResult, 1);
				}
				aNodes = oNode.all || oNode.getElementsByTagName('*');
			}
			var bMatch = false;
			for (var i = 0, iLen = aNodes.length; i < iLen && !(bSingleResult && bMatch); i++) {
				bMatch = this.querySimpleSelectors(aNodes[i], aResult, bSingleResult, iStart) || bMatch;
			}
			return bMatch;
		}
		qc[Combinator.CHILD] = function(oNode, aResult, bSingleResult) {
			var aNodes,
				oSimpleSelector = this.simpleSelectors[0],
				iStart = 0;
			if (oNode.children && !browser_webkit && oSimpleSelector.type == SimpleSelector.TYPE) {
				aNodes = oNode.children.tags(oSimpleSelector.arg1);
				iStart++;
			} else {
				if (oSimpleSelector.type == SimpleSelector.ID) {
					var oNode2 = oNode.ownerDocument.getElementById(oSimpleSelector.arg1);
					if (oNode2.parentNode == oNode)
						return this.querySimpleSelectors(oNode2, aResult, bSingleResult, 1);
				}
				aNodes = oNode.childNodes;
			}
			var bMatch = false;
			for (var i = 0, iLen = aNodes.length; i < iLen && !(bSingleResult && bMatch); i++) {
				if (aNodes[i].nodeType == 1)
					bMatch = this.querySimpleSelectors(aNodes[i], aResult, bSingleResult, iStart) || bMatch;
			}
			return bMatch;
		}
		qc[Combinator.ADJACENT] = function(oNode, aResult, bSingleResult) {
			while (oNode = oNode.nextSibling) {
				if (oNode.nodeType == 1) {
					return this.querySimpleSelectors(oNode, aResult, bSingleResult, 0);
				}
			}
			return false;
		}
		qc[Combinator.SIBLING] = function(oNode, aResult, bSingleResult) {
			var bMatch = false;
			while ((oNode = oNode.nextSibling) && !(bSingleResult && bMatch)) {
				if (oNode.nodeType == 1)
					bMatch = this.querySimpleSelectors(oNode, aResult, bSingleResult, 0) || bMatch;
			}
			return bMatch;
		}
		qc[Combinator.ROOT] = function(oNode, aResult, bSingleResult) {
			var bMatch = this.querySimpleSelectors(oNode, aResult, bSingleResult, 0);
			return qc[Combinator.DESCENDANT].call(this, oNode, aResult, bSingleResult) || bMatch;
		}
		return qc;
	}();





	/**
	 * Simple selector class
	 * See: http://www.w3.org/TR/css3-selectors/#simple-selectors
	 */
	var SimpleSelector = function(iType, sArg1, sArg2) {
		this.type = iType;
		this.match = this.matcher[iType];
		this.arg1 = sArg1;
		this.arg2 = sArg2;
	}
	this.SimpleSelector = extend(SimpleSelector, Object);

	// type constants
	SimpleSelector.UNIVERSAL               = 1;
	SimpleSelector.TYPE                    = 2;
	SimpleSelector.ATTRIBUTE_EXIST         = 3;
	SimpleSelector.ATTRIBUTE_EQUALS        = 4;
	SimpleSelector.ATTRIBUTE_LIST          = 5;
	SimpleSelector.ATTRIBUTE_LANG          = 6;
	SimpleSelector.ATTRIBUTE_STARTS        = 7;
	SimpleSelector.ATTRIBUTE_ENDS          = 8;
	SimpleSelector.ATTRIBUTE_CONTAINS      = 9;
	SimpleSelector.CLASS                   = 10;
	SimpleSelector.ID                      = 11;
	SimpleSelector.PSEUDO_ROOT             = 12;
	SimpleSelector.PSEUDO_NTH_CHILD        = 13;
	SimpleSelector.PSEUDO_NTH_LAST_CHILD   = 14;
	SimpleSelector.PSEUDO_NTH_OF_TYPE      = 15;
	SimpleSelector.PSEUDO_NTH_LAST_OF_TYPE = 16;
	SimpleSelector.PSEUDO_FIRST_CHILD      = 17;
	SimpleSelector.PSEUDO_LAST_CHILD       = 18;
	SimpleSelector.PSEUDO_FIRST_OF_TYPE    = 19;
	SimpleSelector.PSEUDO_LAST_OF_TYPE     = 20;
	SimpleSelector.PSEUDO_ONLY_CHILD       = 21;
	SimpleSelector.PSEUDO_ONLY_OF_TYPE     = 22;
	SimpleSelector.PSEUDO_EMPTY            = 23;
	SimpleSelector.PSEUDO_LANG             = 24;
	SimpleSelector.PSEUDO_ENABLED          = 25;
	SimpleSelector.PSEUDO_DISABLED         = 26;
	SimpleSelector.PSEUDO_CHECKED          = 27;
	SimpleSelector.PSEUDO_READ_ONLY        = 28;
	SimpleSelector.PSEUDO_READ_WRITE       = 29;
	SimpleSelector.PSEUDO_TARGET           = 30;
	SimpleSelector.PSEUDO_NOT              = 31;

	/**
	 * Check whether the simpleSelector is in a valid final state.
	 * @return true if valid final state
	 */
	SimpleSelector.prototype.validate = function() {
		return true;
	};

	/**
	 * Matches a node against a simple selector.
	 * Note: Be sure that node exists before calling! No check here.
	 * @param node The node
	 * @return true if the selector matches.
	 */
	SimpleSelector.prototype.match = function(oNode) {
		return this.matcher[this.type].call(this, oNode);
	};

	/**
	 * Array of simple selector matching functions
	 */
	SimpleSelector.prototype.matcher = function() {
		var m = [];
		m[SimpleSelector.UNIVERSAL] = function(oNode) {
			return true;
		}
		m[SimpleSelector.TYPE] = function(oNode) {
			var bXHTML = oNode.namespaceURI && oNode.namespaceURI != 'http://www.w3.org/1999/xhtml';
			var sNodeName =  bXHTML ? oNode.nodeName : oNode.nodeName.toLowerCase();
			var sSelectorName = bXHTML ? this.arg1 : this.arg1.toLowerCase();
			return sNodeName == sSelectorName;
		}
		m[SimpleSelector.CLASS] = function(oNode) {
			return this.classRegexp.test(oNode.className);
		}
		m[SimpleSelector.ID] = function(oNode) {
			return oNode.getAttribute('id') == this.arg1;
		}
		m[SimpleSelector.ATTRIBUTE_EXIST] = function(oNode) {
			return hasAttribute(oNode, this.arg1);
		}
		m[SimpleSelector.ATTRIBUTE_EQUALS] = function(oNode) {
			return getAttribute(oNode, this.arg1) == this.arg2;
		}
		m[SimpleSelector.ATTRIBUTE_LIST] = function(oNode) {
			return this.arg2 && this.attrListRegexp.test(getAttribute(oNode, this.arg1));
		}
		m[SimpleSelector.ATTRIBUTE_LANG] = function(oNode) {
			var sAttrValue = getAttribute(oNode, this.arg1);
			return sAttrValue.toLowerCase().indexOf(this.arg2.toLowerCase()) == 0 &&
					(this.arg2.length == sAttrValue.length || sAttrValue.charAt(this.arg2.length) == '-');
		}
		m[SimpleSelector.ATTRIBUTE_STARTS] = function(oNode) {
			return this.arg2 && getAttribute(oNode, this.arg1).indexOf(this.arg2) == 0;
		}
		m[SimpleSelector.ATTRIBUTE_ENDS] = function(oNode) {
			var sAttrValue = getAttribute(oNode, this.arg1);
			return this.arg2 && sAttrValue.indexOf(this.arg2) == (sAttrValue.length - this.arg2.length);
		}
		m[SimpleSelector.ATTRIBUTE_CONTAINS] = function(oNode) {
			return this.arg2 && getAttribute(oNode, this.arg1).indexOf(this.arg2) != -1;
		}
		m[SimpleSelector.PSEUDO_ROOT] = function(oNode) {
			return oNode.ownerDocument.documentElement == oNode;
		}
		m[SimpleSelector.PSEUDO_NTH_CHILD] = function(oNode) {
			var iCount = 1, a = this.arg1, b = this.arg2;
			if (a == 1 && b == 0)
				return true;
			while ((oNode = oNode.previousSibling) && (a > 0 || iCount <= b))
				if (oNode.nodeType == 1)
					iCount++;
			return a > 0 ? (iCount - b) % a == 0 : a < 0 ? iCount <= b && iCount % a == 0 : iCount - b == 0;
		}
		m[SimpleSelector.PSEUDO_NTH_LAST_CHILD] = function(oNode) {
			var iCount = 1, a = this.arg1, b = this.arg2;
			if (a == 1 && b == 0)
				return true;
			while ((oNode = oNode.nextSibling) && (a > 0 || iCount <= b))
				if (oNode.nodeType == 1)
					iCount++;
			return a > 0 ? (iCount - b) % a == 0 : a < 0 ? iCount <= b && iCount % a == 0 : iCount - b == 0;
		}
		m[SimpleSelector.PSEUDO_NTH_OF_TYPE] = function(oNode) {
			var iCount = 1, a = this.arg1, b = this.arg2, sNodeName = oNode.nodeName;
			if (a == 1 && b == 0)
				return true;
			while ((oNode = oNode.previousSibling) && (a > 0 || iCount <= b))
				if (oNode.nodeType == 1 && oNode.nodeName == sNodeName)
					iCount++;
			return a > 0 ? (iCount - b) % a == 0 : a < 0 ? iCount <= b && iCount % a == 0 : iCount - b == 0;
		}
		m[SimpleSelector.PSEUDO_NTH_LAST_OF_TYPE] = function(oNode) {
			var iCount = 1, a = this.arg1, b = this.arg2, sNodeName = oNode.nodeName;
			if (a == 1 && b == 0)
				return true;
			while ((oNode = oNode.nextSibling) && (a > 0 || iCount <= b))
				if (oNode.nodeType == 1 && oNode.nodeName == sNodeName)
					iCount++;
			return a > 0 ? (iCount - b) % a == 0 : a < 0 ? iCount <= b && iCount % a == 0 : iCount - b == 0;
		}
		m[SimpleSelector.PSEUDO_FIRST_CHILD] = function(oNode) {
			do
				oNode = oNode.previousSibling;
			while (oNode && oNode.nodeType != 1);
			return !oNode;
		}
		m[SimpleSelector.PSEUDO_LAST_CHILD] = function(oNode) {
			do
				oNode = oNode.nextSibling;
			while (oNode && oNode.nodeType != 1);
			return !oNode;
		}
		m[SimpleSelector.PSEUDO_FIRST_OF_TYPE] = function(oNode) {
			var sNodeName = oNode.nodeName;
			do
				oNode = oNode.previousSibling;
			while (oNode && (oNode.nodeType != 1 || oNode.nodeName != sNodeName));
			return !oNode;
		}
		m[SimpleSelector.PSEUDO_LAST_OF_TYPE] = function(oNode) {
			var sNodeName = oNode.nodeName;
			do
				oNode = oNode.nextSibling;
			while (oNode && (oNode.nodeType != 1 || oNode.nodeName != sNodeName));
			return !oNode;
		}
		m[SimpleSelector.PSEUDO_ONLY_CHILD] = function(oNode) {
			return m[SimpleSelector.PSEUDO_FIRST_CHILD].call(this, oNode, null) &&
					m[SimpleSelector.PSEUDO_LAST_CHILD].call(this, oNode, null);
		}
		m[SimpleSelector.PSEUDO_ONLY_OF_TYPE] = function(oNode) {
			return m[SimpleSelector.PSEUDO_FIRST_OF_TYPE].call(this, oNode, null) &&
					m[SimpleSelector.PSEUDO_LAST_OF_TYPE].call(this, oNode, null);
		}
		m[SimpleSelector.PSEUDO_EMPTY] = function(oNode) {
			oNode = oNode.firstChild;
			while (oNode && oNode.nodeType != 1 && (oNode.nodeType != 3 || oNode.length == 0))
				oNode = oNode.nextSibling;
			return !oNode;
		}
		m[SimpleSelector.PSEUDO_LANG] = function(oNode) {
			var sLang;
			do {
				sLang = oNode.lang || '';
				oNode = oNode.parentNode;
			} while (!sLang && oNode && oNode.nodeType == 1);
			// TODO: add support for language from META element (Content-Language)
			return sLang.toLowerCase().indexOf(this.arg1.toLowerCase()) == 0 &&
					(this.arg1.length == sLang.length || sLang.charAt(this.arg1.length) == '-');
		}
		m[SimpleSelector.PSEUDO_ENABLED] = function(oNode) {
			var sTagName = oNode.tagName.toUpperCase();
			return sTagName != 'LINK' && sTagName != 'STYLE' && 'disabled' in oNode && !oNode.disabled;
		}
		m[SimpleSelector.PSEUDO_DISABLED] = function(oNode) {
			var sTagName = oNode.tagName.toUpperCase();
			return sTagName != 'LINK' && sTagName != 'STYLE' && 'disabled' in oNode && oNode.disabled;
		}
		m[SimpleSelector.PSEUDO_CHECKED] = function(oNode) {
			var sTagName = oNode.tagName.toUpperCase();
			return sTagName == 'INPUT' && oNode.checked || sTagName == 'OPTION' && oNode.selected;
		}
		m[SimpleSelector.PSEUDO_READ_ONLY] = function(oNode) {
			return !('readOnly' in oNode) || oNode.readOnly;
		}
		m[SimpleSelector.PSEUDO_READ_WRITE] = function(oNode) {
			return 'readOnly' in oNode && !oNode.readOnly;
		}
		m[SimpleSelector.PSEUDO_TARGET] = function(oNode) {
			return '#' + oNode.getAttribute('id') == oNode.ownerDocument.location.hash;
		}
		return m;
	}();



	var NotSimpleSelector = function(oSimpleSelector) {
		this.type = SimpleSelector.PSEUDO_NOT;
		if (!oSimpleSelector instanceof SimpleSelector)
			throw new Error('Parameter must be instance of SimpleSelector!');
		this.simpleSelector = oSimpleSelector;
	}
	this.NotSimpleSelector = extend(NotSimpleSelector, SimpleSelector);

	NotSimpleSelector.prototype.validate = function() {
		return !(this.simpleSelector instanceof NotSimpleSelector);
	}

	NotSimpleSelector.prototype.match = function(oNode) {
		return !this.simpleSelector.match(oNode);
	}



	/**
	 * Parser object constructor
	 * @class Parser class
	 * @constructor
	 */
	var Parser = function() {
	}
	this.Parser = extend(Parser, Object);

	/**
	 * Parser regexp macros and patterns for the tokenizer
	 * See: http://www.w3.org/TR/CSS21/syndata.html#tokenization
	 */
	var oPatterns = {};
	// Macros
	oPatterns.w        = '[ \t\r\n\f]*';
	oPatterns.S        = '[ \t\r\n\f]+';
	oPatterns.escape_  = '\\\\[0-9a-fA-F]{1,6}(?:\\r\\n|[ \\n\\r\\t\\f])?|\\\\[^\\n\\r\\f0-9a-fA-F]';
	oPatterns.nlescape = '\\\\(?:\\r\\n|[\\n\\r\\f])';
	oPatterns.ident    = '(?:[-]?(?:[_a-zA-Z]|[^\\0-\\177]|' + oPatterns.escape_ + ')(?:[_a-zA-Z0-9-]|[^\\0-\\177]|' + oPatterns.escape_ + ')*)';
//	oPatterns.ns_ident = '(?:(?:' + oPatterns.ident + '|\\*)?\\|)?' + oPatterns.ident;
	oPatterns.string1  = '\\"(?:[^\\n\\r\\f\\\\"]|' + oPatterns.nlescape + '|' + oPatterns.escape_ + ')*\\"';
	oPatterns.string2  = "\\'(?:[^\\n\\r\\f\\\\']|" + oPatterns.nlescape + "|" + oPatterns.escape_ + ")*\\'";
	oPatterns.string   = '(?:' + oPatterns.string1 + '|' + oPatterns.string2 + ')';
//	oPatterns.nth      = '(?:-?[0-9]*n)?(?:[+\\-][0-9]+)?|odd|even';
	// Simple selectors
	oPatterns.class_     = '\\.' + oPatterns.ident;
	oPatterns.id         = '#' + oPatterns.ident;
	oPatterns.attribute  = '\\[(' + oPatterns.ident + ')(?:([~|\\^\\$*]?=)(' + oPatterns.ident + '|' + oPatterns.string + '))?\\]';
	oPatterns.pseudo     = ':(' + oPatterns.ident + ')(?:\\(([^)]+)\\))?';
	oPatterns.universal  = '\\*';				// '(?:' + oPatterns.ident + '\\|)\\*'
	oPatterns.element    = oPatterns.ident;		// oPatterns.ns_ident
	// Combinators
	// Note: combinators must be placed inbetween two \s* patterns
	oPatterns.child      = oPatterns.w + '>' + oPatterns.w;
	oPatterns.adjacent   = oPatterns.w + '\\+' + oPatterns.w;
	oPatterns.sibling    = oPatterns.w + '~' + oPatterns.w;
	oPatterns.comma      = oPatterns.w + ',' + oPatterns.w;
	oPatterns.descendant = oPatterns.S;
	oPatterns.negation   = ':not\\((?:' + [oPatterns.class_, oPatterns.id, oPatterns.attribute, 
	                                       oPatterns.pseudo, oPatterns.universal,
	                                       oPatterns.element].join('|') + ')\\)';
	Parser.pattern = oPatterns;


	/**
	 * Regular expression objects for patterns
	 */
	Parser.regexp = {};
	Parser.regexp.selector = new RegExp([
				oPatterns.class_,		// first all selectors
				oPatterns.id,
				oPatterns.attribute,
				oPatterns.negation,
				oPatterns.pseudo,
				oPatterns.universal,
				oPatterns.element,
				oPatterns.child,		// then the combinators
				oPatterns.adjacent,
				oPatterns.sibling,
				oPatterns.comma,
				oPatterns.descendant	// descendant combinator must be last
			].join('|'), 'g');
	Parser.regexp.attribute    = new RegExp(oPatterns.attribute);
	Parser.regexp.nlescape     = new RegExp(oPatterns.nlescape, 'g');
	Parser.regexp.pseudo       = new RegExp(oPatterns.pseudo);
	Parser.regexp.trim         = /^\s+|\s+$/gm;
	Parser.regexp.escapeCSS    = /\\([^\n\r\f0-9a-fA-F])|\\([0-9a-fA-F]{1,6})(?:\r\n|[ \n\r\t\f])?/g;
	Parser.regexp.escapeRegexp = /([\[\\\^\$\.\|\?\*\+\(\)\{\}])/g;
	Parser.regexp.whiteSpace   = /\s/;

	Parser.attrTypeMap = {
			'=' : SimpleSelector.ATTRIBUTE_EQUALS,
			'~=': SimpleSelector.ATTRIBUTE_LIST,
			'|=': SimpleSelector.ATTRIBUTE_LANG,
			'^=': SimpleSelector.ATTRIBUTE_STARTS,
			'$=': SimpleSelector.ATTRIBUTE_ENDS,
			'*=': SimpleSelector.ATTRIBUTE_CONTAINS
		};

	Parser.pseudoTypeMap = {
			'root'            : SimpleSelector.PSEUDO_ROOT,
			'nth-child'       : SimpleSelector.PSEUDO_NTH_CHILD,
			'nth-last-child'  : SimpleSelector.PSEUDO_NTH_LAST_CHILD,
			'nth-of-type'     : SimpleSelector.PSEUDO_NTH_OF_TYPE,
			'nth-last-of-type': SimpleSelector.PSEUDO_NTH_LAST_OF_TYPE,
			'first-child'     : SimpleSelector.PSEUDO_FIRST_CHILD,
			'last-child'      : SimpleSelector.PSEUDO_LAST_CHILD,
			'first-of-type'   : SimpleSelector.PSEUDO_FIRST_OF_TYPE,
			'last-of-type'    : SimpleSelector.PSEUDO_LAST_OF_TYPE,
			'only-child'      : SimpleSelector.PSEUDO_ONLY_CHILD,
			'only-of-type'    : SimpleSelector.PSEUDO_ONLY_OF_TYPE,
			'empty'           : SimpleSelector.PSEUDO_EMPTY,
			'lang'            : SimpleSelector.PSEUDO_LANG,
			'enabled'         : SimpleSelector.PSEUDO_ENABLED,
			'disabled'        : SimpleSelector.PSEUDO_DISABLED,
			'checked'         : SimpleSelector.PSEUDO_CHECKED,
			'read-only'       : SimpleSelector.PSEUDO_READ_ONLY,
			'read-write'      : SimpleSelector.PSEUDO_READ_WRITE,
			'target'          : SimpleSelector.PSEUDO_TARGET,
			'not'             : SimpleSelector.PSEUDO_NOT
		};

	/**
	 * Parses a CSS selector or selector group.
	 * Uses caching to speed up subsequent calls.
	 * @param selector The selector.
	 * @return SelectorGroup object, null if unable to parse the selector (error message in errorMessage property).
	 */
	Parser.prototype.parse = function(sSelector) {
		// segment selector
		var aSelectorParts = sSelector.match(Parser.regexp.selector);
		// check whether selector was parsed completely...
		if (sSelector != aSelectorParts.join(''))
			throw new ParsingException(sSelector);

		// instantiate initial object model
		var oSelectorGroup = new SelectorGroup(),
			oSelector = new Selector(),
			oCombinator = new Combinator(Combinator.ROOT);
		oSelectorGroup.add(oSelector);
		oSelector.add(oCombinator);

		// post-process segments
		for (var i = 0, iLen = aSelectorParts.length; i < iLen; i++) {
			// trim combinators with excessive space, note that descendant combinator becomes ''
			var sSelectorPart = aSelectorParts[i].replace(Parser.regexp.trim, '');
			switch (sSelectorPart.charAt(0)) {
				// selector group
				case ',':
					oSelector = new Selector();
					oCombinator = new Combinator(Combinator.ROOT);
					oSelectorGroup.add(oSelector);
					oSelector.add(oCombinator);
					break;
				// selectors
				case '*':
					oCombinator.add(new SimpleSelector(SimpleSelector.UNIVERSAL));
					break;
				case '.':
					var oSimpleSelector = new SimpleSelector(SimpleSelector.CLASS, Parser.decodeIdent(sSelectorPart.substr(1)));
					oSimpleSelector.classRegexp = new RegExp('(^|\\s)' + Parser.escapeRegexp(oSimpleSelector.arg1) + '($|\\s)');
					oCombinator.add(oSimpleSelector);
					break;
				case '#':
					oCombinator.add(new SimpleSelector(SimpleSelector.ID, Parser.decodeIdent(sSelectorPart.substr(1))));
					break;
				case '[':
					var parsedAttr = Parser.regexp.attribute.exec(sSelectorPart);
					if (!parsedAttr[2]) {
						oCombinator.add(new SimpleSelector(SimpleSelector.ATTRIBUTE_EXIST, Parser.decodeIdent(parsedAttr[1])));
					} else {
						var oSimpleSelector = new SimpleSelector(
								Parser.attrTypeMap[parsedAttr[2]],
								Parser.decodeIdent(parsedAttr[1]),
								parsedAttr[3].charAt(0) == '"' || parsedAttr[3].charAt(0) == "'" ?
									Parser.decodeString(parsedAttr[3]) :
									Parser.decodeIdent(parsedAttr[3])
							);
						if (oSimpleSelector.type == SimpleSelector.ATTRIBUTE_LIST) {
							if (Parser.regexp.whiteSpace.test(oSimpleSelector.arg2))
								oSimpleSelector.attrListRegexp = /$x^/; // regexp that doesn’t match anything
							else
								oSimpleSelector.attrListRegexp = new RegExp('(^|\\s)' + Parser.escapeRegexp(oSimpleSelector.arg2) + '($|\\s)');
						}
						oCombinator.add(oSimpleSelector);
					}
					break;
				case ':':
					var aParsedPseudo = Parser.regexp.pseudo.exec(sSelectorPart),
						sIdentifier = Parser.decodeIdent(aParsedPseudo[1]),
						oSimpleSelector,
						iType = Parser.pseudoTypeMap[sIdentifier];
					if (!iType)
						throw new ParsingException(sSelector);
					if (sIdentifier == 'lang') {
						oSimpleSelector = new SimpleSelector(iType, aParsedPseudo[2]);
					} else if (sIdentifier.indexOf('nth-') == 0) {
						var nth = aParsedPseudo[2],
							a, b, n;
						if (nth == 'odd')
							a = 2, b = 1;
						else if (nth == 'even')
							a = 2, b = 0;
						else {
							n = nth.indexOf('n');
							a = nth.substring(0, n);
							b = nth.substring(n + 1);
							a = n == -1 ? 0 : a == '' ? 1 : a == '-' ? -1 : parseInt(a, 10);
							b = b == '' ? 0 : parseInt(b, 10);
						}
						oSimpleSelector = new SimpleSelector(iType, a, b)
					} else if (sIdentifier == 'not') {
						var oTempGroup = this.parse(aParsedPseudo[2]);
						var oTempCombinator = oTempGroup.selectors[0].combinators[0];
						if (oTempCombinator.simpleSelectors.length != 1)
							throw new ParsingException(sSelector);
						oSimpleSelector = new NotSimpleSelector(oTempCombinator.simpleSelectors[0]);
					} else {
						oSimpleSelector = new SimpleSelector(iType)
					}
					oCombinator.add(oSimpleSelector);
					break;
				// combinators
				case '':
					oCombinator = new Combinator(Combinator.DESCENDANT);
					oSelector.add(oCombinator);
					break;
				case '>':
					oCombinator = new Combinator(Combinator.CHILD);
					oSelector.add(oCombinator);
					break;
				case '+':
					oCombinator = new Combinator(Combinator.ADJACENT);
					oSelector.add(oCombinator);
					break;
				case '~':
					oCombinator = new Combinator(Combinator.SIBLING);
					oSelector.add(oCombinator);
					break;
				// element selector (no single prefix)
				default:
					oCombinator.add(new SimpleSelector(SimpleSelector.TYPE, Parser.decodeIdent(sSelectorPart)));
					break;
			}
		}
		if (!oSelectorGroup.validate())
			throw new ParsingException(sSelector);

		return oSelectorGroup;
	}

	/**
	 * Decode a CSS identifier
	 * @param identifier The identifier
	 * @return Decoded string
	 */
	Parser.decodeIdent = function(sIdentifier) {
		sIdentifier = sIdentifier.replace(Parser.regexp.escapeCSS,
				function(sEsc, sCharacter, sUnicode) {
					if (sCharacter)
						return sCharacter;
					else
						return String.fromCharCode(parseInt(sUnicode, 16));
				}
			);
		return sIdentifier;
	}

	/**
	 * Decode a CSS string
	 * @param string The string (including quotes)
	 * @return Decoded string
	 */
	Parser.decodeString = function(sString) {
		/* Atm this check is not necessary, because
		 * the parser patterns do not allow this...
		var sFirstChar = sString.charAt(0),
			sLastChar = sString.charAt(sString.length - 1);
		if (sString.length < 2 ||
			!((sFirstChar == "'" && sLastChar == "'") ||
		      (sFirstChar == '"' && sLastChar == '"')))
			throw new ParsingException(sString);
		*/
		sString = sString.substring(1, sString.length - 1);
		sString = sString.replace(Parser.regexp.nlescape, '');
		return Parser.decodeIdent(sString);
	}

	/**
	 * Escapes a string for use in a regular expression.
	 * @param string The string.
	 * @return The escaped string.
	 */
	Parser.escapeRegexp = function(sString) {
		return sString.replace(Parser.regexp.escapeRegexp, '\\$1');
	}



	/**
	 * A subclass of Parser that provides caching of parsed selectors.
	 */
	var CachingParser = function() {
		this.cache = {};
		Parser.call(this);
	}
	this.CachingParser = extend(CachingParser, Parser);
	
	CachingParser.prototype.parse = function(sSelector) {
		if (!(sSelector in this.cache))
			this.cache[sSelector] = Parser.prototype.parse.call(this, sSelector);
		return this.cache[sSelector];
	}


	/**
	 * Default instantiation of a caching parser.
	 */
	this.parser = new CachingParser();



	/**
	 * An exception object that is thrown when there is a parse error.
	 */
	var ParsingException = function(sSelector) {
		Error.call(this, 'CSS Selector parsing error: ' + this.selector);
		this.selector = sSelector;
	}
	this.ParsingException = extend(ParsingException, Error);

	ParsingException.prototype.toString = function() {
		return 'CSS Selector parsing error: ' + this.selector;
	}

}();
