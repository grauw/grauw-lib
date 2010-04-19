/**
 * @fileOverview
 * 
 * Functions to support XML templates definitions.
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
gl.module('gl.templates',
	['mvc.js', 'selector.js'],
	function() {
	
	// imports
	var Element = gl.core.Element;
	var CoreComponent = gl.core.Component;
	var Dependency = gl.depsys.Dependency;
	var oModelRegistry = gl.core.modelRegistry;
	
	// for IE6
	var XMLHttpRequest = window.XMLHttpRequest || function() { return new ActiveXObject("MSXML2.XMLHTTP.3.0"); };
	
	
	
	// utility
	var browser_ie = !!window.ActiveXObject;

	function xmlEscape(sText) {
		return sText.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/&/g,'&amp;');
	}

	function parseHTML_IE(sHTML) {
		var oDiv = document.createElement('div');
		oDiv.innerHTML = '&#160;' + sHTML;
		return oDiv.childNodes[1];
	}
	
	function getReference(sJSPath, bCreate) {
		var aJSPath = sJSPath.split('.');
		var oObject = window;
		for (var i = 0; i < aJSPath.length; i++) {
			if (!(aJSPath[i] in oObject))
				if (bCreate)
					oObject[aJSPath[i]] = {};
				else
					throw new Error('Object does not exist: ' + sJSPath);
			oObject = oObject[aJSPath[i]];
		}
		return oObject;
	}
	
	function getChildInstancesOf(oNode, cClass) {
		var oNode = oNode.firstChild;
		var aClasses = [];
		var oController;
		while (oNode) {
			if (oNode.nodeType == 1 && (oController = oModelRegistry.getController(oNode)) instanceof cClass)
				aClasses.push(oController);
			oNode = oNode.nextSibling;
		}
		return aClasses;
	}
	
	
	
	
	/**
	 * A subclass of gl.core.Component containing template-specific code.
	 */
	var Component = function() {
		CoreComponent.call(this);
	};
	gl.extend(CoreComponent, Component);
	
	Component.prototype._template = null;
	Component.prototype._handlers = null;
	
	Component.prototype.createView = function(oDocument) {
		var oView = this.instantiateTemplate(oDocument);
		this.attachHandlers(oView);
		return oView;
	};
	
	Component.prototype.instantiateTemplate = function(oDocument) {
		if (browser_ie)
			return parseHTML_IE(this._template.xml);
		else
			return oDocument.importNode(this._template, true);
	};
	
	Component.prototype.attachHandlers = function(oView) {
		function createHandler(oContext, fHandler, sMatch) {
			return function(oEvent) {
				oEvent = oEvent || event;
				var oTarget = oEvent.target || oEvent.srcElement;
				if (!sMatch || gl.selector.match(oTarget, sMatch))
					fHandler.call(oContext, oEvent);
			};
		};
		
		for (var i = 0; i < this._handlers.length; i++) {
			var sEventType = this._handlers[i].getEvent();
			var fHandler = this._handlers[i].getHandler();
			var sMatch = this._handlers[i].getMatch();
			oView.addEventListener(sEventType, createHandler(this, fHandler, sMatch), false);
		}
	};
	
	
	
	
	/**
	 * 
	 */
	var Namespace = function(oModel) {
		Element.call(this, oModel);
	};
	gl.extend(Element, Namespace);
	
	Namespace.prototype.getURI = function() {
		return this.model.getAttribute('name') || null;
	};
	
	Namespace.prototype.getObject = function() {
		return getReference(this.model.getAttribute('object') || '', true);
	};
	
	Namespace.prototype.getClasses = function() {
		return getChildInstancesOf(this.model, Class);
	};
	
	Namespace.prototype.init = function() {
		var aClasses = this.getClasses();
		for (var i = 0; i < aClasses.length; i++) {
			aClasses[i].init(this);
		}
	};
	
	
	
	
	/**
	 * 
	 */
	var Class = function(oModel, oParent) {
		Element.call(this, oModel);
		this._namespace = oParent;
	};
	gl.extend(Element, Class);
	
	Class.prototype.getName = function() {
		return this.model.getAttribute('name') || null;
	};
	
	Class.prototype.getExtends = function() {
		return getReference(this.model.getAttribute('extends') || 'gl.templates.Component');
	};
	
	Class.prototype.getConstructor = function() {
		var oConstructor = getChildInstancesOf(this.model, Constructor)[0];
		return oConstructor ? oConstructor.getConstructor() : new Function;
	};
	
	Class.prototype.createView = function() {
		var oTemplate = getChildInstancesOf(this.model, Template)[0];
		return oTemplate ? oTemplate.createView() : null;
	};
	
	Class.prototype.getMethods = function() {
		return getChildInstancesOf(this.model, Method);
	};
	
	Class.prototype.getHandlers = function() {
		return getChildInstancesOf(this.model, Handler);
	};
	
	Class.prototype.init = function(oNamespace) {
		var fConstructor = this.getConstructor();
		gl.extend(this.getExtends(), fConstructor);
		fConstructor.prototype._template = this.createView();
		fConstructor.prototype._handlers = this.getHandlers();
		var aMethods = this.getMethods();
		for (var i = 0; i < aMethods.length; i++) {
			fConstructor.prototype[aMethods[i].getName()] = aMethods[i].getMethod();
		}
		return oNamespace.getObject()[this.getName()] = fConstructor;
	};
	
	
	
	
	/**
	 * 
	 */
	var Template = function(oModel, oParent) {
		Element.call(this, oModel);
		this._class = oParent;
	};
	gl.extend(Element, Template);
	
	Template.prototype.createView = function() {
		var oNode = this.model.firstChild;
		while (oNode) {
			if (oNode.nodeType == 1)
				return oNode;
			oNode = oNode.nextSibling;
		}
		return null;
	};
	
	
	
	
	/**
	 * 
	 */
	var Constructor = function(oModel, oParent) {
		Element.call(this, oModel);
		this._class = oParent;
	};
	gl.extend(Element, Constructor);
	
	Constructor.prototype.getConstructor = function() {
		var sArguments = this.model.getAttribute('arguments');
		var sBody = this.model.textContent || this.model.text || '';
		if (sArguments)
			return new Function(sArguments, sBody);
		else
			return new Function(sBody);
	};
	
	
	
	
	/**
	 * 
	 */
	var Method = function(oModel, oParent) {
		Element.call(this, oModel);
		this._class = oParent;
	};
	gl.extend(Element, Method);
	
	Method.prototype.getMethod = Constructor.prototype.getConstructor;
	
	Method.prototype.getName = function() {
		return this.model.getAttribute('name') || null;
	};
	
	
	
	
	/**
	 * 
	 */
	var Handler = function(oModel, oParent) {
		Element.call(this, oModel);
		this._class = oParent;
	};
	gl.extend(Element, Handler);
	
	Handler.prototype.getHandler = function() {
		var sBody = this.model.textContent || this.model.text || '';
		return new Function('event', sBody);
	};
	
	Handler.prototype.getEvent = function() {
		return this.model.getAttribute('event') || null;
	};
	
	Handler.prototype.getMatch = function() {
		return this.model.getAttribute('match') || null;
	};
	
	
	
	
	/**
	 * 
	 */
	var Resource = function(oModel, oParent) {
		Element.call(this, oModel);
		
		switch (this.getType()) {
		case 'text/css':
			if (browser_ie) {
				var oStyle = parseHTML_IE('<style type="text/css">' + xmlEscape(oModel.text) + '</style>');
			} else {
				var oStyle = document.createElement('style');
				oStyle.type = 'text/css';
				oStyle.appendChild(document.createTextNode(oModel.textContent));
			}
			document.getElementsByTagName('head')[0].appendChild(oStyle);
			break;
		case 'text/javascript':
			var oScript = document.createElement('script');
			oScript.type = 'text/javascript';
			oScript.appendChild(document.createTextNode(oModel.textContent));
			document.getElementsByTagName('head')[0].appendChild(oScript);
			break;
		}
	};
	gl.extend(Element, Resource);
	
	Resource.prototype.getType = function() {
		return this.model.getAttribute('type') || null;
	};
	
	
	
	
	/**
	 * Dependency implementation for the XML templates type.
	 * Uses MIME-type ‘application/xml’.
	 */
	var TemplatesDependency = function(sURI) {
		Dependency.call(this, sURI);
		this.xml = null;
	};
	gl.extend(Dependency, TemplatesDependency);
	
	TemplatesDependency.prototype.doLoad = function() {
		var oXHR = new XMLHttpRequest();
		var oThis = this;
		oXHR.onreadystatechange = function() {
			if (oXHR.readyState == 4) {
				oXHR.onreadystatechange = new Function; // avoid memory leak
				oThis.handleXHRComplete(oXHR);
			}
		};
		oXHR.open('GET', this.getURI());
		oXHR.setRequestHeader('Accept', 'application/xml');
		oXHR.send();
	};
	
	TemplatesDependency.prototype.handleXHRComplete = function(oXHR) {
		if (oXHR.responseXML.documentElement) {
			this.xml = oXHR.responseXML;
			var oNamespace = gl.namespaces.build(this.xml.documentElement);
			oNamespace.init();
			this.loadComplete();
		}
		// TODO: else error?
	};

	TemplatesDependency.prototype.loadComplete = function() {
		Dependency.prototype.loadComplete.call(this);	// call super
		this.ready();
	};
	
	TemplatesDependency.prototype.toString = function() {
		return 'TemplatesDependency';
	};
	
	
	
	
	// instantiate templates namespace
	var oTNamespace = new gl.core.Namespace('http://www.grauw.nl/templates');
	
	// add element types
	oTNamespace.add(Namespace,   'namespace');
	oTNamespace.add(Class,       'class');
	oTNamespace.add(Template,    'template');
	oTNamespace.add(Constructor, 'constructor');
	oTNamespace.add(Method,      'method');
	oTNamespace.add(Handler,     'handler');
	oTNamespace.add(Resource,    'resource');
	
	// register templates namespace
	gl.namespaces.add(oTNamespace);
	
	// register the XML templates dependency type
	gl.depsys.dependencyManager.registerDependencyHandler('application/xml', TemplatesDependency);
	
	
	
	
	// exports
	this.Component = Component;
	this.Namespace = Namespace;
	this.Class = Class;
	this.Template = Template;
	this.Constructor = Constructor;
	this.Method = Method;
	this.Handler = Handler;
	this.Resource = Resource; 
	this.TemplatesDependency = TemplatesDependency;
	this.namespace = oTNamespace;
	
});
