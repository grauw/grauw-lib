/**
 * @fileOverview
 * 
 * Grauw CSS Selectors
 * 
 * Public methods:
 * - gl.selector.match(node, selector)
 * - gl.selector.query(node, selector)
 * - gl.selector.queryAll(node, selector)
 * - gl.selector.queryAncestorOrSelf(node, selector)
 * 
 * See: http://www.grauw.nl/projects/pc/selectors/
 * 
 * @version 1.1.1
 * @author L. Holst (http://www.grauw.nl/)
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

if (!window.gl)
	gl = {};

/**
 * The main CSS Selectors object.
 * Acts as sort of a namespace; all other selector objects are closures of the instance of this object.
 */
gl.selector = new function() {

	var browser_ie = !!window.ActiveXObject;
	var browser_webkit = navigator.userAgent.indexOf('AppleWebKit') != -1;

	function extend(cBase, fConstructor) {
		var cPrototype = new Function;
		cPrototype.prototype = cBase.prototype;
		fConstructor.prototype = new cPrototype;
		fConstructor.prototype.constructor = fConstructor;
		return fConstructor;
	}

	/**
	 * Helper function for cross-browser hasAttribute that ignores default values
	 * See: http://www.w3.org/TR/css3-selectors/#def-values
	 * Note: IE’s hasAttribute has issues with ‘class’ vs. ‘className’, ‘for’ vs. ‘htmlFor’, and ‘enctype’ vs. ‘encType’.
	 * Note: other browsers ignore attribute default values, even though spec says they shouldn’t
	 */
	function hasAttribute(oNode, sName) {
		if (browser_ie) {
			var oAttr = oNode.getAttributeNode(sName);
			return !!oAttr && oAttr.specified;
		}
		return oNode.hasAttribute(sName);
	}

	/**
	 * Helper function for cross-browser getAttribute that ignores default values
	 * See: http://www.w3.org/TR/css3-selectors/#def-values
	 * Note: IE’s getAttribute has issues with ‘class’ vs. ‘className’, ‘for’ vs. ‘htmlFor’, and ‘enctype’ vs. ‘encType’.
	 * Note: other browsers ignore attribute default values, even though spec says they shouldn’t
	 */
	function getAttribute(oNode, sName) {
		if (browser_ie) {
			var oAttr = oNode.getAttributeNode(sName);
			return oAttr && oAttr.specified ? oAttr.nodeValue : '';
		}
		return oNode.getAttribute(sName) || '';
	}

	/**
	 * Helper function for cross-browser getElementsByTagName('*').
	 * In particular, ignores HTMLCommentElement nodes thrown at you by Internet Explorer.
	 */
	function getAllDescendants(oNode) {
		var aDescendants = oNode.getElementsByTagName('*');
		if (!browser_ie)
			return aDescendants;
		var aResult = [];
		for (var i = 0, len = aDescendants.length; i < len; i++) {
			if (aDescendants[i].nodeType == 1)
				aResult.push(aDescendants[i]);
		}
		return aResult;
	}


	/**
	 * Matches a node against a CSS selector or selector group.
	 * Supports all CSS3 Selectors, except for pseudo-elements and the following
	 * pseuro-classes: :link, :visited, :hover, :active, :focus.
	 * @param node The node
	 * @param selector The selector
	 * @return true if the selector matches.
	 */
	function match(oNode, sSelector) {
		var oSelectorGroup = oParser.parse(sSelector);
		return oSelectorGroup ? oSelectorGroup.match(oNode) : false;
	};

	/**
	 * Queries a CSS selector or selector group against a node.
	 * @param node The node
	 * @param selector The selector
	 * @return An array containing the selected nodes.
	 */
	function queryAll(oNode, sSelector) {
		if (oNode.nodeType == 9)
			oNode = oNode.documentElement;
		var oSelectorGroup = oParser.parse(sSelector);
		return oSelectorGroup ? oSelectorGroup.query(oNode, false) : [];
	};

	/**
	 * Queries a CSS selector or selector group against a node and returns one node.
	 * @param node The node
	 * @param selector The selector
	 * @return The selected node.
	 */
	function query(oNode, sSelector) {
		if (oNode.nodeType == 9)
			oNode = oNode.documentElement;
		var oSelectorGroup = oParser.parse(sSelector);
		var aResult = oSelectorGroup ? oSelectorGroup.query(oNode, true) : [];
		return aResult.length ? aResult[0] : null;
	};

	/**
	 * Use a CSS selector to return the first selection found on a node or its ancestors.
	 * @param node The node
	 * @param selector The selector
	 * @param stop Stop querying after arriving at this node (optional)
	 * @return The selected node.
	 */
	function queryAncestorOrSelf(oNode, sSelector, oStop) {
		var oSelectorGroup = oParser.parse(sSelector);
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
	};

	/**
	 * Queries a CSS selector or selector group against the document and returns one node.
	 * @param selector The selector
	 * @return The selected node.
	 */
	function queryDocument(sSelector) {
		return query(document.documentElement, sSelector);
	};

	/**
	 * Queries a CSS selector or selector group against the document.
	 * @param selector The selector
	 * @return Array containing the selected nodes.
	 */
	function queryDocumentAll(sSelector) {
		return queryAll(document.documentElement, sSelector);
	};





	/**
	 * SelectorGroup class
	 * See: http://www.w3.org/TR/css3-selectors/#selector-syntax
	 */
	var SelectorGroup = function() {
		this.selectors = [];
	};

	/**
	 * Add a selector to the selector group.
	 * @param selector The selector
	 */
	SelectorGroup.prototype.add = function(oSelector) {
		if (!oSelector instanceof Selector)
			throw new Error('Parameter must be instance of Selector!');
		this.selectors[this.selectors.length] = oSelector;
	};

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
	};

	/**
	 * Matches a node against a selector group.
	 * @param node The node
	 * @return true if the selector matches.
	 */
	SelectorGroup.prototype.match = function(oNode) {
		var oSelector,
			bMatch = false;
		for (var i = 0, iLen = this.selectors.length; i < iLen && !bMatch; i++) {
			oSelector = this.selectors[i];
			bMatch = oSelector.match(oNode);
		}
		return bMatch;
	};

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
	};




	/**
	 * Selector class
	 * See: http://www.w3.org/TR/css3-selectors/#selectors
	 */
	var Selector = function() {
		this.combinators = [];
	};

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
	};

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
			bValid = ((i == 0 && oCombinator instanceof RootCombinator) ||
					 (i > 0 && !(oCombinator instanceof RootCombinator))) &&
					oCombinator.validate();
		}
		return bValid;
	};

	/**
	 * Matches a node against a selector.
	 * @param node The node
	 * @return true if the selector matches.
	 */
	Selector.prototype.match = function(oNode) {
		return this.combinators[this.combinators.length - 1].match(oNode);
	};

	/**
	 * Queries a CSS selector group against a node.
	 * @param node The node
	 * @param result The result array
	 * @param singleResult If true, returns immediately when first match is found.
	 * @return true if at least one match
	 */
	Selector.prototype.query = function(oNode, aResult, bSingleResult) {
		return this.combinators[0].query(oNode, aResult, bSingleResult);
	};




	/**
	 * Combinator class
	 * Abstract base class for combinator implementations
	 * See: http://www.w3.org/TR/css3-selectors/#combinators
	 */
	var Combinator = function() {
		this.simpleSelectors = [];
		this.nextCombinator = null;
		this.previousCombinator = null;
	};

	/**
	 * Add a simpleSelector to the combinator.
	 * @param simpleSelector The simple selector
	 */
	Combinator.prototype.add = function(oSimpleSelector) {
		if (!oSimpleSelector instanceof SimpleSelector)
			throw new Error('Parameter must be instance of SimpleSelector!');
		this.simpleSelectors[this.simpleSelectors.length] = oSimpleSelector;
	};

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
			bValid = (i == 0 || !(oSimpleSelector instanceof UniversalSelector)) &&
					(i == 0 || !(oSimpleSelector instanceof TypeSelector)) &&
					oSimpleSelector.validate();
		}
		return bValid;
	};

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
	};

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
	};

	/**
	 * Matches a node against a combinator.
	 * @param node The node
	 * @return true if the selector matches.
	 */
	Combinator.prototype.match = function(oNode) {
		var bMatch = this.matchSimpleSelectors(oNode);
		if (!bMatch)
			return false;

		return this.matchNext(oNode);
	};

	/**
	 * Matches on the next combinator.
	 * @param node The node
	 * Note: this method is replaced with a matcher function.
	 */
	Combinator.prototype.matchNext = function(oNode) {
//		throw new Error('Must implement...');
	};

	/**
	 * Queries a CSS selector group against a selector.
	 * Note: this method is replaced with a matcher function.
	 * @param node The node
	 * @param result The result array
	 * @param singleResult If true, returns immediately when first match is found.
	 */
	Combinator.prototype.query = function(oNode, aResult, bSingleResult) {
//		throw new Error('Must implement...');
	};
	
	/**
	 * Descendant combinator (white space)
	 */
	var DescendantCombinator = function() {
		Combinator.call(this);
	};
	extend(Combinator, DescendantCombinator);
	
	DescendantCombinator.prototype.matchNext = function(oNode) {
		var bMatch = false;
		while (!bMatch && (oNode = oNode.parentNode) && oNode.nodeType == 1)
			bMatch = this.previousCombinator.match(oNode);
		return bMatch;
	};
	
	DescendantCombinator.prototype.query = function(oNode, aResult, bSingleResult) {
		var aNodes,
			oSimpleSelector = this.simpleSelectors[0],
			iStart = 0;
		// Note: possible Firefox optimisation: use .getElementsByClassName
		if (oSimpleSelector instanceof TypeSelector) {
			aNodes = oNode.getElementsByTagName(oSimpleSelector.arg1);
			iStart++;
		} else {
			if (oSimpleSelector instanceof IdSelector) {
				var oNode2 = oNode.ownerDocument.getElementById(oSimpleSelector.arg1);
				if (oNode2 && (oNode.contains ? oNode2 != oNode && oNode.contains(oNode2) : !!(oNode.compareDocumentPosition(oNode2) & 16)))
					return this.querySimpleSelectors(oNode2, aResult, bSingleResult, 1);
			}
			aNodes = getAllDescendants(oNode);
		}
		var bMatch = false;
		for (var i = 0, iLen = aNodes.length; i < iLen && !(bSingleResult && bMatch); i++) {
			bMatch = this.querySimpleSelectors(aNodes[i], aResult, bSingleResult, iStart) || bMatch;
		}
		return bMatch;
	};
	
	/**
	 * Child combinator (>)
	 */
	var ChildCombinator = function() {
		Combinator.call(this);
	};
	extend(Combinator, ChildCombinator);

	ChildCombinator.prototype.matchNext = function(oNode) {
		return !!(oNode = oNode.parentNode) && oNode.nodeType == 1 && this.previousCombinator.match(oNode);
	};
	
	ChildCombinator.prototype.query = function(oNode, aResult, bSingleResult) {
		var aNodes,
			oSimpleSelector = this.simpleSelectors[0],
			iStart = 0;
		if (browser_ie && oSimpleSelector instanceof TypeSelector) {
			aNodes = oNode.children.tags(oSimpleSelector.arg1);
			iStart++;
		} else {
			if (oSimpleSelector instanceof IdSelector) {
				var oNode2 = oNode.ownerDocument.getElementById(oSimpleSelector.arg1);
				if (oNode2.parentNode == oNode)
					return this.querySimpleSelectors(oNode2, aResult, bSingleResult, 1);
			}
			aNodes = oNode.children || oNode.childNodes;
		}
		var bMatch = false;
		for (var i = 0, iLen = aNodes.length; i < iLen && !(bSingleResult && bMatch); i++) {
			if (aNodes[i].nodeType == 1)
				bMatch = this.querySimpleSelectors(aNodes[i], aResult, bSingleResult, iStart) || bMatch;
		}
		return bMatch;
	};
	
	/**
	 * Sibling combinator (+)
	 */
	var AdjacentCombinator = function() {
		Combinator.call(this);
	};
	extend(Combinator, AdjacentCombinator);

	AdjacentCombinator.prototype.matchNext = function(oNode) {
		while ((oNode = oNode.previousSibling) && oNode.nodeType != 1)
			;
		return !!oNode && this.previousCombinator.match(oNode);
	};
	
	AdjacentCombinator.prototype.query = function(oNode, aResult, bSingleResult) {
		while (oNode = oNode.nextSibling) {
			if (oNode.nodeType == 1) {
				return this.querySimpleSelectors(oNode, aResult, bSingleResult, 0);
			}
		}
		return false;
	};
	
	/**
	 * Sibling combinator (~)
	 */
	var SiblingCombinator = function() {
		Combinator.call(this);
	};
	extend(Combinator, SiblingCombinator);

	SiblingCombinator.prototype.matchNext = function(oNode) {
		var bMatch = false;
		while (!bMatch && (oNode = oNode.previousSibling)) {
			if (oNode.nodeType == 1)
				bMatch = this.previousCombinator.match(oNode);
		}
		return bMatch;
	};
	
	SiblingCombinator.prototype.query = function(oNode, aResult, bSingleResult) {
		var bMatch = false;
		while ((oNode = oNode.nextSibling) && !(bSingleResult && bMatch)) {
			if (oNode.nodeType == 1)
				bMatch = this.querySimpleSelectors(oNode, aResult, bSingleResult, 0) || bMatch;
		}
		return bMatch;
	};
	
	/**
	 * Root combinator
	 * This combinator does not actually exist, it just contains the first set of simple selectors.
	 */
	var RootCombinator = function() {
		Combinator.call(this);
	};
	extend(Combinator, RootCombinator);

	RootCombinator.prototype.matchNext = function(oNode) {
		return true;
	};
	
	RootCombinator.prototype.query = function(oNode, aResult, bSingleResult) {
		var bMatch = this.querySimpleSelectors(oNode, aResult, bSingleResult, 0);
		return DescendantCombinator.prototype.query.call(this, oNode, aResult, bSingleResult) || bMatch;
	};





	/**
	 * Simple selector class
	 * Abstract base class for selector implementations
	 * See: http://www.w3.org/TR/css3-selectors/#simple-selectors
	 */
	var SimpleSelector = function() {
	};

	/**
	 * Check whether the simpleSelector is in a valid final state.
	 * @return true if valid final state
	 */
	SimpleSelector.prototype.validate = function() {
		return true;
	};

	/**
	 * Matches a node against a simple selector.
	 * Note: this method is replaced with a matcher function.
	 * @param node The node
	 * @return true if the selector matches.
	 */
	SimpleSelector.prototype.match = function(oNode) {
//		throw new Error('Must implement...');
	};

	/**
	 * Universal selector (*)
	 */
	var UniversalSelector = function() {
//		SimpleSelector.call(this);
	};
	extend(SimpleSelector, UniversalSelector);
	
	UniversalSelector.prototype.match = function(oNode) {
		return true;
	};

	/**
	 * Type selector (elementName)
	 */
	var TypeSelector = function(sArg1) {
//		SimpleSelector.call(this);
		this.arg1 = sArg1;
	};
	extend(SimpleSelector, TypeSelector);
	
	TypeSelector.prototype.match = function(oNode) {
		var bXHTML = oNode.namespaceURI && oNode.namespaceURI != 'http://www.w3.org/1999/xhtml';
		var sNodeName =  bXHTML ? oNode.nodeName : oNode.nodeName.toLowerCase();
		var sSelectorName = bXHTML ? this.arg1 : this.arg1.toLowerCase();
		return sNodeName == sSelectorName;
	};

	/**
	 * Class selector (.className)
	 */
	var ClassSelector = function(sArg1) {
//		SimpleSelector.call(this);
		this.arg1 = sArg1;
		
		this.classRegexp = new RegExp('(^|\\s)' + Parser.escapeRegexp(sArg1) + '($|\\s)');
	};
	extend(SimpleSelector, ClassSelector);
	
	ClassSelector.prototype.match = function(oNode) {
		return this.classRegexp.test(oNode.className);
	};

	/**
	 * ID selector (#id)
	 */
	var IdSelector = function(sArg1) {
//		SimpleSelector.call(this);
		this.arg1 = sArg1;
	};
	extend(SimpleSelector, IdSelector);
	
	IdSelector.prototype.match = function(oNode) {
		return oNode.getAttribute('id') == this.arg1;
	};

	/**
	 * Attribute exist selector ([name])
	 */
	var AttributeExistSelector = function(sArg1) {
//		SimpleSelector.call(this);
		this.arg1 = sArg1;
	};
	extend(SimpleSelector, AttributeExistSelector);
	
	AttributeExistSelector.prototype.match = function(oNode) {
		return hasAttribute(oNode, this.arg1);
	};

	/**
	 * Attribute equals selector ([name=value])
	 */
	var AttributeEqualsSelector = function(sArg1, sArg2) {
//		SimpleSelector.call(this);
		this.arg1 = sArg1;
		this.arg2 = sArg2;
	};
	extend(SimpleSelector, AttributeEqualsSelector);
	
	AttributeEqualsSelector.prototype.match = function(oNode) {
		if (!hasAttribute(oNode, this.arg1))
			return false;
		return getAttribute(oNode, this.arg1) == this.arg2;
	};

	/**
	 * Attribute list selector ([name~=value])
	 */
	var AttributeListSelector = function(sArg1, sArg2) {
//		SimpleSelector.call(this);
		this.arg1 = sArg1;
		this.arg2 = sArg2;
		
		this.attrListRegexp = regexp_whiteSpace.test(sArg2) ?
				/$x^/ : // regexp that doesn’t match anything
				new RegExp('(^|\\s)' + Parser.escapeRegexp(sArg2) + '($|\\s)');
	};
	extend(SimpleSelector, AttributeListSelector);
	
	AttributeListSelector.prototype.match = function(oNode) {
		return !!this.arg2 && this.attrListRegexp.test(getAttribute(oNode, this.arg1));
	};

	/**
	 * Attribute language selector ([name!=en-US])
	 */
	var AttributeLangSelector = function(sArg1, sArg2) {
//		SimpleSelector.call(this);
		this.arg1 = sArg1;
		this.arg2 = sArg2;
	};
	extend(SimpleSelector, AttributeLangSelector);
	
	AttributeLangSelector.prototype.match = function(oNode) {
		if (!hasAttribute(oNode, this.arg1))
			return false;
		var sAttrValue = getAttribute(oNode, this.arg1);
		return sAttrValue.toLowerCase().indexOf(this.arg2.toLowerCase()) == 0 &&
				(this.arg2.length == sAttrValue.length || sAttrValue.charAt(this.arg2.length) == '-');
	};

	/**
	 * Attribute start selector ([name^=val])
	 */
	var AttributeStartSelector = function(sArg1, sArg2) {
//		SimpleSelector.call(this);
		this.arg1 = sArg1;
		this.arg2 = sArg2;
	};
	extend(SimpleSelector, AttributeStartSelector);
	
	AttributeStartSelector.prototype.match = function(oNode) {
		return !!this.arg2 && getAttribute(oNode, this.arg1).indexOf(this.arg2) == 0;
	};

	/**
	 * Attribute end selector ([name$=lue])
	 */
	var AttributeEndSelector = function(sArg1, sArg2) {
//		SimpleSelector.call(this);
		this.arg1 = sArg1;
		this.arg2 = sArg2;
	};
	extend(SimpleSelector, AttributeEndSelector);
	
	AttributeEndSelector.prototype.match = function(oNode) {
		var sAttrValue = getAttribute(oNode, this.arg1);
		return !!this.arg2 && sAttrValue.indexOf(this.arg2) == (sAttrValue.length - this.arg2.length);
	};

	/**
	 * Attribute contains selector ([name*=alu])
	 */
	var AttributeContainsSelector = function(sArg1, sArg2) {
//		SimpleSelector.call(this);
		this.arg1 = sArg1;
		this.arg2 = sArg2;
	};
	extend(SimpleSelector, AttributeContainsSelector);
	
	AttributeContainsSelector.prototype.match = function(oNode) {
		return !!this.arg2 && getAttribute(oNode, this.arg1).indexOf(this.arg2) != -1;
	};

	/**
	 * Root pseudo-class selector (:root)
	 */
	var RootSelector = function() {
//		SimpleSelector.call(this);
	};
	extend(SimpleSelector, RootSelector);
	
	RootSelector.prototype.match = function(oNode) {
		return oNode.ownerDocument.documentElement == oNode;
	};

	/**
	 * Abstract base class for nth-* selectors
	 */
	var NthSelector = function(sArg) {
//		SimpleSelector.call(this);
		
		var a, b, n;
		if (sArg == 'odd') {
			a = 2, b = 1;
		} else if (sArg == 'even') {
			a = 2, b = 0;
		} else {
			n = sArg.indexOf('n');
			a = sArg.substring(0, n);
			b = sArg.substring(n + 1);
			a = n == -1 ? 0 : a == '' ? 1 : a == '-' ? -1 : parseInt(a, 10);
			b = b == '' ? 0 : parseInt(b, 10);
		}
		this.a = a;
		this.b = b;
	};
	extend(SimpleSelector, NthSelector);

	/**
	 * Nth-child pseudo-class selector (:nth-child(3n+1))
	 */
	var NthChildSelector = function(sArg) {
		NthSelector.call(this, sArg);
	};
	extend(NthSelector, NthChildSelector);
	
	NthChildSelector.prototype.match = function(oNode) {
		var iCount = 1, a = this.a, b = this.b;
		if (a == 1 && b == 0)
			return true;
		while ((oNode = oNode.previousSibling) && (a > 0 || iCount <= b))
			if (oNode.nodeType == 1)
				iCount++;
		return a > 0 ? (iCount - b) % a == 0 : a < 0 ? iCount <= b && iCount % a == 0 : iCount - b == 0;
	};

	/**
	 * Nth-last-child pseudo-class selector (:nth-last-child(3n+1))
	 */
	var NthLastChildSelector = function(sArg) {
		NthSelector.call(this, sArg);
	};
	extend(NthSelector, NthLastChildSelector);
	
	NthLastChildSelector.prototype.match = function(oNode) {
		var iCount = 1, a = this.a, b = this.b;
		if (a == 1 && b == 0)
			return true;
		while ((oNode = oNode.nextSibling) && (a > 0 || iCount <= b))
			if (oNode.nodeType == 1)
				iCount++;
		return a > 0 ? (iCount - b) % a == 0 : a < 0 ? iCount <= b && iCount % a == 0 : iCount - b == 0;
	};

	/**
	 * Nth of type pseudo-class selector (:nth-of-type(3n+1))
	 */
	var NthOfTypeSelector = function(sArg) {
		NthSelector.call(this, sArg);
	};
	extend(NthSelector, NthOfTypeSelector);
	
	NthOfTypeSelector.prototype.match = function(oNode) {
		var iCount = 1, a = this.a, b = this.b, sNodeName = oNode.nodeName;
		if (a == 1 && b == 0)
			return true;
		while ((oNode = oNode.previousSibling) && (a > 0 || iCount <= b))
			if (oNode.nodeType == 1 && oNode.nodeName == sNodeName)
				iCount++;
		return a > 0 ? (iCount - b) % a == 0 : a < 0 ? iCount <= b && iCount % a == 0 : iCount - b == 0;
	};

	/**
	 * Nth last of type pseudo-class selector (:nth-last-of-type(3n+1))
	 */
	var NthLastOfTypeSelector = function(sArg) {
		NthSelector.call(this, sArg);
	};
	extend(NthSelector, NthLastOfTypeSelector);
	
	NthLastOfTypeSelector.prototype.match = function(oNode) {
		var iCount = 1, a = this.a, b = this.b, sNodeName = oNode.nodeName;
		if (a == 1 && b == 0)
			return true;
		while ((oNode = oNode.nextSibling) && (a > 0 || iCount <= b))
			if (oNode.nodeType == 1 && oNode.nodeName == sNodeName)
				iCount++;
		return a > 0 ? (iCount - b) % a == 0 : a < 0 ? iCount <= b && iCount % a == 0 : iCount - b == 0;
	};

	/**
	 * First child pseudo-class selector (:first-child)
	 */
	var FirstChildSelector = function() {
//		SimpleSelector.call(this);
	};
	extend(SimpleSelector, FirstChildSelector);
	
	FirstChildSelector.prototype.match = function firstChildMatch(oNode) {
		do
			oNode = oNode.previousSibling;
		while (oNode && oNode.nodeType != 1);
		return !oNode;
	};

	/**
	 * Last child pseudo-class selector (:last-child)
	 */
	var LastChildSelector = function() {
//		SimpleSelector.call(this);
	};
	extend(SimpleSelector, LastChildSelector);
	
	LastChildSelector.prototype.match = function lastChildMatch(oNode) {
		do
			oNode = oNode.nextSibling;
		while (oNode && oNode.nodeType != 1);
		return !oNode;
	};

	/**
	 * First of type pseudo-class selector (:first-of-type)
	 */
	var FirstOfTypeSelector = function() {
//		SimpleSelector.call(this);
	};
	extend(SimpleSelector, FirstOfTypeSelector);
	
	FirstOfTypeSelector.prototype.match = function firstOfTypeMatch(oNode) {
		var sNodeName = oNode.nodeName;
		do
			oNode = oNode.previousSibling;
		while (oNode && (oNode.nodeType != 1 || oNode.nodeName != sNodeName));
		return !oNode;
	};

	/**
	 * Last of type pseudo-class selector (:last-of-type)
	 */
	var LastOfTypeSelector = function() {
//		SimpleSelector.call(this);
	};
	extend(SimpleSelector, LastOfTypeSelector);
	
	LastOfTypeSelector.prototype.match = function lastOfTypeMatch(oNode) {
		var sNodeName = oNode.nodeName;
		do
			oNode = oNode.nextSibling;
		while (oNode && (oNode.nodeType != 1 || oNode.nodeName != sNodeName));
		return !oNode;
	};

	/**
	 * Only child pseudo-class selector (:only-child)
	 */
	var OnlyChildSelector = function() {
//		SimpleSelector.call(this);
	};
	extend(SimpleSelector, OnlyChildSelector);
	
	OnlyChildSelector.prototype.match = function(oNode) {
		return FirstChildSelector.prototype.match.call(this, oNode) &&
				LastChildSelector.prototype.match.call(this, oNode);
	};

	/**
	 * Only of type pseudo-class selector (:only-of-type)
	 */
	var OnlyOfTypeSelector = function() {
//		SimpleSelector.call(this);
	};
	extend(SimpleSelector, OnlyOfTypeSelector);
	
	OnlyOfTypeSelector.prototype.match = function(oNode) {
		return FirstOfTypeSelector.prototype.match.call(this, oNode) &&
				LastOfTypeSelector.prototype.match.call(this, oNode);
	};

	/**
	 * Empty pseudo-class selector (:empty)
	 */
	var EmptySelector = function() {
//		SimpleSelector.call(this);
	};
	extend(SimpleSelector, EmptySelector);
	
	EmptySelector.prototype.match = function(oNode) {
		oNode = oNode.firstChild;
		while (oNode && oNode.nodeType != 1 && (oNode.nodeType != 3 || oNode.length == 0))
			oNode = oNode.nextSibling;
		return !oNode;
	};

	/**
	 * Language pseudo-class selector (:lang(nl))
	 */
	var LangSelector = function(sArg1) {
//		SimpleSelector.call(this);
		this.arg1 = sArg1;
	};
	extend(SimpleSelector, LangSelector);
	
	LangSelector.prototype.match = function(oNode) {
		var sLang;
		do {
			sLang = oNode.lang || '';
			oNode = oNode.parentNode;
		} while (!sLang && oNode && oNode.nodeType == 1);
		// TODO: add support for language from META element (Content-Language)
		return sLang.toLowerCase().indexOf(this.arg1.toLowerCase()) == 0 &&
				(this.arg1.length == sLang.length || sLang.charAt(this.arg1.length) == '-');
	};

	/**
	 * Enabled pseudo-class selector (:enabled)
	 */
	var EnabledSelector = function() {
//		SimpleSelector.call(this);
	};
	extend(SimpleSelector, EnabledSelector);
	
	EnabledSelector.prototype.match = function(oNode) {
		var sTagName = oNode.tagName.toUpperCase();
		return sTagName != 'LINK' && sTagName != 'STYLE' && 'disabled' in oNode && !oNode.disabled;
	};

	/**
	 * Disabled pseudo-class selector (:disabled)
	 */
	var DisabledSelector = function() {
//		SimpleSelector.call(this);
	};
	extend(SimpleSelector, DisabledSelector);
	
	DisabledSelector.prototype.match = function(oNode) {
		var sTagName = oNode.tagName.toUpperCase();
		return sTagName != 'LINK' && sTagName != 'STYLE' && 'disabled' in oNode && oNode.disabled;
	};

	/**
	 * Checked pseudo-class selector (:checked)
	 */
	var CheckedSelector = function() {
//		SimpleSelector.call(this);
	};
	extend(SimpleSelector, CheckedSelector);
	
	CheckedSelector.prototype.match = function(oNode) {
		var sTagName = oNode.tagName.toUpperCase();
		return sTagName == 'INPUT' && oNode.checked || sTagName == 'OPTION' && oNode.selected;
	};

	/**
	 * Read-only pseudo-class selector (:read-only)
	 */
	var ReadOnlySelector = function() {
//		SimpleSelector.call(this);
	};
	extend(SimpleSelector, ReadOnlySelector);
	
	ReadOnlySelector.prototype.match = function(oNode) {
		return !('readOnly' in oNode) || oNode.readOnly;
	};

	/**
	 * Read-write pseudo-class selector (:read-write)
	 */
	var ReadWriteSelector = function() {
//		SimpleSelector.call(this);
	};
	extend(SimpleSelector, ReadWriteSelector);
	
	ReadWriteSelector.prototype.match = function(oNode) {
		return 'readOnly' in oNode && !oNode.readOnly;
	};

	/**
	 * Target pseudo-class selector (:target)
	 */
	var TargetSelector = function() {
//		SimpleSelector.call(this);
	};
	extend(SimpleSelector, TargetSelector);
	
	TargetSelector.prototype.match = function(oNode) {
		return '#' + oNode.getAttribute('id') == oNode.ownerDocument.location.hash;
	};

	/**
	 * Negation pseudo-class selector (:not)
	 */
	var NotSelector = function(oSimpleSelector) {
//		SimpleSelector.call(this);
		if (!oSimpleSelector instanceof SimpleSelector)
			throw new Error('Parameter must be instance of SimpleSelector!');
		this.simpleSelector = oSimpleSelector;
	};
	extend(SimpleSelector, NotSelector);

	NotSelector.prototype.validate = function() {
		return !(this.simpleSelector instanceof NotSelector);
	};

	NotSelector.prototype.match = function(oNode) {
		return !this.simpleSelector.match(oNode);
	};



	/**
	 * Parser object constructor
	 * @class Parser class
	 * @constructor
	 */
	var Parser = function() {
	};

	/**
	 * Parser regexp macros and patterns for the tokenizer
	 * See: http://www.w3.org/TR/CSS21/syndata.html#tokenization
	 */
	// Macros
	var pattern_w          = '[ \t\r\n\f]*',
		pattern_S          = '[ \t\r\n\f]+',
		pattern_escape     = '\\\\[0-9a-fA-F]{1,6}(?:\\r\\n|[ \\n\\r\\t\\f])?|\\\\[^\\n\\r\\f0-9a-fA-F]',
		pattern_nlescape   = '\\\\(?:\\r\\n|[\\n\\r\\f])',
		pattern_ident      = '(?:[-]?(?:[_a-zA-Z]|[^\\0-\\177]|' + pattern_escape + ')(?:[_a-zA-Z0-9-]|[^\\0-\\177]|' + pattern_escape + ')*)',
