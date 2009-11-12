/**
 * 
 */
gl.dom = {};


/**
 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-102161490
 */
gl.dom.DOMImplementation = function() {
	var oDocument = new gl.dom.Document(document);
	gl.document = oDocument;
	
	var oXHTMLNamespace = new gl.dom.Namespace('http://www.w3.org/1999/xhtml');
	oDocument.registerNamespace(oXHTMLNamespace);
	var oXHTMLNamespace2 = new gl.dom.Namespace(null);
	oDocument.registerNamespace(oXHTMLNamespace2);
	
	var oRoot = oDocument.importNode(oDocument.modelNode.documentElement, true);
	oDocument._appendChild(oRoot);
};
gl.Class.create(gl.dom.DOMImplementation);

gl.dom.DOMImplementation.prototype.createDocumentType = function(sQualifiedName, sPublicId, sSystemId) {
	return new gl.dom.DocumentType(sQualifiedName, sPublicId, sSystemId);
};

gl.dom.DOMImplementation.prototype.createDocument = function(sNamespaceURI, sQualifiedName, oDocType) {
	return new gl.dom.Document(sNamespaceURI, sQualifiedName, oDocType);
};

gl.dom.DOMImplementation.prototype.hasFeature = function(sFeature, sVersion) {
	return true;
};

gl.dom.DOMImplementation.prototype.getFeature = function(sFeature, sVersion) {
	return null;
};


/**
 * 
 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247
 */
gl.dom.Node = function(oDocument, oImportedNode) {
	if (oDocument === undefined) // inheritance protection
		return;
	
	this.ownerDocument = oDocument;
	this.modelNode = oImportedNode;
	oImportedNode.controller = this; // XXX: should this be set here???
	
	this.childNodes = []; // XXX: should be NodeList
};
gl.Class.create(gl.dom.Node);

gl.dom.Node.ELEMENT_NODE                = 1;
gl.dom.Node.ATTRIBUTE_NODE              = 2;
gl.dom.Node.TEXT_NODE                   = 3;
gl.dom.Node.CDATA_SECTION_NODE          = 4;
gl.dom.Node.ENTITY_REFERENCE_NODE       = 5;
gl.dom.Node.ENTITY_NODE                 = 6;
gl.dom.Node.PROCESSING_INSTRUCTION_NODE = 7;
gl.dom.Node.COMMENT_NODE                = 8;
gl.dom.Node.DOCUMENT_NODE               = 9;
gl.dom.Node.DOCUMENT_TYPE_NODE          = 10;
gl.dom.Node.DOCUMENT_FRAGMENT_NODE      = 11;
gl.dom.Node.NOTATION_NODE               = 12;

gl.dom.Node.prototype.getNodeName = function() {
	return this.modelNode.nodeName;
};

gl.dom.Node.prototype.getNodeType = function() {
	return this.modelNode.nodeType;
};

gl.dom.Node.prototype.getNodeValue = function() {
	return this.modelNode.nodeType;
};

gl.dom.Node.prototype.getOwnerDocument = function() {
	return this.ownerDocument;
};

gl.dom.Node.prototype.getParentNode = function() {
	var oParentNode = this.modelNode.parentNode;
	return oParentNode && oParentNode.controller || null;
};

gl.dom.Node.prototype.getPrefix = function() {
	return this.modelNode.prefix;
};

gl.dom.Node.prototype.setPrefix = function(sValue) {
	return this.modelNode.prefix = sValue;
};

gl.dom.Node.prototype.getPreviousSibling = function() {
	var oPreviousSibling = this.modelNode.previousSibling;
	return oPreviousSibling && oPreviousSibling.controller || null;
};

gl.dom.Node.prototype.getTextContent = function() {
	return this.modelNode.textContent;
};

gl.dom.Node.prototype.appendChild = function(oNewChild) {
	this.modelNode.appendChild(oNewChild.modelNode);
	return this._appendChild(oNewChild);
};

gl.dom.Node.prototype._appendChild = function(oNewChild) {
//	this.childNodes += node;
	
//	this.viewGate.appendChild(node.viewNode);
	
//	MutationEvent event = new MutationEvent();
//	event.initMutationEventNS(null, 'DOMNodeInserted', true, false, this, null, null, null, 0);
//	node.dispatchEvent(event);
	
	this.childNodes.push(oNewChild);
	return oNewChild;
};

