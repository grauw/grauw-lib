/**
 * @fileoverview
 * 
 * Functions to support a Component / Container model,
 * and XML templates definitions.
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
		this.registry = {};	// only used in IE
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
	this.Component = gl.Class.create(Component);

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
	this.NamespaceList = gl.Class.create(NamespaceList);

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
	this.Namespace = gl.Class.create(Namespace);

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
	this.Element = gl.Class.create(Element);
	
	
	
	
	// instantiate NamespaceList
	gl.namespaces = new gl.core.NamespaceList();
	this.modelRegistry = new ModelRegistry();
	
});

gl.module('gl.templates', [], function() {
	
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
			if (oNode.nodeType == 1 && (oController = gl.core.modelRegistry.getController(oNode)) instanceof cClass)
				aClasses.push(oController);
			oNode = oNode.nextSibling;
		}
		return aClasses;
	}
	
	
	
	
	/**
	 * 
	 */
	var Namespace = function(oModel) {
		gl.core.Element.call(this, oModel);
	};
	this.Namespace = gl.Class.create(Namespace, gl.core.Element);
	
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
		gl.core.Element.call(this, oModel);
		this._namespace = oParent;
	};
	this.Class = gl.Class.create(Class, gl.core.Element);
	
	Class.prototype.getName = function() {
		return this.model.getAttribute('name') || null;
	};
	
	Class.prototype.getExtends = function() {
		return getReference(this.model.getAttribute('extends') || 'gl.core.Component');
	};
	
	Class.prototype.getConstructor = function() {
		var oConstructor = getChildInstancesOf(this.model, Constructor)[0];
		return oConstructor ? oConstructor.getConstructor() : new Function;
	};
	
	Class.prototype.getTemplate = function() {
		var oTemplate = getChildInstancesOf(this.model, Template)[0];
		return oTemplate ? oTemplate.getTemplate() : null;
	};
	
	Class.prototype.getMethods = function() {
		return getChildInstancesOf(this.model, Method);
	};
	
	Class.prototype.init = function(oNamespace) {
		var fConstructor = this.getConstructor();
		gl.Class.create(fConstructor, this.getExtends());
		fConstructor.prototype._template = this.getTemplate();
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
		gl.core.Element.call(this, oModel);
		this._class = oParent;
	};
	this.Template = gl.Class.create(Template, gl.core.Element);
	
	Template.prototype.getTemplate = function() {
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
		gl.core.Element.call(this, oModel);
		this._class = oParent;
	};
	this.Constructor = gl.Class.create(Constructor, gl.core.Element);
	
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
		gl.core.Element.call(this, oModel);
		this._class = oParent;
	};
	this.Method = gl.Class.create(Method, gl.core.Element);
	
	Method.prototype.getMethod = Constructor.prototype.getConstructor;
	
	Method.prototype.getName = function() {
		return this.model.getAttribute('name') || null;
	};
	
	
	
	
	/**
	 * 
	 */
	var Resource = function(oModel, oParent) {
		gl.core.Element.call(this, oModel);
		
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
	this.Resource = gl.Class.create(Resource, gl.core.Element);
	
	Resource.prototype.getType = function() {
		return this.model.getAttribute('type') || null;
	};
	
	
	
	
	/**
	 * Dependency implementation for the XML templates type.
	 * Uses MIME-type ‘application/xml’.
	 */
	var TemplatesDependency = function(sURI) {
		gl.depsys.Dependency.call(this, sURI);
		this.xml = null;
	};
	
	this.TemplatesDependency = gl.Class.create(TemplatesDependency, gl.depsys.Dependency);
	
	TemplatesDependency.prototype.load = function() {
		this._load(false);
	};
	
	TemplatesDependency.prototype.loadAsync = function() {
		this._load(true);
	};
	
	TemplatesDependency.prototype._load = function(bAsync) {
		var oXHR = new XMLHttpRequest();
		if (bAsync) {
			var oThis = this;
			oXHR.onreadystatechange = function() {
				if (oXHR.readyState == 4)
					oThis._loadComplete(oXHR);
			}
		}
		oXHR.open('GET', this.uri, bAsync);
		oXHR.setRequestHeader('Accept', 'application/xml');
		oXHR.send();
		if (!bAsync)
			this._loadComplete(oXHR);
	};
	
	TemplatesDependency.prototype._loadComplete = function(oXHR) {
		if (oXHR.responseXML.documentElement) {
			this.xml = oXHR.responseXML;
			var oNamespace = gl.namespaces.build(this.xml.documentElement);
			oNamespace.init();
			this.loadComplete();
		}
		// TODO: else error?
	};
	
	
	
	
	// instantiate templates namespace
	var oTNamespace = new gl.core.Namespace('http://www.grauw.nl/templates');
	this.namespace = oTNamespace;
	
	// add element types
	oTNamespace.add(Namespace,   'namespace');
	oTNamespace.add(Class,       'class');
	oTNamespace.add(Template,    'template');
	oTNamespace.add(Constructor, 'constructor');
	oTNamespace.add(Method,      'method');
	oTNamespace.add(Resource,    'resource');
	
	// register templates namespace
	gl.namespaces.add(oTNamespace);
	
	// register the XML templates dependency type
	gl.depsys.dependencyManager.registerDependencyHandler('application/xml', TemplatesDependency);
	
});