gl = {};


/**
 * Boot this shit!
 */
gl.boot = function() {
};

/**
 * Base object?
 * Just an experiment...
 */
gl.Class = function() {
};

gl.Class.prototype = new Object;

/**
 * Creates a class object based on a constructor:
 * 
 * var SomeClass = function() {
 * 	Object.call(this);
 * };
 * SomeClass = gl.Class.create(SomeClass, Object);
 * SomeClass.prototype.x = function(){};
 * 
 * @param constructor A constructor function.
 * @param base A base class.
 * @return The class object. Note that this is in fact the same object
 * that was passed as the constructor.
 */
gl.Class.create = function(fConstructor, cBase) {
	// create new prototype object that inherits from cBase
	var cPrototype = new Function;
	cPrototype.prototype = (cBase || Object).prototype;
	fConstructor.prototype = new cPrototype;
	fConstructor.prototype.constructor = fConstructor;
	return fConstructor;
};

/**
 * Copies properties from a hash object onto another object.
 * @param object The object to copy the members to.
 * @param members The hash object containing the members. 
 */
gl.Class.mixin = function(oObject, hMembers) {
   for (var i in hMembers)
	   if (hMembers.hasOwnProperty(i))
		   oObject[i] = hMembers[i];
};

/**
 * Alternate version of gl.Class.create:
 * 
 * var SomeClass = gl.Class.create2(Object, {
 * 		constructor: function() {
 * 			Object.call(this);
 * 		},
 * 		member1: function() {},
 * 		member2: null
 * 	});
 * SomeClass.prototype.x = function(){};
 * 
 * Constructor is passed as a member called 'constructor'; it is optional,
 * if not present one is automatically created that calls the super class constructor.
 * 
 * @param base A base class.
 * @param members A hash object containing members for the class.
 * @param staticMembers A hash object containing static members for the class.
 * @return The class object.
 */
gl.Class.create2 = function(cBase, hMembers, hStaticMembers) {
	var fConstructor = hMembers && hMembers.constructor || function() {
			cBase.apply(this, arguments);
		};
	var cClass = gl.Class.create(fConstructor, cBase);
	if (hMembers)
		gl.Class.mixin(cClass.prototype, hMembers);
	if (hStaticMembers)
		gl.Class.mixin(cClass, hStaticMembers);
	return cClass;
};


/**
 * Alternative approach
 */
gl.Prototype = function() {
};

gl.Prototype.extend = function(cBase) {
	// create new prototype object that inherits from cBase
	var cPrototype = new Function;
	cPrototype.prototype = (cBase || Object).prototype;
	return new cPrototype;
};


/**
 * Dependency system
 */