gl.dom.Node.prototype.cloneNode = function(bDeep) {
	// TODO
	return null;
};

gl.dom.Node.prototype.compareDocumentPosition = function(oOther) {
	return this.modelNode.compareDocumentPosition(oOther.modelNode);
};

gl.dom.Node.prototype.getFeature = function(sFeature, sVersion) {
	return this.modelNode.getFeature(sFeature, sVersion);
};

gl.dom.Node.prototype.getUserData = function(sKey) {
	return this.modelNode.getUserData(sKey);
};

gl.dom.Node.prototype.hasAttributes = function() {
	return this.modelNode.hasAttributes();
};

gl.dom.Node.prototype.hasChildNodes = function() {
	return this.modelNode.hasChildNodes();
};

gl.dom.Node.prototype.insertBefore = function(oNewChild, oRefChild) {
	this.modelNode.insertBefore(oNewChild.modelNode, oRefChild.modelNode);
	return oNewChild;
};

gl.dom.Node.prototype.isDefaultNamespace = function(sNamespaceURI) {
	return this.modelNode.isDefaultNamespace(sNamespaceURI);
};

gl.dom.Node.prototype.isEqualNode = function(oArg) {
	return this.modelNode.isEqualNode(oArg.modelNode);
};

gl.dom.Node.prototype.isSameNode = function(oOther) {
	return this.modelNode.isSameNode(oOther.modelNode);
};

gl.dom.Node.prototype.isSupported = function(sFeature, sVersion) {
	return this.modelNode.isSupported(sFeature, sVersion);
};

gl.dom.Node.prototype.lookupNamespaceURI = function(sPrefix) {
	return this.modelNode.lookupNamespaceURI(sPrefix);
};

gl.dom.Node.prototype.lookupPrefix = function(sNamespaceURI) {
	return this.modelNode.lookupPrefix(sNamespaceURI);
};

gl.dom.Node.prototype.normalize = function() {
	return this.modelNode.normalize();
};

gl.dom.Node.prototype.removeChild = function(oOldChild) {
	this.modelNode.removeChild(oOldChild.modelNode);
	return oOldChild;
};

gl.dom.Node.prototype.replaceChild = function(oNewChild, oOldChild) {
	this.modelNode.removeChild(oNewChild.modelNode, oOldChild.modelNode);
	return oOldChild;
};

gl.dom.Node.prototype.setUserData = function(sKey, oData, oHandler) {
	return this.modelNode.setUserData(sKey, oData, oHandler);
};

gl.dom.Node.prototype.toString = function() {
	return 'gl.dom.Node';
};


/**
 * 
 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#i-Document
 */
gl.dom.Document = function(oImportedNode) {
	gl.dom.Node.call(this, null, oImportedNode);
	this.namespaces = {};
};
gl.Class.create(gl.dom.Document, gl.dom.Node);

gl.dom.Document.prototype.registerNamespace = function(oNamespace) {
	this.namespaces[oNamespace.name] = oNamespace;
};

gl.dom.Document.prototype.getDoctype = function() {
	// TODO: return DocumentType instance
	return this.modelNode.doctype;
};

gl.dom.Document.prototype.getDocumentElement = function() {
	var oElement = this.modelNode.documentElement;
	return oElement && oElement.controller || null;
};

gl.dom.Document.prototype.getDocumentURI = function() {
	return this.modelNode.documentURI;
};

gl.dom.Document.prototype.getInputEncoding = function() {
	return this.modelNode.inputEncoding;
};

gl.dom.Document.prototype.getStrictErrorChecking = function() {
	return this.modelNode.strictErrorChecking;
};

gl.dom.Document.prototype.setStrictErrorChecking = function(bValue) {
	return this.modelNode.strictErrorChecking = bValue;
};

gl.dom.Document.prototype.getXmlEncoding = function() {
	return this.modelNode.xmlEncoding;
};

gl.dom.Document.prototype.getXmlStandalone = function() {
	return this.modelNode.xmlEncoding;
};