//		pattern_ns_ident   = '(?:(?:' + pattern_ident + '|\\*)?\\|)?' + pattern_ident,
		pattern_string1    = '\\"(?:[^\\n\\r\\f\\\\"]|' + pattern_nlescape + '|' + pattern_escape + ')*\\"',
		pattern_string2    = "\\'(?:[^\\n\\r\\f\\\\']|" + pattern_nlescape + "|" + pattern_escape + ")*\\'",
		pattern_string     = '(?:' + pattern_string1 + '|' + pattern_string2 + ')',
//		pattern_nth        = '(?:-?[0-9]*n)?(?:[+\\-][0-9]+)?|odd|even',
		// Simple selectors
		pattern_class      = '\\.' + pattern_ident,
		pattern_id         = '#' + pattern_ident,
		pattern_attribute  = '\\[(' + pattern_ident + ')(?:([~|\\^\\$*]?=)(' + pattern_ident + '|' + pattern_string + '))?\\]',
		pattern_pseudo     = ':' + pattern_ident + '(?:\\([^)]+\\))?',
		pattern_universal  = '\\*',				// '(?:' + pattern_ident + '\\|)\\*'
		pattern_element    = pattern_ident,		// pattern_ns_ident
		// Combinators
		// Note: combinators must be placed inbetween two \s* patterns
		pattern_child      = pattern_w + '>' + pattern_w,
		pattern_adjacent   = pattern_w + '\\+' + pattern_w,
		pattern_sibling    = pattern_w + '~' + pattern_w,
		pattern_comma      = pattern_w + ',' + pattern_w,
		pattern_descendant = pattern_S,
		pattern_negation   = ':not\\((?:' + [pattern_class, pattern_id, pattern_attribute, 
		                                       pattern_pseudo, pattern_universal,
		                                       pattern_element].join('|') + ')\\)';


	/**
	 * Regular expression objects for patterns
	 */
	var regexp_selector = new RegExp([
				pattern_class,		// first all selectors
				pattern_id,
				pattern_attribute,
				pattern_negation,
				pattern_pseudo,
				pattern_universal,
				pattern_element,
				pattern_child,		// then the combinators
				pattern_adjacent,
				pattern_sibling,
				pattern_comma,
				pattern_descendant	// descendant combinator must be last
			].join('|'), 'g'),
		regexp_attribute    = new RegExp(pattern_attribute),
		regexp_nlescape     = new RegExp(pattern_nlescape, 'g'),
		regexp_pseudo       = new RegExp(':([^(]+)(?:\\((.+)\\))?'),
		regexp_trim         = /^\s+|\s+$/gm,
		regexp_escapeCSS    = /\\([^\n\r\f0-9a-fA-F])|\\([0-9a-fA-F]{1,6})(?:\r\n|[ \n\r\t\f])?/g,
		regexp_escapeRegexp = /([\[\\\^\$\.\|\?\*\+\(\)\{\}])/g,
		regexp_whiteSpace   = /\s/;

	var hAttrTypeMap = {
			'=' : AttributeEqualsSelector,
			'~=': AttributeListSelector,
			'|=': AttributeLangSelector,
			'^=': AttributeStartSelector,
			'$=': AttributeEndSelector,
			'*=': AttributeContainsSelector
		};

	var hPseudoTypeMap = {
			'root'            : RootSelector,
			'nth-child'       : NthChildSelector,
			'nth-last-child'  : NthLastChildSelector,
			'nth-of-type'     : NthOfTypeSelector,
			'nth-last-of-type': NthLastOfTypeSelector,
			'first-child'     : FirstChildSelector,
			'last-child'      : LastChildSelector,
			'first-of-type'   : FirstOfTypeSelector,
			'last-of-type'    : LastOfTypeSelector,
			'only-child'      : OnlyChildSelector,
			'only-of-type'    : OnlyOfTypeSelector,
			'empty'           : EmptySelector,
			'lang'            : LangSelector,
			'enabled'         : EnabledSelector,
			'disabled'        : DisabledSelector,
			'checked'         : CheckedSelector,
			'read-only'       : ReadOnlySelector,
			'read-write'      : ReadWriteSelector,
			'target'          : TargetSelector
//			'not'             : NotSelector
		};

	/**
	 * Parses a CSS selector or selector group.
	 * Uses caching to speed up subsequent calls.
	 * @param selector The selector.
	 * @return SelectorGroup object, null if unable to parse the selector (error message in errorMessage property).
	 */
	Parser.prototype.parse = function(sSelector) {
		// segment selector
		var aSelectorParts = sSelector.match(regexp_selector);
		// check whether selector was parsed completely...
		if (sSelector != aSelectorParts.join(''))
			throw new ParsingException(sSelector);

		// instantiate initial object model
		var oSelectorGroup = new SelectorGroup(),
			oSelector = new Selector(),
			oCombinator = new RootCombinator();
		oSelectorGroup.add(oSelector);
		oSelector.add(oCombinator);

		// post-process segments
		for (var i = 0, iLen = aSelectorParts.length; i < iLen; i++) {
			// trim combinators with excessive space, note that descendant combinator becomes ''
			var sSelectorPart = aSelectorParts[i].replace(regexp_trim, '');
			switch (sSelectorPart.charAt(0)) {
				// selector group
				case ',':
					oSelector = new Selector();
					oCombinator = new RootCombinator();
					oSelectorGroup.add(oSelector);
					oSelector.add(oCombinator);
					break;
				// selectors
				case '*':
					oCombinator.add(new UniversalSelector());
					break;
				case '.':
					oCombinator.add(new ClassSelector(Parser.decodeIdent(sSelectorPart.substr(1))));
					break;
				case '#':
					oCombinator.add(new IdSelector(Parser.decodeIdent(sSelectorPart.substr(1))));
					break;
				case '[':
					oCombinator.add(this.parseAttributeSelector(sSelectorPart));
					break;
				case ':':
					try {
						oCombinator.add(this.parsePseudoSelector(sSelectorPart));
					} catch(e) {
						if (e instanceof ParsingException)
							e.setSelector(sSelector);
						throw e;
					}
					break;
				// combinators
				case '':
					oCombinator = new DescendantCombinator();
					oSelector.add(oCombinator);
					break;
				case '>':
					oCombinator = new ChildCombinator();
					oSelector.add(oCombinator);
					break;
				case '+':
					oCombinator = new AdjacentCombinator();
					oSelector.add(oCombinator);
					break;
				case '~':
					oCombinator = new SiblingCombinator();
					oSelector.add(oCombinator);
					break;
				// element selector (no single prefix)
				default:
					oCombinator.add(new TypeSelector(Parser.decodeIdent(sSelectorPart)));
					break;
			}
		}
		if (!oSelectorGroup.validate())
			throw new ParsingException(sSelector);

		return oSelectorGroup;
	};

	Parser.prototype.parseAttributeSelector = function(sSelectorPart) {
		var aParsedValues = regexp_attribute.exec(sSelectorPart);
		var sName = Parser.decodeIdent(aParsedValues[1]);
		if (!aParsedValues[2]) {
			return new AttributeExistSelector(sName);
		} else {
			var sValue = aParsedValues[3].charAt(0) == '"' || aParsedValues[3].charAt(0) == "'" ?
						Parser.decodeString(aParsedValues[3]) :
						Parser.decodeIdent(aParsedValues[3]);
			return this.createAttributeSelector(aParsedValues[2], sName, sValue);
		}
	};
	
	/**
	 * Returns a new Attribute*Selector instance that matches on name and value.
	 * Note that the grammar parsing has already prevented any non-existant identifier
	 * from occurring here, so no existence check needs to be done.
	 * @param sIdentifier The bit between the name and value in the selector (e.g. ^=)
	 * @param sName Name to match on
	 * @param sValue Value to match on
	 * @return A new Attribute*Selector instance.
	 */
	Parser.prototype.createAttributeSelector = function(sIdentifier, sName, sValue) {
		return new hAttrTypeMap[sIdentifier](sName, sValue);
	};
	
	Parser.prototype.parsePseudoSelector = function(sSelectorPart) {
		var aParsedPseudo = regexp_pseudo.exec(sSelectorPart),
			sIdentifier = Parser.decodeIdent(aParsedPseudo[1]);
		if (sIdentifier == 'not') {
			var oTempGroup = this.parse(aParsedPseudo[2]);
			var oTempCombinator = oTempGroup.selectors[0].combinators[0];
			if (oTempCombinator.simpleSelectors.length != 1)
				throw new ParsingException(sSelectorPart);
			return new NotSelector(oTempCombinator.simpleSelectors[0]);
		} else {
			return this.createPseudoSelector(sIdentifier, aParsedPseudo[2]);
		}
	};
	
	/**
	 * Returns a SimpleSelector instance matching the passed pseudo-class name
	 * @param sIdentifier Pseudo-class name
	 * @param sArgument Argument to pass to the pseudo-class
	 * @param sSelector to use by the 
	 * @return A new SimpleSelector instance
	 */
	Parser.prototype.createPseudoSelector = function(sIdentifier, sArgument) {
		if (!hPseudoTypeMap[sIdentifier])
			throw new ParsingException(sIdentifier);
		return new hPseudoTypeMap[sIdentifier](sArgument);
	};

	/**
	 * Decode a CSS identifier
	 * @param identifier The identifier
	 * @return Decoded string
	 */
	Parser.decodeIdent = function(sIdentifier) {
		sIdentifier = sIdentifier.replace(regexp_escapeCSS,
				function(sEsc, sCharacter, sUnicode) {
					if (sCharacter)
						return sCharacter;
					else
						return String.fromCharCode(parseInt(sUnicode, 16));
				}
			);
		return sIdentifier;
	};

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
		sString = sString.replace(regexp_nlescape, '');
		return Parser.decodeIdent(sString);
	};

	/**
	 * Escapes a string for use in a regular expression.
	 * @param string The string.
	 * @return The escaped string.
	 */
	Parser.escapeRegexp = function(sString) {
		return sString.replace(regexp_escapeRegexp, '\\$1');
	};



	/**
	 * A subclass of Parser that provides caching of parsed selectors.
	 */
	var CachingParser = function() {
		this.cache = {};
		Parser.call(this);
	};
	extend(Parser, CachingParser);
	
	CachingParser.prototype.parse = function(sSelector) {
		if (!(sSelector in this.cache))
			this.cache[sSelector] = Parser.prototype.parse.call(this, sSelector);
		return this.cache[sSelector];
	};



	/**
	 * An exception object that is thrown when there is a parse error.
	 */
	var ParsingException = function(sSelector) {
		Error.call(this, 'CSS Selector parsing error: ' + this.selector);
		this.selector = sSelector;
	};
	extend(Error, ParsingException);
	
	ParsingException.prototype.setSelector = function(sSelector) {
		this.selector = sSelector;
	};

	ParsingException.prototype.toString = function() {
		return 'CSS Selector parsing error: ' + this.selector;
	};



	// instantiate caching parser
	var oParser = new CachingParser();
	
	
	
	
	// exports
	this.match = match;
	this.queryAll = queryAll;
	this.query = query;
	this.queryAncestorOrSelf = queryAncestorOrSelf;
	this.queryDocument = queryDocument;
	this.queryDocumentAll = queryDocumentAll;
	this.SelectorGroup = SelectorGroup;
	this.Selector = Selector;
	this.Combinator = Combinator;
	this.DescendantCombinator = DescendantCombinator;
	this.ChildCombinator = ChildCombinator;
	this.AdjacentCombinator = AdjacentCombinator;
	this.SiblingCombinator = SiblingCombinator;
	this.RootCombinator = RootCombinator;
	this.SimpleSelector = SimpleSelector;
	this.UniversalSelector = UniversalSelector;
	this.TypeSelector = TypeSelector;
	this.ClassSelector = ClassSelector;
	this.IdSelector = IdSelector;
	this.AttributeExistSelector = AttributeExistSelector;
	this.AttributeEqualsSelector = AttributeEqualsSelector;
	this.AttributeListSelector = AttributeListSelector;
	this.AttributeLangSelector = AttributeLangSelector;
	this.AttributeStartSelector = AttributeStartSelector;
	this.AttributeEndSelector = AttributeEndSelector;
	this.AttributeContainsSelector = AttributeContainsSelector;
	this.RootSelector = RootSelector;
	this.NthSelector = NthSelector;
	this.NthChildSelector = NthChildSelector;
	this.NthLastChildSelector = NthLastChildSelector;
	this.NthOfTypeSelector = NthOfTypeSelector;
	this.NthLastOfTypeSelector = NthLastOfTypeSelector;
	this.FirstChildSelector = FirstChildSelector;
	this.LastChildSelector = LastChildSelector;
	this.FirstOfTypeSelector = FirstOfTypeSelector;
	this.LastOfTypeSelector = LastOfTypeSelector;
	this.OnlyChildSelector = OnlyChildSelector;
	this.OnlyOfTypeSelector = OnlyOfTypeSelector;
	this.EmptySelector = EmptySelector;
	this.LangSelector = LangSelector;
	this.EnabledSelector = EnabledSelector;
	this.DisabledSelector = DisabledSelector;
	this.CheckedSelector = CheckedSelector;
	this.ReadOnlySelector = ReadOnlySelector;
	this.ReadWriteSelector = ReadWriteSelector;
	this.TargetSelector = TargetSelector;
	this.NotSelector = NotSelector;
	this.Parser = Parser;
	this.CachingParser = CachingParser;
	this.ParsingException = ParsingException;
	this.parser = oParser;
	
};