gl.depsys = new function() {
	
	/**
	 * Returns the URL of the last script tag, which is presumed to be this script.
	 * Will probably not work for deferred scripts or certain dynamically inserted scripts...
	 * (But good enough for now.)
	 */
	function getScriptURL() {
		var aScripts = document.getElementsByTagName('script');
		var oScript = aScripts[aScripts.length - 1];
		return oScript.src || oScript._gl_src;
	}
	
	/**
	 * Makes sure the specified libraries are loaded.
	 * 
	 * Accepts an infinite number of parameters in the following format:
	 * {type: 'application/xml', src: 'jsunit.xml'}
	 * 
	 * The src field is a relative URI pointing to the file you want to load.
	 * The type field specifies an optional MIME type which will influence how the
	 * file is loaded, by default it is text/javascript.
	 * 
	 * Each script should have only one gl.require invocation, otherwise the
	 * mechanism to determine the base URL will fail.
	 * 
	 * XXX: Maybe it should also accept plain strings (and then )
	 */
	gl.require = function() {
		var sBaseURI = getScriptURL();
		for (var i = 0; i < arguments.length; i++) {
			var vDescriptor = arguments[i];
			var bIsObject = typeof vDescriptor == 'object';
			var sRelativeURL = bIsObject ? vDescriptor.src : vDescriptor;
			var sType = bIsObject && vDescriptor.type || 'text/javascript';
			var sURL = gl.uri.URI.resolve(sRelativeURL, sBaseURI);
			if (oDependencyManager.isLoaded(sURL))
				continue;
			var oDependency = oDependencyManager.createDependency(sType, sURL);
			oDependency.load();
		}
	};
	
	/**
	 * Define a module, with package name and dependencies.
	 * An object will be created from the module name, dependencies will be loaded,
	 * and the implementation initialisation function will be invoked afterwards.
	 * In the initialisation function, ‘this’ points to the module object.
	 * 
	 * Example:
	 * gl.module(
	 *     'gl.selector',
	 *     [
	 *         '../src/jsunit.js',
	 *         '../src/selector.js'
	 *     ],
	 *     function() {
	 *         var Parser = function(){};
	 *         this.Parser = gl.Class.extend(Parser, Object);  // register on gl.selector object
	 *     }
	 * );
	 */
	gl.module = function(sName, aDependencies, fImplementation) {
		var sBaseURI = getScriptURL();
		var oModule = new Module(sName, fImplementation);
		for (var i = 0; i < aDependencies.length; i++) {
			var sURL = gl.uri.URI.resolve(aDependencies[i], sBaseURI);
			var oDependency = oDependencyManager.createDependency('text/javascript', sURL);
			oModule.addDependency(oDependency);
		}
//		oModuleManager.register(oModule);
		oModule.process();
	};

	/**
	 * An object containing the information of a module.
	 * @param {String} sName 
	 * @param {Array} aDependencies
	 * @param {Function} fInitialiser
	 */
	var Module = function(sName, fInitialiser) {
		this.name = sName;
		this.initialiser = fInitialiser;
		this.dependencies = [];
		this.moduleObject = null;
	};
	
	this.Module = Module;
	
	Module.prototype.addDependency = function(oDependency) {
		this.dependencies.push(oDependency);
	};
	
	Module.prototype.process = function() {
		this.moduleObject = this.createModuleObject(this.name);	// XXX: maybe move to the constructor?
		this.loadDependencies();
	};
	
	Module.prototype.createModuleObject = function() {
		var oContext = window;
		var aNameParts = this.name.split('.');
		for (var i = 0; i < aNameParts.length; i++) {
			if (!oContext.hasOwnProperty(aNameParts[i]))
				oContext = oContext[aNameParts[i]] = {};
			else
				oContext = oContext[aNameParts[i]];
		}
		return oContext;
	};
	
	Module.prototype.loadDependencies = function() {
		for (var i = 0; i < this.dependencies.length; i++) {
			this.dependencies[i].addLoadListener(this);
			this.dependencies[i].loadAsync();
		}
	};
	
	Module.prototype.dependencyLoaded = function(oDependency) {
		if (this.allDependenciesLoaded()) {
			this.initialize();
		}
	};
	
	Module.prototype.allDependenciesLoaded = function() {
		// probably this can be implemented a little more efficiently
		for (var i = 0; i < this.dependencies.length; i++) {
			if (!this.dependencies[i].isLoaded())
				return false;
		}
		return true;
	};
	
	Module.prototype.initialize = function() {
		this.initialiser.call(this.moduleObject);
	};
	
	/**
	 * A dependency object
	 * @param {String} sURL The absolute URL of the dependency
	 */
	var Dependency = function(sURL) {
		this.url = sURL;
		this.loadListeners = [];
		this.loaded = false;
	};
	
	this.Dependency = Dependency;
	
	Dependency.prototype.getURL = function() {
		return this.url;
	};
	
	Dependency.prototype.load = function(bAsync) {
		throw new Error('Abstract method must be implemented by subclass.');
	};
	
	Dependency.prototype.loadAsync = function() {
		throw new Error('Abstract method must be implemented by subclass.');
	};
	
	Dependency.prototype.isLoaded = function() {
		return this.loaded;
	};
	
	Dependency.prototype.loadComplete = function() {
		this.loaded = true;
		this.fireLoadEvent();
	};
	
	Dependency.prototype.addLoadListener = function(fLoadListener) {
		this.loadListeners.push(fLoadListener);
	};
	
	Dependency.prototype.fireLoadEvent = function() {
		for (var i = 0; i < this.loadListeners.length; i++) {
			this.loadListeners[i].dependencyLoaded(this);
		}
	};
	
	var ScriptDependency = function(sURL) {
		Dependency.call(this, sURL);
		this.scriptNode = null;
	};

	this.ScriptDependency = gl.Class.create(ScriptDependency, Dependency);
	
	ScriptDependency.prototype.load = function() {
		this._load(false);
	};
	
	ScriptDependency.prototype.loadAsync = function() {
		this._load(true);
	};
	
	ScriptDependency.prototype._load = function(bAsync) {
		var oHead = document.getElementsByTagName('head')[0];
		var oScript = document.createElement('script');
		this.scriptNode = oScript;
		oScript.type = 'text/javascript';
		oScript._gl_dependency = this;
		oScript._gl_src = this.url;
		if (!bAsync) {
			var oXHR = new XMLHttpRequest();
			oXHR.open('GET', this.url, false);
			oXHR.setRequestHeader('Accept', 'text/javascript');
			oXHR.send();
			var sScript = oXHR.responseText;
			oScript.text = sScript;
			oHead.appendChild(oScript);
			this.loadComplete();
		} else {
			var oThis = this;
			oScript.src = this.url;
			oScript.onload = function(event) {
				oThis.loadComplete();
			};
			// TODO: onerror?
			oHead.appendChild(oScript);
		}
	};
	
	
	var TXMLDependency = function(sURL) {
		Dependency.call(this, sURL);
	};
	
	this.TXMLDependency = gl.Class.create(TXMLDependency, Dependency);
	
	TXMLDependency.prototype.load = function() {
		this._load(false);
	};
	
	TXMLDependency.prototype.loadAsync = function() {
		this._load(true);
	};
	
	TXMLDependency.prototype._load = function(bAsync) {
		var oXHR = new XMLHttpRequest();
		if (bAsync) {
			var oThis = this;
			oXHR.onreadystatechange = function() {
				oThis._loadComplete(oXHR);
			}
		}
		oXHR.open('GET', this.url, bAsync);
		oXHR.setRequestHeader('Accept', 'application/xml');
		oXHR.send();
		if (!bAsync)
			this._loadComplete(oXHR);
	};
	
	TXMLDependency.prototype._loadComplete = function(oXHR) {
		if (oXHR.responseXML.documentElement) {
			var oNamespace = gl.namespaces.build(oXHR.responseXML.documentElement);
			oNamespace.init();
			this.loadComplete();
		}
		// TODO: else error?
	};

//	var StyleDependency = function() {
//		Dependency.call(this);
//	};
	
	/**
	 * Dependency manager
	 */
	var DependencyManager = function() {
		this.dependencyMap = {};
		this.handlers = {};
	};
	
	this.DependencyManager = DependencyManager;
	
	DependencyManager.prototype.isLoaded = function(sURL) {
		if (this.getDependencyByURL(sURL))
			return true;
		var aScripts = document.getElementsByTagName('script');
		for (var i = 0; i < aScripts.length; i++) {
			if ((aScripts[i].src || aScripts[i]._gl_src) == sURL)
				return true;
		}
		return false;
	};
	
	DependencyManager.prototype.getDependencyByURL = function(sURL) {
		return this.dependencyMap.hasOwnProperty(sURL) && this.dependencyMap[sURL] || null;
	};
	
	DependencyManager.prototype.registerDependencyHandler = function(sType, cDependency) {
		this.handlers[sType] = cDependency;
	};
	
	DependencyManager.prototype.createDependency = function(sType, sURL) {
		return new this.handlers[sType](sURL);
	};

	
	/**
	 * Module manager
	 */
	var ModuleManager = function() {
	};
	
	this.ModuleManager = ModuleManager;
	
	
	// initialise dependency manager
	var oDependencyManager = new DependencyManager();
	oDependencyManager.registerDependencyHandler('text/javascript', ScriptDependency);
	oDependencyManager.registerDependencyHandler('application/xml', TXMLDependency);
	
	// load URI library to do URI resolving (a bit of a paradox :))
	var sBaseURI = getScriptURL();
	var oURIDependency = new ScriptDependency(sBaseURI.substr(0, sBaseURI.lastIndexOf('/')) + '/gl-uri.js');
	oURIDependency.load();
	
};