gl.dom.Document.prototype.getXmlStandalone = function() {
	return this.modelNode.xmlStandalone;
};

gl.dom.Document.prototype.setXmlStandalone = function(bValue) {
	return this.modelNode.xmlStandalone = bValue;
};

gl.dom.Document.prototype.getXmlVersion = function() {
	return this.modelNode.xmlVersion;
};

gl.dom.Document.prototype.setXmlVersion = function(sValue) {
	return this.modelNode.xmlVersion = sValue;
};

/**
 * TODO: implement deep = false
 */
gl.dom.Document.prototype.importNode = function(oImportedNode, bDeep) {
	switch (oImportedNode.nodeType) {
	case gl.dom.Node.ELEMENT_NODE:
		return this._createElementNS(oImportedNode.namespaceURI, oImportedNode.localName, oImportedNode);
	case gl.dom.Node.ATTRIBUTE_NODE:
		return this._createAttributeNS(oImportedNode.namespaceURI, oImportedNode.localName, oImportedNode);
	case gl.dom.Node.TEXT_NODE:
		return this._createTextNode(oImportedNode);
	case gl.dom.Node.COMMENT_NODE:
		return this._createComment(oImportedNode);
	default:
		throw new Error('Node type not supported');
	}
};

gl.dom.Document.prototype._createElementNS = function(sNamespaceURI, sLocalName, oImportedNode) {
	var oNamespace = this.namespaces[sNamespaceURI];
	var cElement = oNamespace.getElementClass(sLocalName);
	var oElement = new cElement(this, oImportedNode);
	oElement.import();
	return oElement;
};

gl.dom.Document.prototype._createTextNode = function(oImportedNode) {
	return new gl.dom.Text(oImportedNode.data, oImportedNode);
};

gl.dom.Document.prototype.toString = function() {
	return 'gl.dom.Document';
};


/**
 * 
 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-745549614
 */
gl.dom.Element = function(oDocument, oImportedNode) {
	gl.dom.Node.call(this, oDocument, oImportedNode);
};
gl.Class.create(gl.dom.Element, gl.dom.Node);

gl.dom.Element.prototype.import = function() {
	var aChildNodes = this.modelNode.childNodes;
	
	for (var i = 0, len = aChildNodes.length; i < len; i++) {
		var oNode = this.ownerDocument.importNode(aChildNodes[i], true);
		this._appendChild(oNode);
	}
	
	return this;
};

gl.dom.Element.prototype.getSchemaTypeInfo = function() {
	// TODO: return TypeInfo instance
	return this.modelNode.schemaTypeInfo;
};

gl.dom.Element.prototype.getTagName = function() {
	return this.modelNode.tagName;
};

gl.dom.Element.prototype.getAttribute = function(sName) {
	return this.modelNode.getAttribute(sName);
};

gl.dom.Element.prototype.getAttributeNS = function(sNamespaceURI, sLocalName) {
	return this.modelNode.getAttributeNS(sNamespaceURI, sLocalName);
};

gl.dom.Element.prototype.getAttributeNode = function(sName) {
	// TODO: return Attr instance
	return this.modelNode.getAttributeNode(sName);
};

gl.dom.Element.prototype.getAttributeNodeNS = function(sNamespaceURI, sLocalName) {
	// TODO: return Attr instance
	return this.modelNode.getAttributeNodeNS(sNamespaceURI, sLocalName);
};

gl.dom.Element.prototype.getElementsByTagName = function(sName) {
	// TODO: return live NodeList
	var oElements = this.modelNode.getElementsByTagName(sName);
	var aElements = [];
	for (var i = 0, len = oElements.length; i < len; i++) {
		if (oElements.item(i).controller)
			aElements.push(oElements.item(i).controller);
	}
	return aElements;
};

gl.dom.Element.prototype.getElementsByTagNameNS = function(sNamespaceURI, sLocalName) {
	// TODO: return live NodeList
	var oElements = this.modelNode.getElementsByTagNameNS(sNamespaceURI, sLocalName);
	var aElements = [];
	for (var i = 0, len = oElements.length; i < len; i++) {
		if (oElements.item(i).controller)
			aElements.push(oElements.item(i).controller);
	}
	return aElements;
};

