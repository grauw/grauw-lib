/**
 * @fileoverview
 * 
 * Functions to support a Component / Container model.
 */
gl.module('gl.core', [], function() {
	
	var browser_ie = !!window.ActiveXObject;
	
	function parseHTML_IE(sHTML) {
		var oDiv = document.createElement('div');
		oDiv.innerHTML = '&#160;' + sHTML;
		return oDiv.childNodes[1];
	}
	
	
	
	
	/**
	 * A utility registry to help map model nodes to controllers.
	 * Primarily to deal IE’s inability to set property on XML nodes.
	 */
	var ModelRegistry = function() {
		this.registry = [];	// only used in IE
	};
	this.ModelRegistry = ModelRegistry;
	
	ModelRegistry.prototype.setController = function(oModel, oController) {
		if (browser_ie) {
			var id = this.registry.length;
			this.registry[id] = oController;
			oModel.setAttribute('_controller', id);
		} else {
			oModel.controller = oController;
		}
	}

	ModelRegistry.prototype.getController = function(oModel) {
		if (browser_ie) {
			var id = oModel.getAttribute('_controller');
			return id && this.registry[id] || null;
		} else {
			return oModel.controller;
		}
	}
	
	
	
	
	/**
	 * A visual component with an HTML view.
	 */
	var Component = function(oDocument) {
		this.view = this.getTemplate(oDocument);
	};
	this.Component = Component;

	Component.prototype.getTemplate = function(oDocument) {
		if (browser_ie)
			return parseHTML_IE(this._template.xml);
		return oDocument.importNode(this._template, true);
	};
	
	
	
	
	/**
	 * A registry of namespaces.
	 */
	var NamespaceList = function() {
		this.namespaces = {};
	};
	this.NamespaceList = NamespaceList;

	NamespaceList.prototype.add = function(oNamespace) {
//		if (!(oElement instanceof Namespace))
//			throw new Error('Illegal argument - oElement must be of type gl.core.Element');
		this.namespaces[oNamespace.uri] = oNamespace;
	};
	
	NamespaceList.prototype.build = function(oNode) {
		var cElement = this.getElementByNode(oNode);
		var oElement = cElement ? new cElement(oNode) : null;
		
		// recur
		var oNode = oNode.firstChild;
		while (oNode) {
			if (oNode.nodeType == 1)
				this.build(oNode);
			oNode = oNode.nextSibling;
		}
		return oElement;
	};
	
	NamespaceList.prototype.getNamespace = function(sNamespaceURI) {
		return this.namespaces[sNamespaceURI];
	};
	
	NamespaceList.prototype.getElementByNode = function(oNode) {
		var oNamespace = this.namespaces[oNode.namespaceURI];
		return oNamespace && oNamespace.getElement(oNode.localName || oNode.baseName) || null;
	};
	
	
	
	
	/**
	 * A namespace.
	 */
	var Namespace = function(sURI) {
		this.uri = sURI;
		this.elements = {};
	};
	this.Namespace = Namespace;

	Namespace.prototype.add = function(oElement, sLocalName) {
//		if (!(oElement instanceof Element))
//			throw new Error('Illegal argument - oElement must be of type gl.core.Element');
		this.elements[sLocalName] = oElement;
	};
	
	Namespace.prototype.getElement = function(sLocalName) {
		return this.elements[sLocalName];
	};
	
	
	
	
	/**
	 * An element.
	 */
	var Element = function(oModel) {
		this.model = oModel;
		gl.core.modelRegistry.setController(oModel, this);
	};
	this.Element = Element;
	
	
	
	
	// instantiate NamespaceList
	gl.namespaces = new gl.core.NamespaceList();
	this.modelRegistry = new ModelRegistry();
	
});