/* deal with inability of IE to set controller property on XML nodes */

var browser_ie = !!window.ActiveXObject;

if (browser_ie)
	gl.modelNodes = [];

function setController(oModelNode, oController) {
	if (browser_ie) {
		var id = gl.modelNodes.length;
		gl.modelNodes[id] = oController;
		oModelNode.setAttribute('_controller', id);
	} else {
		oModelNode.controller = oController;
	}
}

function getController(oModelNode) {
	if (browser_ie) {
		var id = oModelNode.getAttribute('_controller');
		return id && gl.modelNodes[id] || null;
	} else {
		return oModelNode.controller;
	}
}

function xmlEscape(sText) {
	return sText.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/&/g,'&amp;');
}

function parseHTML_IE(sHTML) {
	var oDiv = document.createElement('div');
	oDiv.innerHTML = '&#160;' + sHTML;
	return oDiv.childNodes[1];
}


gl.core = new function() {
	
	var Component = function(oDocument) {
		this.viewNode = this.getTemplate(oDocument);
	};
	this.Component = gl.Class.create(Component);

	Component.prototype.getTemplate = function(oDocument) {
		if (browser_ie)
			return parseHTML_IE(this._template.xml);
		return oDocument.importNode(this._template, true);
	};


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
	
	var Element = function(oModelNode) {
		this.modelNode = oModelNode;
		setController(oModelNode, this);
	};
	this.Element = gl.Class.create(Element);

}();

gl.namespaces = new gl.core.NamespaceList();