gl.dom.Element.prototype.hasAttribute = function(sName) {
	return this.modelNode.hasAttribute(sName);
};

gl.dom.Element.prototype.hasAttributeNS = function(sNamespaceURI, sLocalName) {
	return this.modelNode.hasAttributeNS(sNamespaceURI, sLocalName);
};

gl.dom.Element.prototype.removeAttribute = function(sName) {
	this.modelNode.removeAttribute(sName);
};

gl.dom.Element.prototype.removeAttributeNS = function(sNamespaceURI, sLocalName) {
	this.modelNode.removeAttributeNS(sNamespaceURI, sLocalName);
};

gl.dom.Element.prototype.removeAttributeNode = function(oOldAttr) {
	// TODO: return Attr instance
	return this.modelNode.removeAttributeNode(oOldAttr.modelNode);
};

gl.dom.Element.prototype.setAttribute = function(sName, sValue) {
	this.modelNode.setAttribute(sName, sValue);
};

gl.dom.Element.prototype.setAttributeNS = function(sNamespaceURI, sLocalName, sValue) {
	this.modelNode.setAttributeNS(sNamespaceURI, sLocalName);
};

gl.dom.Element.prototype.setAttributeNode = function(oNewAttr) {
	// TODO: return Attr instance
	return this.modelNode.setAttributeNode(oNewAttr.modelNode);
};

gl.dom.Element.prototype.setAttributeNodeNS = function(oNewAttr) {
	// TODO: return Attr instance
	return this.modelNode.setAttributeNodeNS(oNewAttr.modelNode);
};

gl.dom.Element.prototype.setIdAttribute = function(sName, bIsId) {
	this.modelNode.setIdAttribute(sName, bIsId);
};

gl.dom.Element.prototype.setIdAttributeNS = function(sNamespaceURI, sLocalName, bIsId) {
	this.modelNode.setIdAttribute(sNamespaceURI, sLocalName, bIsId);
};

gl.dom.Element.prototype.setIdAttributeNode = function(oIdAttr, bIsId) {
	this.modelNode.setIdAttributeNode(oIdAttr, bIsId);
};

gl.dom.Element.prototype.toString = function() {
	return 'gl.dom.Element (' + this.modelNode.localName + ')';
};


/**
 * 
 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-637646024
 */
gl.dom.Attr = function() {
};
gl.Class.create(gl.dom.Attr, gl.dom.Node);

gl.dom.Attr.prototype.isId = function() {
	return this.modelNode.isId;
};

gl.dom.Attr.prototype.getName = function() {
	return this.modelNode.name;
};

gl.dom.Attr.prototype.getOwnerElement = function() {
	var oElement = this.modelNode.ownerElement;
	return oElement && oElement.controller || null;
};

gl.dom.Attr.prototype.getSchemaTypeInfo = function() {
	// TODO: return TypeInfo instance
	return this.modelNode.getSchemaTypeInfo;
};

gl.dom.Attr.prototype.getSpecified = function() {
	return this.modelNode.specified;
};

gl.dom.Attr.prototype.getValue = function() {
	return this.modelNode.value;
};

gl.dom.Attr.prototype.setValue = function(sValue) {
	return this.modelNode.value = sValue;
};

gl.dom.Attr.prototype.toString = function() {
	return 'gl.dom.Attr';
};


/**
 * 
 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-FF21A306
 */
gl.dom.CharacterData = function(oDocument, oImportedNode) {
	if (oDocument === undefined) // inheritance protection
		return;
	
	gl.dom.Node.call(this, oDocument, oImportedNode);
//	this.data = oImportedNode.data;
};
gl.Class.create(gl.dom.CharacterData, gl.dom.Node);

gl.dom.CharacterData.prototype.getData = function() {
	return this.modelNode.data;
};

gl.dom.CharacterData.prototype.setData = function(sValue) {
	return this.modelNode.data = sValue;
};

gl.dom.CharacterData.prototype.getLength = function() {
	return this.modelNode.length;
};

gl.dom.CharacterData.prototype.appendData = function(sArg) {
	this.modelNode.appendData(sArg);
};

