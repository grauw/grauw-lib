/**
 * 
 */
gl.module('gl.dom', [], function() {
	
	/**
	 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-102161490
	 */
	DOMImplementation = function() {
		var oDocument = new Document(document);
		gl.document = oDocument;
		
		var oXHTMLNamespace = new Namespace('http://www.w3.org/1999/xhtml');
		oDocument.registerNamespace(oXHTMLNamespace);
		var oXHTMLNamespace2 = new Namespace(null);
		oDocument.registerNamespace(oXHTMLNamespace2);
		
		var oRoot = oDocument.importNode(oDocument.model.documentElement, true);
		oDocument._appendChild(oRoot);
	};
	this.DOMImplementation = DOMImplementation;
	
	DOMImplementation.prototype.createDocumentType = function(sQualifiedName, sPublicId, sSystemId) {
		return new DocumentType(sQualifiedName, sPublicId, sSystemId);
	};
	
	DOMImplementation.prototype.createDocument = function(sNamespaceURI, sQualifiedName, oDocType) {
		return new Document(sNamespaceURI, sQualifiedName, oDocType);
	};
	
	DOMImplementation.prototype.hasFeature = function(sFeature, sVersion) {
		return true;
	};
	
	DOMImplementation.prototype.getFeature = function(sFeature, sVersion) {
		return null;
	};
	
	
	/**
	 * 
	 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247
	 */
	Node = function(oDocument, oImportedNode) {
		if (oDocument === undefined) // inheritance protection
			return;
		
		this.ownerDocument = oDocument;
		this.model = oImportedNode;
		oImportedNode.controller = this; // XXX: should this be set here???
		
		this.childNodes = []; // XXX: should be NodeList
	};
	this.Node = Node;
	
	Node.ELEMENT_NODE                = 1;
	Node.ATTRIBUTE_NODE              = 2;
	Node.TEXT_NODE                   = 3;
	Node.CDATA_SECTION_NODE          = 4;
	Node.ENTITY_REFERENCE_NODE       = 5;
	Node.ENTITY_NODE                 = 6;
	Node.PROCESSING_INSTRUCTION_NODE = 7;
	Node.COMMENT_NODE                = 8;
	Node.DOCUMENT_NODE               = 9;
	Node.DOCUMENT_TYPE_NODE          = 10;
	Node.DOCUMENT_FRAGMENT_NODE      = 11;
	Node.NOTATION_NODE               = 12;
	
	Node.prototype.getNodeName = function() {
		return this.model.nodeName;
	};
	
	Node.prototype.getNodeType = function() {
		return this.model.nodeType;
	};
	
	Node.prototype.getNodeValue = function() {
		return this.model.nodeType;
	};
	
	Node.prototype.getOwnerDocument = function() {
		return this.ownerDocument;
	};
	
	Node.prototype.getParentNode = function() {
		var oParentNode = this.model.parentNode;
		return oParentNode && oParentNode.controller || null;
	};
	
	Node.prototype.getPrefix = function() {
		return this.model.prefix;
	};
	
	Node.prototype.setPrefix = function(sValue) {
		return this.model.prefix = sValue;
	};
	
	Node.prototype.getPreviousSibling = function() {
		var oPreviousSibling = this.model.previousSibling;
		return oPreviousSibling && oPreviousSibling.controller || null;
	};
	
	Node.prototype.getTextContent = function() {
		return this.model.textContent;
	};
	
	Node.prototype.appendChild = function(oNewChild) {
		this.model.appendChild(oNewChild.model);
		return this._appendChild(oNewChild);
	};
	
	Node.prototype._appendChild = function(oNewChild) {
	//	this.childNodes += node;
		
	//	this.viewGate.appendChild(node.view);
		
	//	MutationEvent event = new MutationEvent();
	//	event.initMutationEventNS(null, 'DOMNodeInserted', true, false, this, null, null, null, 0);
	//	node.dispatchEvent(event);
		
		this.childNodes.push(oNewChild);
		return oNewChild;
	};
	
	Node.prototype.cloneNode = function(bDeep) {
		// TODO
		return null;
	};
	
	Node.prototype.compareDocumentPosition = function(oOther) {
		return this.model.compareDocumentPosition(oOther.model);
	};
	
	Node.prototype.getFeature = function(sFeature, sVersion) {
		return this.model.getFeature(sFeature, sVersion);
	};
	
	Node.prototype.getUserData = function(sKey) {
		return this.model.getUserData(sKey);
	};
	
	Node.prototype.hasAttributes = function() {
		return this.model.hasAttributes();
	};
	
	Node.prototype.hasChildNodes = function() {
		return this.model.hasChildNodes();
	};
	
	Node.prototype.insertBefore = function(oNewChild, oRefChild) {
		this.model.insertBefore(oNewChild.model, oRefChild.model);
		return oNewChild;
	};
	
	Node.prototype.isDefaultNamespace = function(sNamespaceURI) {
		return this.model.isDefaultNamespace(sNamespaceURI);
	};
	
	Node.prototype.isEqualNode = function(oArg) {
		return this.model.isEqualNode(oArg.model);
	};
	
	Node.prototype.isSameNode = function(oOther) {
		return this.model.isSameNode(oOther.model);
	};
	
	Node.prototype.isSupported = function(sFeature, sVersion) {
		return this.model.isSupported(sFeature, sVersion);
	};
	
	Node.prototype.lookupNamespaceURI = function(sPrefix) {
		return this.model.lookupNamespaceURI(sPrefix);
	};
	
	Node.prototype.lookupPrefix = function(sNamespaceURI) {
		return this.model.lookupPrefix(sNamespaceURI);
	};
	
	Node.prototype.normalize = function() {
		return this.model.normalize();
	};
	
	Node.prototype.removeChild = function(oOldChild) {
		this.model.removeChild(oOldChild.model);
		return oOldChild;
	};
	
	Node.prototype.replaceChild = function(oNewChild, oOldChild) {
		this.model.removeChild(oNewChild.model, oOldChild.model);
		return oOldChild;
	};
	
	Node.prototype.setUserData = function(sKey, oData, oHandler) {
		return this.model.setUserData(sKey, oData, oHandler);
	};
	
	Node.prototype.toString = function() {
		return 'Node';
	};
	
	
	/**
	 * 
	 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#i-Document
	 */
	Document = function(oImportedNode) {
		Node.call(this, null, oImportedNode);
		this.namespaces = {};
	};
	this.Document = gl.extend(Node, Document);
	
	Document.prototype.registerNamespace = function(oNamespace) {
		this.namespaces[oNamespace.name] = oNamespace;
	};
	
	Document.prototype.getDoctype = function() {
		// TODO: return DocumentType instance
		return this.model.doctype;
	};
	
	Document.prototype.getDocumentElement = function() {
		var oElement = this.model.documentElement;
		return oElement && oElement.controller || null;
	};
	
	Document.prototype.getDocumentURI = function() {
		return this.model.documentURI;
	};
	
	Document.prototype.getInputEncoding = function() {
		return this.model.inputEncoding;
	};
	
	Document.prototype.getStrictErrorChecking = function() {
		return this.model.strictErrorChecking;
	};
	
	Document.prototype.setStrictErrorChecking = function(bValue) {
		return this.model.strictErrorChecking = bValue;
	};
	
	Document.prototype.getXmlEncoding = function() {
		return this.model.xmlEncoding;
	};
	
	Document.prototype.getXmlStandalone = function() {
		return this.model.xmlEncoding;
	};
	
	Document.prototype.getXmlStandalone = function() {
		return this.model.xmlStandalone;
	};
	
	Document.prototype.setXmlStandalone = function(bValue) {
		return this.model.xmlStandalone = bValue;
	};
	
	Document.prototype.getXmlVersion = function() {
		return this.model.xmlVersion;
	};
	
	Document.prototype.setXmlVersion = function(sValue) {
		return this.model.xmlVersion = sValue;
	};
	
	/**
	 * TODO: implement deep = false
	 */
	Document.prototype.importNode = function(oImportedNode, bDeep) {
		switch (oImportedNode.nodeType) {
		case Node.ELEMENT_NODE:
			return this._createElementNS(oImportedNode.namespaceURI, oImportedNode.localName, oImportedNode);
		case Node.ATTRIBUTE_NODE:
			return this._createAttributeNS(oImportedNode.namespaceURI, oImportedNode.localName, oImportedNode);
		case Node.TEXT_NODE:
			return this._createTextNode(oImportedNode);
		case Node.COMMENT_NODE:
			return this._createComment(oImportedNode);
		default:
			throw new Error('Node type not supported');
		}
	};
	
	Document.prototype._createElementNS = function(sNamespaceURI, sLocalName, oImportedNode) {
		var oNamespace = this.namespaces[sNamespaceURI];
		var cElement = oNamespace.getElementClass(sLocalName);
		var oElement = new cElement(this, oImportedNode);
		oElement.import();
		return oElement;
	};
	
	Document.prototype._createTextNode = function(oImportedNode) {
		return new Text(oImportedNode.data, oImportedNode);
	};
	
	Document.prototype.toString = function() {
		return 'Document';
	};
	
	
	/**
	 * 
	 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-745549614
	 */
	Element = function(oDocument, oImportedNode) {
		Node.call(this, oDocument, oImportedNode);
	};
	this.Element = gl.extend(Node, Element);
	
	Element.prototype.import = function() {
		var aChildNodes = this.model.childNodes;
		
		for (var i = 0, len = aChildNodes.length; i < len; i++) {
			var oNode = this.ownerDocument.importNode(aChildNodes[i], true);
			this._appendChild(oNode);
		}
		
		return this;
	};
	
	Element.prototype.getSchemaTypeInfo = function() {
		// TODO: return TypeInfo instance
		return this.model.schemaTypeInfo;
	};
	
	Element.prototype.getTagName = function() {
		return this.model.tagName;
	};
	
	Element.prototype.getAttribute = function(sName) {
		return this.model.getAttribute(sName);
	};
	
	Element.prototype.getAttributeNS = function(sNamespaceURI, sLocalName) {
		return this.model.getAttributeNS(sNamespaceURI, sLocalName);
	};
	
	Element.prototype.getAttributeNode = function(sName) {
		// TODO: return Attr instance
		return this.model.getAttributeNode(sName);
	};
	
	Element.prototype.getAttributeNodeNS = function(sNamespaceURI, sLocalName) {
		// TODO: return Attr instance
		return this.model.getAttributeNodeNS(sNamespaceURI, sLocalName);
	};
	
	Element.prototype.getElementsByTagName = function(sName) {
		// TODO: return live NodeList
		var oElements = this.model.getElementsByTagName(sName);
		var aElements = [];
		for (var i = 0, len = oElements.length; i < len; i++) {
			if (oElements.item(i).controller)
				aElements.push(oElements.item(i).controller);
		}
		return aElements;
	};
	
	Element.prototype.getElementsByTagNameNS = function(sNamespaceURI, sLocalName) {
		// TODO: return live NodeList
		var oElements = this.model.getElementsByTagNameNS(sNamespaceURI, sLocalName);
		var aElements = [];
		for (var i = 0, len = oElements.length; i < len; i++) {
			if (oElements.item(i).controller)
				aElements.push(oElements.item(i).controller);
		}
		return aElements;
	};
	
	Element.prototype.hasAttribute = function(sName) {
		return this.model.hasAttribute(sName);
	};
	
	Element.prototype.hasAttributeNS = function(sNamespaceURI, sLocalName) {
		return this.model.hasAttributeNS(sNamespaceURI, sLocalName);
	};
	
	Element.prototype.removeAttribute = function(sName) {
		this.model.removeAttribute(sName);
	};
	
	Element.prototype.removeAttributeNS = function(sNamespaceURI, sLocalName) {
		this.model.removeAttributeNS(sNamespaceURI, sLocalName);
	};
	
	Element.prototype.removeAttributeNode = function(oOldAttr) {
		// TODO: return Attr instance
		return this.model.removeAttributeNode(oOldAttr.model);
	};
	
	Element.prototype.setAttribute = function(sName, sValue) {
		this.model.setAttribute(sName, sValue);
	};
	
	Element.prototype.setAttributeNS = function(sNamespaceURI, sLocalName, sValue) {
		this.model.setAttributeNS(sNamespaceURI, sLocalName);
	};
	
	Element.prototype.setAttributeNode = function(oNewAttr) {
		// TODO: return Attr instance
		return this.model.setAttributeNode(oNewAttr.model);
	};
	
	Element.prototype.setAttributeNodeNS = function(oNewAttr) {
		// TODO: return Attr instance
		return this.model.setAttributeNodeNS(oNewAttr.model);
	};
	
	Element.prototype.setIdAttribute = function(sName, bIsId) {
		this.model.setIdAttribute(sName, bIsId);
	};
	
	Element.prototype.setIdAttributeNS = function(sNamespaceURI, sLocalName, bIsId) {
		this.model.setIdAttribute(sNamespaceURI, sLocalName, bIsId);
	};
	
	Element.prototype.setIdAttributeNode = function(oIdAttr, bIsId) {
		this.model.setIdAttributeNode(oIdAttr, bIsId);
	};
	
	Element.prototype.toString = function() {
		return 'Element (' + this.model.localName + ')';
	};
	
	
	/**
	 * 
	 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-637646024
	 */
	Attr = function() {
	};
	this.Attr = gl.extend(Node, Attr);
	
	Attr.prototype.isId = function() {
		return this.model.isId;
	};
	
	Attr.prototype.getName = function() {
		return this.model.name;
	};
	
	Attr.prototype.getOwnerElement = function() {
		var oElement = this.model.ownerElement;
		return oElement && oElement.controller || null;
	};
	
	Attr.prototype.getSchemaTypeInfo = function() {
		// TODO: return TypeInfo instance
		return this.model.getSchemaTypeInfo;
	};
	
	Attr.prototype.getSpecified = function() {
		return this.model.specified;
	};
	
	Attr.prototype.getValue = function() {
		return this.model.value;
	};
	
	Attr.prototype.setValue = function(sValue) {
		return this.model.value = sValue;
	};
	
	Attr.prototype.toString = function() {
		return 'Attr';
	};
	
	
	/**
	 * 
	 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-FF21A306
	 */
	CharacterData = function(oDocument, oImportedNode) {
		if (oDocument === undefined) // inheritance protection
			return;
		
		Node.call(this, oDocument, oImportedNode);
	//	this.data = oImportedNode.data;
	};
	this.CharacterData = gl.extend(Node, CharacterData);
	
	CharacterData.prototype.getData = function() {
		return this.model.data;
	};
	
	CharacterData.prototype.setData = function(sValue) {
		return this.model.data = sValue;
	};
	
	CharacterData.prototype.getLength = function() {
		return this.model.length;
	};
	
	CharacterData.prototype.appendData = function(sArg) {
		this.model.appendData(sArg);
	};
	
	CharacterData.prototype.deleteData = function(iOffset, iCount) {
		this.model.deleteData(iOffset, iCount);
	};
	
	CharacterData.prototype.insertData = function(iOffset, sArg) {
		this.model.insertData(iOffset, sArg);
	};
	
	CharacterData.prototype.replaceData = function(iOffset, iCount, sArg) {
		this.model.replaceData(iOffset, iCount, sArg);
	};
	
	CharacterData.prototype.substringData = function(iOffset, iCount) {
		return this.model.substringData(iOffset, iCount);
	};
	
	CharacterData.prototype.toString = function() {
		return 'CharacterData';
	};
	
	
	/**
	 * 
	 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1312295772
	 */
	Text = function(oDocument, oImportedNode) {
		CharacterData.call(this, oDocument, oImportedNode);
	};
	this.Text = gl.extend(CharacterData, Text);
	
	Text.prototype.toString = function() {
		return 'Text';
	};
	
	Text.prototype.getIsElementContentWhitespace = function() {
		return this.model.isElementContentWhitespace;
	};
	
	Text.prototype.getWholeText = function() {
		return this.model.wholeText;
	};
	
	Text.prototype.replaceWholeText = function(sContent) {
		// TODO: return Text instance
		return this.model.replaceWholeText(sContent);
	};
	
	Text.prototype.splitText = function(iOffset) {
		return this.model.splitText(iOffset);
	};
	
	
	/**
	 * 
	 * See: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1728279322
	 */
	Comment = function(oDocument, oImportedNode) {
		CharacterData.call(this, oDocument, oImportedNode);
	};
	this.Comment = gl.extend(CharacterData, Comment);
	
	Comment.prototype.toString = function() {
		return 'Comment';
	};
	
	
	/**
	 * 
	 */
	Namespace = function(sName) {
		this.name = sName;
	};
	this.Namespace = Namespace;
	
	Namespace.prototype.getElementClass = function(sName) {
		// Default implementation is to always return generic Element instance
		return Element;
	};
	
	Namespace.prototype.toString = function() {
		return 'Namespace';
	};
	
	
	/**
	 * 
	 * See: http://www.w3.org/TR/DOM-Level-3-Events/events.html#Events-Event
	 */
	Event = function() {
		this.timestamp = new Date().getTime();
	};
	this.Event = Event;
	
	Event.CAPTURING_PHASE = 1;
	Event.AT_TARGET       = 2;
	Event.BUBBLING_PHASE  = 3;
	
	Event.prototype.bubbles = false;
	Event.prototype.cancelable = false;
	Event.prototype.currentTarget = null;
	Event.prototype.defaultPrevented = false;
	Event.prototype.eventPhase = 0;
	Event.prototype.immediatePropagationStopped = false;
	Event.prototype.namespaceURI = null;
	Event.prototype.propagationStopped = false;
	Event.prototype.target = null;
	Event.prototype.timestamp = new Date().getTime();
	Event.prototype.type = null;
	
	Event.prototype.getBubbles = function() {
		return this.bubbles;
	};
	
	Event.prototype.getCancelable = function() {
		return this.cancelable;
	};
	
	Event.prototype.getCurrentTarget = function() {
		return this.currentTarget;
	};
	
	Event.prototype.getDefaultPrevented = function() {
		return this.defaultPrevented;
	};
	
	Event.prototype.getEventPhase = function() {
		return this.eventPhase;
	};
	
	Event.prototype.getNamespaceURI = function() {
		return this.namespaceURI;
	};
	
	Event.prototype.getTarget = function() {
		return this.target;
	};
	
	Event.prototype.getTimestamp = function() {
		return this.timestamp;
	};
	
	Event.prototype.getType = function() {
		return this.type;
	};
	
	Event.prototype.initEvent = function(sEventType, bCanBubble, bCancelable) {
		this.initEventNS(null, sEventType, bCanBubble, bCancelable);
	};
	
	Event.prototype.initEventNS = function(sNamespaceURI, sEventType, bCanBubble, bCancelable) {
		this.namespaceURI = sNamespaceURI;
		this.type = sEventType;
		this.bubbles = bCanBubble;
		this.cancelable = bCancelable;
	};
	
	Event.prototype.preventDefault = function() {
		this.defaultPrevented = true;
	};
	
	Event.prototype.stopImmediatePropagation = function() {
		this.immediatePropagationStopped = true;
	};
	
	Event.prototype.stopPropagation = function() {
		this.propagationStopped = true;
	};
	
	
	/**
	 * 
	 * See: http://www.w3.org/TR/DOM-Level-3-Events/events.html#Events-CustomEvent
	 */
	CustomEvent = function() {
		Event.call(this);
	};
	this.CustomEvent = gl.extend(Event, CustomEvent);
	
	CustomEvent.prototype.detail = null;
	
	CustomEvent.prototype.getDetail = function() {
		return this.detail;
	};
	
	CustomEvent.prototype.initCustomEventNS = function(sNamespaceURI, sEventType, bCanBubble, bCancelable, oDetail) {
		this.detail = oDetail;
		this.initEventNS(sNamespaceURI, sEventType, bCanBubble, bCancelable);
	};
	
	
	/**
	 * 
	 * See: http://www.w3.org/TR/DOM-Level-3-Events/events.html#Events-CustomEvent
	 */
	EventTarget = function() {
	};
	this.EventTarget = EventTarget;
	
	EventTarget.prototype.addEventListener = function(sType, oListener, bUseCapture) {
		
	};
	
	EventTarget.prototype.addEventListenerNS = function(sNamespaceURI, sType, oListener, bUseCapture) {
		
	};
	
	EventTarget.prototype.dispatchEvent = function(oEvent) {
		
	};
	
	EventTarget.prototype.removeEventListener = function(sType, oListener, bUseCapture) {
		
	};
	
	EventTarget.prototype.removeEventListenerNS = function(sNamespaceURI, sType, oListener, bUseCapture) {
		
	};
	
	
	/**
	 * 
	 * See: http://www.w3.org/TR/DOM-Level-3-Events/events.html#Events-EventListener
	 */
	EventListener = function() {
	};
	this.EventListener = EventListener;
	
	EventTarget.prototype.handleEvent = function(oEvent) {
		
	};
	
	
	/**
	 * 
	 * See: http://www.w3.org/TR/DOM-Level-3-Events/events.html#Events-EventListener
	 */
	DocumentEvent = function() {
	};
	this.DocumentEvent = DocumentEvent;
	
	DocumentEvent.prototype.canDispatch = function(sNamespaceURI, sType) {
		
	};
	
	DocumentEvent.prototype.createEvent = function(sEventType) {
		
	};
	
	
	/**
	 * HTML element
	 */
	HTMLElement = function(oDocument, oImportedNode) {
	};
	this.HTMLElement = gl.extend(Element, HTMLElement);
	
	HTMLElement.prototype.getTagName = function() {
		return this.model.tagName.toUpperCase();
	};

});