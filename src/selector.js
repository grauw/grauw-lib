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
 * @version 1.0.7
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

	function extend(oBase) {
		// create new prototype object that inherits from cBase
		var fPrototype = new Function;
		fPrototype.prototype = oBase.prototype;
		return new fPrototype;
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
	this.SelectorGroup = SelectorGroup;

	SelectorGroup.prototype = {
		/**
		 * Add a selector to the selector group.
		 * @param selector The selector
		 */
		add: function(oSelector) {
			if (!oSelector instanceof Selector)
				throw new Error('Parameter must be instance of Selector!');
			this.selectors[this.selectors.length] = oSelector;
		},

		/**
		 * Check whether the selector is in a valid final state.
		 * @return true if valid final state
		 */
		validate: function() {
			var iLen = this.selectors.length,
				bValid = iLen > 0;
			for (var i = 0; i < iLen && bValid; i++)
				bValid = this.selectors[i].validate();
			return bValid;
		},

		/**
		 * Matches a node against a selector group.
		 * @param node The node
		 * @return true if the selector matches.
		 */
		match: function(oNode) {
			var oSelector,
				iStart,
				bMatch = false;
			for (var i = 0, iLen = this.selectors.length; i < iLen && !bMatch; i++) {
				oSelector = this.selectors[i];
				bMatch = oSelector.match(oNode);
			}
			return bMatch;
		},

		/**
		 * Queries a CSS selector group against a node.
		 * @param node The node
		 * @param singleResult If true, returns immediately when first match is found.
		 * @return The result array
		 */
		query: function(oNode, bSingleResult) {
			var aResult = [],
				bMatch = false;
			for (var i = 0, iLen = this.selectors.length; i < iLen && !(bSingleResult && bMatch); i++)
				bMatch = this.selectors[i].query(oNode, aResult, bSingleResult) || bMatch;
			// reset __queryResult variable
			for (var i = 0, iLen = aResult.length; i < iLen; i++)
				aResult[i].__queryResult = false;
			return aResult;
		}
	}




	/**
	 * Selector class
	 * See: http://www.w3.org/TR/css3-selectors/#selectors
	 */
	var Selector = function() {
		this.combinators = [];
	}

	Selector.prototype = {
		/**
		 * Add a combinator to the selector.
		 * @param combinator The combinator
		 */
		add: function(oCombinator) {
			if (!oCombinator instanceof Combinator)
				throw new Error('Parameter must be instance of Combinator!');
			var iLen = this.combinators.length;
			if (iLen > 0) {
				this.combinators[iLen - 1].nextCombinator = oCombinator;
				oCombinator.previousCombinator = this.combinators[iLen - 1];
			}
			this.combinators[iLen] = oCombinator;
		},

		/**
		 * Check whether the selector is in a valid final state.
		 * @return true if valid final state
		 */
		validate: function() {
			var iLen = this.combinators.length,
				bValid = iLen > 0,
				oCombinator;
			for (var i = 0; i < iLen && bValid; i++) {
				oCombinator = this.combinators[i];
				bValid = ((i == 0 && oCombinator.type == oCombinator.ROOT) ||
						 (i > 0 && oCombinator.type != oCombinator.ROOT)) &&
						oCombinator.validate();
			}
			return bValid;
		},

		/**
		 * Matches a node against a selector.
		 * @param node The node
		 * @return true if the selector matches.
		 */
		match: function(oNode) {
			return this.combinators[this.combinators.length - 1].match(oNode);
		},

		/**
		 * Queries a CSS selector group against a node.
		 * @param node The node
		 * @param result The result array
		 * @param singleResult If true, returns immediately when first match is found.
		 * @return true if at least one match
		 */
		query: function(oNode, aResult, bSingleResult) {
			return this.combinators[0].query(oNode, aResult, bSingleResult);
		}
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
	this.Combinator = Combinator;

	Combinator.prototype = {
		// type constants
		DESCENDANT: 1,
		CHILD     : 2,
		ADJACENT  : 3,
		SIBLING   : 4,
		ROOT      : 5,	// not a real combinator, but corresponds to self-or-descendant

		/**
		 * Add a simpleSelector to the combinator.
		 * @param simpleSelector The simple selector
		 */
		add: function(oSimpleSelector) {
			if (!oSimpleSelector instanceof SimpleSelector)
				throw new Error('Parameter must be instance of SimpleSelector!');
			this.simpleSelectors[this.simpleSelectors.length] = oSimpleSelector;
		},

		/**
		 * Check whether the combinator is in a valid final state.
		 * @return true if valid final state
		 */
		validate: function() {
			var iLen = this.simpleSelectors.length,
				bValid = iLen > 0,
				oSimpleSelector;
			for (var i = 0; i < iLen && bValid; i++) {
				oSimpleSelector = this.simpleSelectors[i];
				bValid = (i == 0 || oSimpleSelector.type != oSimpleSelector.UNIVERSAL) &&
						(i == 0 || oSimpleSelector.type != oSimpleSelector.TYPE) &&
						oSimpleSelector.validate();
			}
			return bValid;
		},

		/**
		 * Matches a node against a combinator.
		 * @param node The node
		 * @param start The first simple selector to match
		 * @return true if the selector matches.
		 */
		matchSimpleSelectors: function(oNode, iStart) {
			var bMatch = true;
			for (var i = iStart || 0, iLen = this.simpleSelectors.length; i < iLen && bMatch; i++)
				bMatch = this.simpleSelectors[i].match(oNode);
			return bMatch;
		},

		/**
		 * Matches a node against a combinator, and adds it to the query results when it matches.
		 * @param node The node
		 * @param result The result array
		 * @param singleResult If true, returns immediately when first match is found.
		 * @param start The first simpleSelector to match (used to skip selectors that have already been satisfied)
		 * @return true if the selector matches.
		 */
		querySimpleSelectors: function(oNode, aResult, bSingleResult, iStart) {
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
		},

		/**
		 * Matches a node against a combinator.
		 * @param node The node
		 * @return true if the selector matches.
		 */
		match: function(oNode) {
			var bMatch = this.matchSimpleSelectors(oNode);
			if (!bMatch)
				return false;
			if (this.type == this.ROOT)
				return true;

			return this.matchFunction(oNode);
		},

		/**
		 * Queries a CSS selector group against a selector.
		 */
		query: function(oNode, aResult, bSingleResult) {
			return this.queryFunction(oNode, aResult, bSingleResult);
		},

		matchFunction: null,
		queryFunction: null
	}

	// convenience variable to access constants
	var cp = Combinator.prototype;

	/**
	 * Array of matching combinators
	 */
	Combinator.prototype.matchCombinator = function() {
		var mc = [],
			cp = Combinator.prototype;
		mc[cp.DESCENDANT] = function(oNode) {
			var bMatch = false;
			while (!bMatch && (oNode = oNode.parentNode) && oNode.nodeType == 1)
				bMatch = this.previousCombinator.match(oNode);
			return bMatch;
		}
		mc[cp.CHILD] = function(oNode) {
			return !!(oNode = oNode.parentNode) && oNode.nodeType == 1 && this.previousCombinator.match(oNode);
		}
		mc[cp.ADJACENT] = function(oNode) {
			while ((oNode = oNode.previousSibling) && oNode.nodeType != 1)
				;
			return !!oNode && this.previousCombinator.match(oNode);
		}
		mc[cp.SIBLING] = function(oNode) {
			var bMatch = false;
			while (!bMatch && (oNode = oNode.previousSibling)) {
				if (oNode.nodeType == 1)
					bMatch = this.previousCombinator.match(oNode);
			}
			return bMatch;
		}
		mc[cp.ROOT] = null;
		return mc;
	}();

	/**
	 * Array of querying combinators
	 */
	Combinator.prototype.queryCombinator = function() {
		var qc = [];
		qc[cp.DESCENDANT] = function(oNode, aResult, bSingleResult) {
			var aNodes,
				oSimpleSelector = this.simpleSelectors[0],
				iStart = 0;
			// Note: possible Firefox optimisation: use .getElementsByClassName
			if (oSimpleSelector.type == oSimpleSelector.TYPE) {
				aNodes = oNode.getElementsByTagName(oSimpleSelector.arg1);
				iStart++;
			} else {
				if (oSimpleSelector.type == oSimpleSelector.ID) {
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
		qc[cp.CHILD] = function(oNode, aResult, bSingleResult) {
			var aNodes,
				oSimpleSelector = this.simpleSelectors[0],
				iStart = 0;
			if (oNode.children && oSimpleSelector.type == oSimpleSelector.TYPE) {
				aNodes = oNode.children.tags(oSimpleSelector.arg1);
				iStart++;
			} else {
				if (oSimpleSelector.type == oSimpleSelector.ID) {
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
		qc[cp.ADJACENT] = function(oNode, aResult, bSingleResult) {
			while (oNode = oNode.nextSibling) {
				if (oNode.nodeType == 1) {
					return this.querySimpleSelectors(oNode, aResult, bSingleResult, 0);
				}
			}
			return false;
		}
		qc[cp.SIBLING] = function(oNode, aResult, bSingleResult) {
			var bMatch = false;
			while ((oNode = oNode.nextSibling) && !(bSingleResult && bMatch)) {
				if (oNode.nodeType == 1)
					bMatch = this.querySimpleSelectors(oNode, aResult, bSingleResult, 0) || bMatch;
			}
			return bMatch;
		}
		qc[cp.ROOT] = function(oNode, aResult, bSingleResult) {
			var bMatch = this.querySimpleSelectors(oNode, aResult, bSingleResult, 0);
			return qc[cp.DESCENDANT].call(this, oNode, aResult, bSingleResult) || bMatch;
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
	this.SimpleSelector = SimpleSelector;

	SimpleSelector.prototype = {
		// type constants
		UNIVERSAL               : 1,
		TYPE                    : 2,
		ATTRIBUTE_EXIST         : 3,
		ATTRIBUTE_EQUALS        : 4,
		ATTRIBUTE_LIST          : 5,
		ATTRIBUTE_LANG          : 6,
		ATTRIBUTE_STARTS        : 7,
		ATTRIBUTE_ENDS          : 8,
		ATTRIBUTE_CONTAINS      : 9,
		CLASS                   : 10,
		ID                      : 11,
		PSEUDO_ROOT             : 12,
		PSEUDO_NTH_CHILD        : 13,
		PSEUDO_NTH_LAST_CHILD   : 14,
		PSEUDO_NTH_OF_TYPE      : 15,
		PSEUDO_NTH_LAST_OF_TYPE : 16,
		PSEUDO_FIRST_CHILD      : 17,
		PSEUDO_LAST_CHILD       : 18,
		PSEUDO_FIRST_OF_TYPE    : 19,
		PSEUDO_LAST_OF_TYPE     : 20,
		PSEUDO_ONLY_CHILD       : 21,
		PSEUDO_ONLY_OF_TYPE     : 22,
		PSEUDO_EMPTY            : 23,
		PSEUDO_LANG             : 24,
		PSEUDO_ENABLED          : 25,
		PSEUDO_DISABLED         : 26,
		PSEUDO_CHECKED          : 27,
		PSEUDO_READ_ONLY        : 28,
		PSEUDO_READ_WRITE       : 29,
		PSEUDO_TARGET           : 30,
		PSEUDO_NOT              : 31,

		/**
		 * Check whether the simpleSelector is in a valid final state.
		 * @return true if valid final state
		 */
		validate: function() {
			return true;
		},

		/**
		 * Matches a node against a simple selector.
		 * Note: Be sure that node exists before calling! No check here.
		 * @param node The node
		 * @return true if the selector matches.
		 */
		match: function(oNode) {
			return this.matcher[this.type].call(this, oNode);
		},

		/**
		 * Helper function for cross-browser hasAttribute
		 */
		_hasAttribute : function(oNode, sName) {
			if (browser_ie) {
				var oAttr = oNode.attributes[sName];
				return !!oAttr && oAttr.specified;
			}
			return oNode.hasAttribute(sName);
		},

		/**
		 * Helper function for cross-browser getAttribute
		 */
		_getAttribute : function(oNode, sName) {
			if (browser_ie) {
				var oAttr = oNode.attributes[sName];
				return oAttr ? oAttr.nodeValue : '';
			}
			return oNode.getAttribute(sName) || '';
		}

		/**
		 * Helper function for cross-browser uniqueID (IE property on HTML nodes)
		 */
		// Attempt at making nth child selectors perform better
/*		_getUniqueID : function(node) {
			return node.uniqueID || (node.uniqueID = '__i' + this._uniqueIDCounter++);
		},

		_uniqueIDCounter: 1,

		_childCounterCache: null
*/
	}

	// convenience variable to access constants
	var ssp = SimpleSelector.prototype;

	/**
	 * Array of simple selector matching functions
	 */
	SimpleSelector.prototype.matcher = function() {
		var m = [];
		m[ssp.UNIVERSAL] = function(oNode) {
			return true;
		}
		m[ssp.TYPE] = function(oNode) {
			var bXHTML = oNode.namespaceURI && oNode.namespaceURI != 'http://www.w3.org/1999/xhtml';
			var sNodeName =  bXHTML ? oNode.nodeName : oNode.nodeName.toLowerCase();
			var sSelectorName = bXHTML ? this.arg1 : this.arg1.toLowerCase();
			return sNodeName == sSelectorName;
		}
		m[ssp.CLASS] = function(oNode) {
			return this.classRegexp.test(oNode.className);
		}
		m[ssp.ID] = function(oNode) {
			return oNode.getAttribute('id') == this.arg1;
		}
		m[ssp.ATTRIBUTE_EXIST] = function(oNode) {
			return this._hasAttribute(oNode, this.arg1);
		}
		m[ssp.ATTRIBUTE_EQUALS] = function(oNode) {
			return this._getAttribute(oNode, this.arg1) == this.arg2;
		}
		m[ssp.ATTRIBUTE_LIST] = function(oNode) {
			return this.arg2 != '' && this.attrListRegexp.test(this._getAttribute(oNode, this.arg1));
		}
		m[ssp.ATTRIBUTE_LANG] = function(oNode) {
			var sAttrValue = this._getAttribute(oNode, this.arg1);
			return sAttrValue.toLowerCase().indexOf(this.arg2.toLowerCase()) == 0 &&
					(this.arg2.length == sAttrValue.length || sAttrValue.charAt(this.arg2.length) == '-');
		}
		m[ssp.ATTRIBUTE_STARTS] = function(oNode) {
			return this.arg2 != '' && this._getAttribute(oNode, this.arg1).indexOf(this.arg2) == 0;
		}
		m[ssp.ATTRIBUTE_ENDS] = function(oNode) {
			var sAttrValue = this._getAttribute(oNode, this.arg1);
			return this.arg2 != '' && sAttrValue.indexOf(this.arg2) == (sAttrValue.length - this.arg2.length);
		}
		m[ssp.ATTRIBUTE_CONTAINS] = function(oNode) {
			return this.arg2 != '' && this._getAttribute(oNode, this.arg1).indexOf(this.arg2) != -1;
		}
		m[ssp.PSEUDO_ROOT] = function(oNode) {
			return oNode.ownerDocument.documentElement == oNode;
		}
		// Attempt at making nth child selectors perform better
/*		m[ssp.PSEUDO_NTH_CHILD] = function(oNode) {
			this._childCounterCache[this._getUniqueID(oNode)]
			// idea stolen from base2:
			//    if (element.rows) {
			//      element.b2_length = element.rows.length;
			//      element.b2_lookup = "rowIndex";
			//    } else if (element.cells) {
			//      element.b2_length = element.cells.length;
			//      element.b2_lookup = "cellIndex";
			//    }
			var iCount = 1, a = this.arg1, b = this.arg2;
			if (a == 1 && b == 0)
				return true;
			var parentId = this._getUniqueID(oNode.parentNode);
			if (!this._childCounterCache)
				this._childCounterCache = {};
			if (!this._childCounterCache[parentId]) {
				var childNodes = oNode.parentNode.childNodes;
				var hCache = {};
				for (var i = 0, len = childNodes.length; i < len; i++) {
					var oChild = childNodes[i];
					if (oChild.nodeType == 1)
						hCache[this._getUniqueID(oChild)] = iCount++;
				}
				this._childCounterCache[parentId] = hCache;
			}
			var aCounterCache = this._childCounterCache[parentId];
			iCount = aCounterCache[this._getUniqueID(oNode)];
			return a > 0 ? (iCount - b) % a == 0 : a < 0 ? iCount <= b && iCount % a == 0 : iCount - b == 0;
		}
*/		m[ssp.PSEUDO_NTH_CHILD] = function(oNode) {
			var iCount = 1, a = this.arg1, b = this.arg2;
			if (a == 1 && b == 0)
				return true;
			while ((oNode = oNode.previousSibling) && (a > 0 || iCount <= b))
				if (oNode.nodeType == 1)
					iCount++;
			return a > 0 ? (iCount - b) % a == 0 : a < 0 ? iCount <= b && iCount % a == 0 : iCount - b == 0;
		}
		m[ssp.PSEUDO_NTH_LAST_CHILD] = function(oNode) {
			var iCount = 1, a = this.arg1, b = this.arg2;
			if (a == 1 && b == 0)
				return true;
			while ((oNode = oNode.nextSibling) && (a > 0 || iCount <= b))
				if (oNode.nodeType == 1)
					iCount++;
			return a > 0 ? (iCount - b) % a == 0 : a < 0 ? iCount <= b && iCount % a == 0 : iCount - b == 0;
		}
		m[ssp.PSEUDO_NTH_OF_TYPE] = function(oNode) {
			var iCount = 1, a = this.arg1, b = this.arg2, sNodeName = oNode.nodeName;
			if (a == 1 && b == 0)
				return true;
			while ((oNode = oNode.previousSibling) && (a > 0 || iCount <= b))
				if (oNode.nodeType == 1 && oNode.nodeName == sNodeName)
					iCount++;
			return a > 0 ? (iCount - b) % a == 0 : a < 0 ? iCount <= b && iCount % a == 0 : iCount - b == 0;
		}
		m[ssp.PSEUDO_NTH_LAST_OF_TYPE] = function(oNode) {
			var iCount = 1, a = this.arg1, b = this.arg2, sNodeName = oNode.nodeName;
			if (a == 1 && b == 0)
				return true;
			while ((oNode = oNode.nextSibling) && (a > 0 || iCount <= b))
				if (oNode.nodeType == 1 && oNode.nodeName == sNodeName)
					iCount++;
			return a > 0 ? (iCount - b) % a == 0 : a < 0 ? iCount <= b && iCount % a == 0 : iCount - b == 0;
		}
		m[ssp.PSEUDO_FIRST_CHILD] = function(oNode) {
			do
				oNode = oNode.previousSibling;
			while (oNode && oNode.nodeType != 1);
			return !oNode;
		}
		m[ssp.PSEUDO_LAST_CHILD] = function(oNode) {
			do
				oNode = oNode.nextSibling;
			while (oNode && oNode.nodeType != 1);
			return !oNode;
		}
		m[ssp.PSEUDO_FIRST_OF_TYPE] = function(oNode) {
			var sNodeName = oNode.nodeName;
			do
				oNode = oNode.previousSibling;
			while (oNode && (oNode.nodeType != 1 || oNode.nodeName != sNodeName));
			return !oNode;
		}
		m[ssp.PSEUDO_LAST_OF_TYPE] = function(oNode) {
			var sNodeName = oNode.nodeName;
			do
				oNode = oNode.nextSibling;
			while (oNode && (oNode.nodeType != 1 || oNode.nodeName != sNodeName));
			return !oNode;
		}
		m[ssp.PSEUDO_ONLY_CHILD] = function(oNode) {
			return m[ssp.PSEUDO_FIRST_CHILD].call(this, oNode, null) &&
					m[ssp.PSEUDO_LAST_CHILD].call(this, oNode, null);
		}
		m[ssp.PSEUDO_ONLY_OF_TYPE] = function(oNode) {
			return m[ssp.PSEUDO_FIRST_OF_TYPE].call(this, oNode, null) &&
					m[ssp.PSEUDO_LAST_OF_TYPE].call(this, oNode, null);
		}
		m[ssp.PSEUDO_EMPTY] = function(oNode) {
			oNode = oNode.firstChild;
			while (oNode && oNode.nodeType != 1 && (oNode.nodeType != 3 || oNode.length == 0))
				oNode = oNode.nextSibling;
			return !oNode;
		}
		m[ssp.PSEUDO_LANG] = function(oNode) {
			var sLang;
			do {
				sLang = oNode.lang || '';
				oNode = oNode.parentNode;
			} while (!sLang && oNode && oNode.nodeType == 1);
			// TODO: add support for language from META element (Content-Language)
			return sLang.toLowerCase().indexOf(this.arg1.toLowerCase()) == 0 &&
					(this.arg1.length == sLang.length || sLang.charAt(this.arg1.length) == '-');
		}
		m[ssp.PSEUDO_ENABLED] = function(oNode) {
			var sTagName = oNode.tagName.toUpperCase();
			return sTagName != 'LINK' && sTagName != 'STYLE' && 'disabled' in oNode && !oNode.disabled;
		}
		m[ssp.PSEUDO_DISABLED] = function(oNode) {
			var sTagName = oNode.tagName.toUpperCase();
			return sTagName != 'LINK' && sTagName != 'STYLE' && 'disabled' in oNode && oNode.disabled;
		}
		m[ssp.PSEUDO_CHECKED] = function(oNode) {
			var sTagName = oNode.tagName.toUpperCase();
			return sTagName == 'INPUT' && oNode.checked || sTagName == 'OPTION' && oNode.selected;
		}
		m[ssp.PSEUDO_READ_ONLY] = function(oNode) {
			return !('readOnly' in oNode) || oNode.readOnly;
		}
		m[ssp.PSEUDO_READ_WRITE] = function(oNode) {
			return 'readOnly' in oNode && !oNode.readOnly;
		}
		m[ssp.PSEUDO_TARGET] = function(oNode) {
			return '#' + oNode.getAttribute('id') == document.location.hash;
		}
		return m;
	}();



	var NotSimpleSelector = function(oSimpleSelector) {
		this.type = ssp.PSEUDO_NOT;
		if (!oSimpleSelector instanceof SimpleSelector)
			throw new Error('Parameter must be instance of SimpleSelector!');
		this.simpleSelector = oSimpleSelector;
	}
	this.NotSimpleSelector = NotSimpleSelector;

	NotSimpleSelector.prototype = extend(SimpleSelector);

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
	this.Parser = Parser;

	Parser.prototype = {};

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

	Parser.attrTypeMap = {
			'=' : ssp.ATTRIBUTE_EQUALS,
			'~=': ssp.ATTRIBUTE_LIST,
			'|=': ssp.ATTRIBUTE_LANG,
			'^=': ssp.ATTRIBUTE_STARTS,
			'$=': ssp.ATTRIBUTE_ENDS,
			'*=': ssp.ATTRIBUTE_CONTAINS
		};

	Parser.pseudoTypeMap = {
			'root'            : ssp.PSEUDO_ROOT,
			'nth-child'       : ssp.PSEUDO_NTH_CHILD,
			'nth-last-child'  : ssp.PSEUDO_NTH_LAST_CHILD,
			'nth-of-type'     : ssp.PSEUDO_NTH_OF_TYPE,
			'nth-last-of-type': ssp.PSEUDO_NTH_LAST_OF_TYPE,
			'first-child'     : ssp.PSEUDO_FIRST_CHILD,
			'last-child'      : ssp.PSEUDO_LAST_CHILD,
			'first-of-type'   : ssp.PSEUDO_FIRST_OF_TYPE,
			'last-of-type'    : ssp.PSEUDO_LAST_OF_TYPE,
			'only-child'      : ssp.PSEUDO_ONLY_CHILD,
			'only-of-type'    : ssp.PSEUDO_ONLY_OF_TYPE,
			'empty'           : ssp.PSEUDO_EMPTY,
			'lang'            : ssp.PSEUDO_LANG,
			'enabled'         : ssp.PSEUDO_ENABLED,
			'disabled'        : ssp.PSEUDO_DISABLED,
			'checked'         : ssp.PSEUDO_CHECKED,
			'read-only'       : ssp.PSEUDO_READ_ONLY,
			'read-write'      : ssp.PSEUDO_READ_WRITE,
			'target'          : ssp.PSEUDO_TARGET,
			'not'             : ssp.PSEUDO_NOT
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
			oCombinator = new Combinator(cp.ROOT);
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
					oCombinator = new Combinator(cp.ROOT);
					oSelectorGroup.add(oSelector);
					oSelector.add(oCombinator);
					break;
				// selectors
				case '*':
					oCombinator.add(new SimpleSelector(ssp.UNIVERSAL));
					break;
				case '.':
					var oSimpleSelector = new SimpleSelector(ssp.CLASS, Parser.decodeIdent(sSelectorPart.substr(1)));
					oSimpleSelector.classRegexp = new RegExp('(^|\\s)' + Parser.escapeRegexp(oSimpleSelector.arg1) + '($|\\s)');
					oCombinator.add(oSimpleSelector);
					break;
				case '#':
					oCombinator.add(new SimpleSelector(ssp.ID, Parser.decodeIdent(sSelectorPart.substr(1))));
					break;
				case '[':
					var parsedAttr = Parser.regexp.attribute.exec(sSelectorPart);
					if (!parsedAttr[2]) {
						oCombinator.add(new SimpleSelector(ssp.ATTRIBUTE_EXIST, Parser.decodeIdent(parsedAttr[1])));
					} else {
						var oSimpleSelector = new SimpleSelector(
								Parser.attrTypeMap[parsedAttr[2]],
								Parser.decodeIdent(parsedAttr[1]),
								parsedAttr[3].charAt(0) == '"' || parsedAttr[3].charAt(0) == "'" ?
									Parser.decodeString(parsedAttr[3]) :
									Parser.decodeIdent(parsedAttr[3])
							);
						if (oSimpleSelector.type == ssp.ATTRIBUTE_LIST)
							oSimpleSelector.attrListRegexp = new RegExp('(^|\\s)' + Parser.escapeRegexp(oSimpleSelector.arg2) + '($|\\s)');
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
					oCombinator = new Combinator(cp.DESCENDANT);
					oSelector.add(oCombinator);
					break;
				case '>':
					oCombinator = new Combinator(cp.CHILD);
					oSelector.add(oCombinator);
					break;
				case '+':
					oCombinator = new Combinator(cp.ADJACENT);
					oSelector.add(oCombinator);
					break;
				case '~':
					oCombinator = new Combinator(cp.SIBLING);
					oSelector.add(oCombinator);
					break;
				// element selector (no single prefix)
				default:
					oCombinator.add(new SimpleSelector(ssp.TYPE, Parser.decodeIdent(sSelectorPart)));
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
	this.CachingParser = CachingParser;
	
	CachingParser.prototype = extend(Parser);
	
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
	this.ParsingException = ParsingException;

	ParsingException.prototype = extend(Error);

	ParsingException.prototype.toString = function() {
		return 'CSS Selector parsing error: ' + this.selector;
	}

}();