gl.dom.CharacterData.prototype.deleteData = function(iOffset, iCount) {
	this.modelNode.deleteData(iOffset, iCount);
};

gl.dom.CharacterData.prototype.insertData = function(iOffset, sArg) {
	this.modelNode.insertData(iOffset, sArg);
};

gl.dom.CharacterData.prototype.replaceData = function(iOffset, iCount, sArg) {
	this.modelNode.replaceData(iOffset, iCount, sArg);
};

gl.dom.CharacterData.prototype.substringData = function(iOffset, iCount) {
	return this.modelNode.substringData(iOffset, iCount);
};

gl.dom.CharacterData.prototype.toString = function() {
	return 'gl.dom.CharacterData';
};


/**
 * 
 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1312295772
 */
gl.dom.Text = function(oDocument, oImportedNode) {
	gl.dom.CharacterData.call(this, oDocument, oImportedNode);
};
gl.Class.create(gl.dom.Text, gl.dom.CharacterData);

gl.dom.Text.prototype.toString = function() {
	return 'gl.dom.Text';
};

gl.dom.Text.prototype.getIsElementContentWhitespace = function() {
	return this.modelNode.isElementContentWhitespace;
};

gl.dom.Text.prototype.getWholeText = function() {
	return this.modelNode.wholeText;
};

gl.dom.Text.prototype.replaceWholeText = function(sContent) {
	// TODO: return Text instance
	return this.modelNode.replaceWholeText(sContent);
};

gl.dom.Text.prototype.splitText = function(iOffset) {
	return this.modelNode.splitText(iOffset);
};


/**
 * 
 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1728279322
 */
gl.dom.Comment = function(oDocument, oImportedNode) {
	gl.dom.CharacterData.call(this, oDocument, oImportedNode);
};
gl.Class.create(gl.dom.Comment, gl.dom.CharacterData);

gl.dom.Comment.prototype.toString = function() {
	return 'gl.dom.Comment';
};


/**
 * 
 */
gl.dom.Namespace = function(sName) {
	this.name = sName;
};
gl.Class.create(gl.dom.Namespace);

gl.dom.Namespace.prototype.getElementClass = function(sName) {
	// Default implementation is to always return generic Element instance
	return gl.dom.Element;
};

gl.dom.Namespace.prototype.toString = function() {
	return 'gl.dom.Namespace';
};


/**
 * 
 * See: http://www.w3.org/TR/DOM-Level-3-Events/events.html#Events-Event
 */
gl.dom.Event = function() {
	this.timestamp = new Date().getTime();
};
gl.Class.create(gl.dom.Event);

gl.dom.Event.CAPTURING_PHASE = 1;
gl.dom.Event.AT_TARGET       = 2;
gl.dom.Event.BUBBLING_PHASE  = 3;

gl.dom.Event.prototype.bubbles = false;
gl.dom.Event.prototype.cancelable = false;
gl.dom.Event.prototype.currentTarget = null;
gl.dom.Event.prototype.defaultPrevented = false;
gl.dom.Event.prototype.eventPhase = 0;
gl.dom.Event.prototype.immediatePropagationStopped = false;
gl.dom.Event.prototype.namespaceURI = null;
gl.dom.Event.prototype.propagationStopped = false;
gl.dom.Event.prototype.target = null;
gl.dom.Event.prototype.timestamp = new Date().getTime();
gl.dom.Event.prototype.type = null;

gl.dom.Event.prototype.getBubbles = function() {
	return this.bubbles;
};

gl.dom.Event.prototype.getCancelable = function() {
	return this.cancelable;
};

gl.dom.Event.prototype.getCurrentTarget = function() {
	return this.currentTarget;
};

gl.dom.Event.prototype.getDefaultPrevented = function() {
	return this.defaultPrevented;
};

gl.dom.Event.prototype.getEventPhase = function() {
	return this.eventPhase;
};

gl.dom.Event.prototype.getNamespaceURI = function() {
	return this.namespaceURI;
};

gl.dom.Event.prototype.getTarget = function() {
	return this.target;
};

gl.dom.Event.prototype.getTimestamp = function() {
	return this.timestamp;
};

gl.dom.Event.prototype.getType = function() {
	return this.type;
};

