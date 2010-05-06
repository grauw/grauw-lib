/**
 * @fileOverview
 * 
 * Functions to support a MVC architecture.
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
gl.module('gl.core', [], function() {
	
	var browser_ie = !!window.ActiveXObject;
	
	
	
	
	/**
	 * A utility registry to help map model nodes to controllers.
	 * Primarily to deal IE’s inability to set property on XML nodes.
	 */
	var ModelRegistry = function() {
		this.registry = [];	// only used in IE
	};
	
	ModelRegistry.prototype.setController = function(oModel, oController) {
		if (browser_ie) {
			var id = this.registry.length;
			this.registry[id] = oController;
			oModel.setAttribute('_controller', id);
		} else {
			oModel.controller = oController;
		}
	};

	ModelRegistry.prototype.getController = function(oModel) {
		if (browser_ie) {
			var id = oModel.getAttribute('_controller');
			return id && this.registry[id] || null;
		} else {
			return oModel.controller;
		}
	};
	
	
	
	
	/**
	 * A visual component with an HTML view.
	 * Abstract class, subclasses must implement createHTML().
	 */
	var View = function() {
		this.html = null;
	};

	View.prototype.createHTML = function(oDocument) {
		throw new Error('Must implement createHTML().');
	};
	
	View.prototype.getHTML = function(oDocument) {
		if (!this.html)
			this.html = this.createHTML(oDocument);
		return this.html;
	};
	
	View.prototype.update = function() {
		var oHTML = this.html;
		this.html = null;
		if (oHTML && oHTML.parentNode)
			oHTML.parentNode.replaceChild(this.getHTML(oHTML.ownerDocument), oHTML);
	};
	
	
	
	
	/**
	 * A registry of namespaces.
	 */
	var NamespaceList = function() {
		this.namespaces = {};
	};

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
		oModelRegistry.setController(oModel, this);
	};
	
	
	
	
	var oModelRegistry = new ModelRegistry();
	var oNamespaceList = new NamespaceList();
	
	
	
	
	// exports
	this.ModelRegistry = ModelRegistry;
	this.View = View;
	this.NamespaceList = NamespaceList;
	this.Namespace = Namespace;
	this.Element = Element;
	this.modelRegistry = oModelRegistry;
	gl.namespaces = oNamespaceList;
	
});