gl.templates = new function() {

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
			if (oNode.nodeType == 1 && (oController = getController(oNode)) instanceof cClass)
				aClasses.push(oController);
			oNode = oNode.nextSibling;
		}
		return aClasses;
	}

	var Namespace = function(oModelNode) {
		gl.core.Element.call(this, oModelNode);
	};
	this.Namespace = gl.Class.create(Namespace, gl.core.Element);
	
	Namespace.prototype.getURI = function() {
		return this.modelNode.getAttribute('name') || null;
	};
	
	Namespace.prototype.getObject = function() {
		return getReference(this.modelNode.getAttribute('object') || '', true);
	};
	
	Namespace.prototype.getClasses = function() {
		return getChildInstancesOf(this.modelNode, Class);
	};
	
	Namespace.prototype.init = function() {
		var aClasses = this.getClasses();
		for (var i = 0; i < aClasses.length; i++) {
			aClasses[i].init(this);
		}
	};
	
	var Class = function(oModelNode, oParent) {
		gl.core.Element.call(this, oModelNode);
		this._namespace = oParent;
	};
	this.Class = gl.Class.create(Class, gl.core.Element);
	
	Class.prototype.getName = function() {
		return this.modelNode.getAttribute('name') || null;
	};
	
	Class.prototype.getExtends = function() {
		return getReference(this.modelNode.getAttribute('extends') || 'gl.core.Component');
	};
	
	Class.prototype.getConstructor = function() {
		var oConstructor = getChildInstancesOf(this.modelNode, Constructor)[0];
		return oConstructor ? oConstructor.getConstructor() : new Function;
	};
	
	Class.prototype.getTemplate = function() {
		var oTemplate = getChildInstancesOf(this.modelNode, Template)[0];
		return oTemplate ? oTemplate.getTemplate() : null;
	};
	
	Class.prototype.getMethods = function() {
		return getChildInstancesOf(this.modelNode, Method);
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
	
	var Template = function(oModelNode, oParent) {
		gl.core.Element.call(this, oModelNode);
		this._class = oParent;
	};
	this.Template = gl.Class.create(Template, gl.core.Element);
	
	Template.prototype.getTemplate = function() {
		var oNode = this.modelNode.firstChild;
		while (oNode) {
			if (oNode.nodeType == 1)
				return oNode;
			oNode = oNode.nextSibling;
		}
		return null;
	};
	
	var Constructor = function(oModelNode, oParent) {
		gl.core.Element.call(this, oModelNode);
		this._class = oParent;
	};
	this.Constructor = gl.Class.create(Constructor, gl.core.Element);
	
	Constructor.prototype.getConstructor = function() {
		var sArguments = this.modelNode.getAttribute('arguments');
		var sBody = this.modelNode.textContent || this.modelNode.text || '';
		if (sArguments)
			return new Function(sArguments, sBody);
		else
			return new Function(sBody);
	};
	
	var Method = function(oModelNode, oParent) {
		gl.core.Element.call(this, oModelNode);
		this._class = oParent;
	};
	this.Method = gl.Class.create(Method, gl.core.Element);
	
	Method.prototype.getMethod = Constructor.prototype.getConstructor;
	
	Method.prototype.getName = function() {
		return this.modelNode.getAttribute('name') || null;
	};
	
	var Resource = function(oModelNode, oParent) {
		gl.core.Element.call(this, oModelNode);
		
		switch (this.getType()) {
		case 'text/css':
			if (browser_ie) {
				var oStyle = parseHTML_IE('<style type="text/css">' + xmlEscape(oModelNode.text) + '</style>');
			} else {
				var oStyle = document.createElement('style');
				oStyle.type = 'text/css';
				oStyle.appendChild(document.createTextNode(oModelNode.textContent));
			}
			document.getElementsByTagName('head')[0].appendChild(oStyle);
			break;
		case 'text/javascript':
			var oScript = document.createElement('script');
			oScript.type = 'text/javascript';
			oScript.appendChild(document.createTextNode(oModelNode.textContent));
			document.getElementsByTagName('head')[0].appendChild(oScript);
			break;
		}
	};
	this.Resource = gl.Class.create(Resource, gl.core.Element);
	
	Resource.prototype.getType = function() {
		return this.modelNode.getAttribute('type') || null;
	};
	
	var oTNamespace = new gl.core.Namespace('http://www.grauw.nl/templates');
	oTNamespace.add(Namespace,   'namespace');
	oTNamespace.add(Class,       'class');
	oTNamespace.add(Template,    'template');
	oTNamespace.add(Constructor, 'constructor');
	oTNamespace.add(Method,      'method');
	oTNamespace.add(Resource,    'resource');
	gl.namespaces.add(oTNamespace);
	
}();


function loadTFile(sSrc) {
	var xhr = new XMLHttpRequest();
	
	xhr.open('GET', sSrc, false);
	
	xhr.send();
	
	if (xhr.responseXML.documentElement) {
		var oNS = gl.namespaces.build(xhr.responseXML.documentElement);
		oNS.init();
	}
}