gl.dom.Event.prototype.initEvent = function(sEventType, bCanBubble, bCancelable) {
	this.initEventNS(null, sEventType, bCanBubble, bCancelable);
};

gl.dom.Event.prototype.initEventNS = function(sNamespaceURI, sEventType, bCanBubble, bCancelable) {
	this.namespaceURI = sNamespaceURI;
	this.type = sEventType;
	this.bubbles = bCanBubble;
	this.cancelable = bCancelable;
};

gl.dom.Event.prototype.preventDefault = function() {
	this.defaultPrevented = true;
};

gl.dom.Event.prototype.stopImmediatePropagation = function() {
	this.immediatePropagationStopped = true;
};

gl.dom.Event.prototype.stopPropagation = function() {
	this.propagationStopped = true;
};


/**
 * 
 * See: http://www.w3.org/TR/DOM-Level-3-Events/events.html#Events-CustomEvent
 */
gl.dom.CustomEvent = function() {
	gl.dom.Event.call(this);
};
gl.Class.create(gl.dom.CustomEvent, gl.dom.Event);

gl.dom.CustomEvent.prototype.detail = null;

gl.dom.CustomEvent.prototype.getDetail = function() {
	return this.detail;
};

gl.dom.CustomEvent.prototype.initCustomEventNS = function(sNamespaceURI, sEventType, bCanBubble, bCancelable, oDetail) {
	this.detail = oDetail;
	this.initEventNS(sNamespaceURI, sEventType, bCanBubble, bCancelable);
};


/**
 * 
 * See: http://www.w3.org/TR/DOM-Level-3-Events/events.html#Events-CustomEvent
 */
gl.dom.CustomEvent = function() {
	gl.dom.Event.call(this);
};
gl.dom.CustomEvent.prototype = new gl.dom.Event();

gl.dom.CustomEvent.prototype.detail = null;

gl.dom.CustomEvent.prototype.getDetail = function() {
	return this.detail;
};

gl.dom.CustomEvent.prototype.initCustomEventNS = function(sNamespaceURI, sEventType, bCanBubble, bCancelable, oDetail) {
	this.detail = oDetail;
	this.initEventNS(sNamespaceURI, sEventType, bCanBubble, bCancelable);
};


/**
 * 
 * See: http://www.w3.org/TR/DOM-Level-3-Events/events.html#Events-CustomEvent
 */
gl.dom.EventTarget = function() {
};
gl.Class.create(gl.dom.EventTarget, gl.Object);

gl.dom.EventTarget.prototype.addEventListener = function(sType, oListener, bUseCapture) {
	
};

gl.dom.EventTarget.prototype.addEventListenerNS = function(sNamespaceURI, sType, oListener, bUseCapture) {
	
};

gl.dom.EventTarget.prototype.dispatchEvent = function(oEvent) {
	
};

gl.dom.EventTarget.prototype.removeEventListener = function(sType, oListener, bUseCapture) {
	
};

gl.dom.EventTarget.prototype.removeEventListenerNS = function(sNamespaceURI, sType, oListener, bUseCapture) {
	
};


/**
 * 
 * See: http://www.w3.org/TR/DOM-Level-3-Events/events.html#Events-EventListener
 */
gl.dom.EventListener = function() {
};
gl.dom.EventTarget.prototype = new gl.Object();

gl.dom.EventTarget.prototype.handleEvent = function(oEvent) {
	
};


/**
 * 
 * See: http://www.w3.org/TR/DOM-Level-3-Events/events.html#Events-EventListener
 */
gl.dom.DocumentEvent = function() {
};
gl.Class.create(gl.dom.DocumentEvent);

gl.dom.DocumentEvent.prototype.canDispatch = function(sNamespaceURI, sType) {
	
};

gl.dom.DocumentEvent.prototype.createEvent = function(sEventType) {
	
};


/**
 * *** NOT USED YET ***
 * HTML element
 */
gl.dom.HTMLElement = function(oDocument, oImportedNode) {
};
gl.Class.create(gl.dom.HTMLElement, gl.dom.Element);

gl.dom.HTMLElement.prototype.getTagName = function() {
	return this.modelNode.tagName.toUpperCase();
};


