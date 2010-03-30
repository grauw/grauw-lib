gl = new function() {
	
	/**
	 * Copies properties from a hash object onto another object.
	 * @param object The object to copy the members to.
	 * @param members The hash object containing the members.
	 */
	function mixin(oObject, hMembers) {
	   for (var i in hMembers)
		   if (hMembers.hasOwnProperty(i))
			   oObject[i] = hMembers[i];
	}
	
	
	
	
	/**
	 * Extends a class.
	 * 
	 * You can extend from Object, but this is what functions already do
	 * by default, so then calling extend is not necessary.
	 * Passing a constructor is optional, if you do not pass a constructor,
	 * a new constructor that just calls the base constructor is created.
	 * 
	 * Example:
	 * 
	 * var MyClass = function() {
	 *     MyBaseClass.call(this); // call super
	 * };
	 * gl.extend(MyBaseClass, MyClass);
	 * MyClass.prototype.myMethod = function(){};
	 * 
	 * @param {Function} base The base class.
	 * @param {Function} constructor A constructor function (optional).
	 * @return The class constructor.
	 * @type Function
	 */
	function extend(cBase, fConstructor) {
		fConstructor = fConstructor || function() { cBase.apply(this, arguments); };
		var cPrototype = new Function();
		cPrototype.prototype = cBase.prototype;
		fConstructor.prototype = new cPrototype();
		fConstructor.prototype.constructor = fConstructor;
		return fConstructor;
	}
	
	
	
	
	/**
	 * Base class.
	 * Use extend() method to create subclasses.
	 * This provides an alternate approach to creating classes, compared to gl.extend(). 
	 */
	var Class = function() {
	};
	
	/**
	 * Creates a subclass.
	 * 
	 * Not 100% ‘pure’ as it does manual static member inheritance.
	 * Ideally one would extend Function instead, but this is not possible.
	 * 
	 * Example:
	 * 
	 * var MyClass = gl.Class.extend(function() {
	 *     MyBaseClass.call(this); // call super
	 * });
	 * MyClass.prototype.myMethod = function(){};
	 * 
	 * @param {Function} constructor A constructor function (optional).
	 * @return The class constructor.
	 * @type Class
	 */
	Class.extend = function(fConstructor) {
		fConstructor = fConstructor || (this == Class ? function() {} : null);
		extend(this, fConstructor);
		mixin(fConstructor, this);	// inherit static members
		return fConstructor;
	};
	
	
	
	
	var DOMReadyUtil = function() {
		this.domReady = false;
		this.listeners = [];
		
		var oThis = this;
		function loadHandler() {
			if (window.removeEventListener)
				window.removeEventListener('load', loadHandler, false);
			else
				window.detachEvent('onload', loadHandler);
			oThis.domReady = true;
			oThis.fireDOMReady();
		}
		if (window.addEventListener)
			window.addEventListener('load', loadHandler, false);
		else
			window.attachEvent('onload', loadHandler);
	};
	
	this.DOMReadyUtil = DOMReadyUtil;
	
	DOMReadyUtil.prototype.fireDOMReady = function() {
		for (var i = 0; i < this.listeners.length; i++)
			this.listeners[i].handleDOMReady();
	};
	
	DOMReadyUtil.prototype.addDOMReadyListener = function(oListener) {
		if (!this.domReady)
			this.listeners.push(oListener);
		else
			oListener.handleDOMReady();
	};
	
	
	
	
	/**
	 * Calls the function once the document is ready and all dependencies have been loaded.
	 */
	function domReady(fCallback) {
		oDOMReadyUtil.addDOMReadyListener({handleDOMReady: fCallback});
	}
	
	
	
	// instantiate DOM ready util
	var oDOMReadyUtil = new DOMReadyUtil();
	
	
	
	
	// exports
	this.mixin = mixin;
	this.extend = extend;
	this.Class = Class;
	this.DOMReadyUtil = DOMReadyUtil;
	this.domReady = domReady;
	this.domReadyUtil = oDOMReadyUtil;
	
};


/**
 * Dependency system
 */
gl.depsys = new function() {

	var browser_ie = !!window.ActiveXObject;
	var browser_ie_version_match = /MSIE (\d+(?:\.\d*)?)/.exec(navigator.appVersion);
	var browser_ie_version = parseFloat(browser_ie_version_match && browser_ie_version_match[1] || '0');
	
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
	 * 
	 * The dependency URIs are accepted as plain strings and in the following format:
	 * {type: 'application/xml', src: 'jsunit.xml'}
	 * 
	 * The src field is a relative URI pointing to the file you want to load.
	 * The type field specifies an optional MIME type which will influence how the
	 * file is loaded, by default it is text/javascript.
	 */
	gl.module = function(sName, aDependencies, fInitializer) {
		oDependencyManager.dependencyIseEverything();
		var oCurrentDependency = oDependencyManager.getCurrentDependency(sName);
		var oModule = oDependencyManager.createModule(sName, fInitializer);
		for (var i = 0; i < aDependencies.length; i++) {
			var oDependency = oDependencyManager.createDependencyFromParameter(aDependencies[i]);
			oModule.addDependency(oDependency);
		}
		if (oCurrentDependency) {
			oModule.setParentDependency(oCurrentDependency);
		} else {
			oDependencyManager.registerUnboundModule(oModule);
		}
	};
	
	
	
	
	/**
	 * An object containing the information of a module.
	 * @param {String} sName 
	 * @param {Function} fInitializer
	 */
	var Module = function(sName, fInitializer) {
		this.name = sName;
		this.initializer = fInitializer;
		this.dependencies = [];
		this.parentDependency = null;
		this.object = this.getModuleObject();
	};
	
	Module.prototype.getURI = function() {
		if (!this.parentDependency)
			throw new Error('Module getURI() can not be used before parent dependency is set.');
		return this.parentDependency.getURI();
	};
	
	/**
	 * Sets the dependency containing this module. Needed for base URI resolving.
	 * Setting this initiates the loading of dependencies, so be sure to add all dependencies before.
	 * @param oDependency The parent dependency.
	 */
	Module.prototype.setParentDependency = function(oDependency) {
		this.parentDependency = oDependency;
		oDependency.registerModule(this);
		this.loadDependencies();
	};
	
	Module.prototype.addDependency = function(oDependency) {
		this.dependencies.push(oDependency);
		oDependency.setParentModule(this);
	};
	
	/**
	 * Returns the object for this module.
	 * If the object does not already exist, creates it.
	 * @return The module object.
	 */
	Module.prototype.getModuleObject = function() {
		var oContext = window;
		var aNameParts = this.name.split('.');
		if (aNameParts.length == 1 && aNameParts[0] == '')
			return oContext;
		for (var i = 0; i < aNameParts.length; i++) {
			if (!(aNameParts[i] in oContext))
				oContext = oContext[aNameParts[i]] = {};
			else
				oContext = oContext[aNameParts[i]];
		}
		return oContext;
	};
	
	Module.prototype.loadDependencies = function() {
		if (!this.dependencies.length) {
			this.ready();
		} else {
			for (var i = 0; i < this.dependencies.length; i++) {
				this.dependencies[i].load();
			}
		}
	};
	
	/**
	 * Callback called when a child dependency has completed loading
	 */
	Module.prototype.dependencyLoaded = function(oDependency) {
		if (this.allDependenciesLoaded()) {
			this.ready();
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
	
	Module.prototype.ready = function() {
		this.initializer.call(this.object, this);
		this.parentDependency.moduleReady(this);
	};
	
	
	
	
	/**
	 * A dependency object
	 * @param {String} sURI The absolute URI of the dependency
	 */
	var Dependency = function(sURI) {
		this.uri = sURI;
		this.loaded = false;
		this.modules = [];
		this.parentModule = null;
	};
	
	/**
	 * Returns the absolute URI of this dependency.
	 * May throw an error if no parentModule is set and getURI() is not overridden.
	 */
	Dependency.prototype.getURI = function() {
		if (!this.parentModule)
			throw new Error('Need to set parent module first before getting URI.');
		return gl.uri.URI.resolve(this.uri, this.parentModule.getURI());
	};
	
	/**
	 * Registers a module to be a child of this dependency.
	 * Registered modules are taken into account by isLoaded().
	 * @param oModule The module in this dependency.
	 * @return
	 */
	Dependency.prototype.registerModule = function(oModule) {
		this.modules.push(oModule);
	};
	
	Dependency.prototype.setParentModule = function(oModule) {
		this.parentModule = oModule;
	};
	
	/**
	 * Start loading the dependency.
	 * If the URI library has not been loaded yet, postpones the loading.
	 * @return
	 */
	Dependency.prototype.load = function() {
		// TODO: don’t load existing dependencies twice
//		if (oDependencyManager.isLoaded(this.uri)) {
//			Dependency.prototype.loadComplete.call(this);	// FIXME
//			return;
//		}
		
		if (!oURIDependency.isLoaded()) {
			// wait for URI library to load if it hasn’t loaded yet
			oURIDependency.addLoadListener({dependencyLoaded: function(){this.dependency.load();}, dependency: this});
		} else {
			oDependencyManager.registerDependency(this);
			this.doLoad();
		}
	};
	
	/**
	 * Do the actual loading.
	 * This should be overridden by subclasses.
	 * @return
	 */
	Dependency.prototype.doLoad = function() {
		throw new Error('Abstract method doLoad() must be implemented by subclass.');
	};
	
	Dependency.prototype.isLoaded = function() {
		var bLoaded = this.loaded;
		for (var i = 0; i < this.modules.length && bLoaded; i++) {
			bLoaded = this.modules[i].allDependenciesLoaded() && bLoaded;
		}
		return bLoaded;
	};

	/**
	 * Callback from a child module
	 */
	Dependency.prototype.moduleReady = function(oModule) {
		if (this.isLoaded() && this.parentModule)
			this.parentModule.dependencyLoaded(this);
	};

	/**
	 * Callback when load is complete
	 * @return
	 */
	Dependency.prototype.loadComplete = function() {
		this.loaded = true;
	};
	
	Dependency.prototype.toString = function() {
		return 'Dependency';
	};
	
	
	
	
	/**
	 * Dependency implementation for the script type.
	 * Uses MIME-type ‘application/javascript’.
	 */
	var ScriptDependency = function(sURI) {
		Dependency.call(this, sURI);
		this.scriptNode = null;
	};
	
	gl.extend(Dependency, ScriptDependency);
	
	ScriptDependency.prototype.setScriptNode = function(oScript) {
		this.scriptNode = oScript;
		oScript._gl_dependency = this;
	};
	
	/**
	 * Returns whether this dependency is currently being executed.
	 * Can only be determined in IE.
	 */
	ScriptDependency.prototype.isCurrentScript = function() {
		return browser_ie && this.scriptNode && this.scriptNode.readyState == 'interactive';
	};
	
	ScriptDependency.prototype.doLoad = function() {
		var oHead = document.getElementsByTagName('head')[0];
		var oScript = document.createElement('script');
		this.setScriptNode(oScript);
		this.attachLoadHandler(oScript);
		oScript.type = 'text/javascript';
		oScript.defer = true;
		oScript.src = this.getURI();
		oHead.appendChild(oScript);	// execute script
	};
	
	/**
	 * Attachs the load event handler to the script.
	 * @return
	 */
	ScriptDependency.prototype.attachLoadHandler = function(oScript) {
		var oThis = this;
		if (!browser_ie) {	// IE9 preview 1.9.7745.6019 still doesn’t dispatch load event
			oScript.addEventListener('load', function() {
				oThis.loadComplete();
			}, false);
		} else {
			oScript.attachEvent('onreadystatechange', function handleReadyStateChange() {
				if (oScript.readyState == 'complete' || oScript.readyState == 'loaded') {
					oScript.detachEvent('onreadystatechange', handleReadyStateChange); // avoid memory leak in IE
					oThis.loadComplete();
				}
			});
		}
	};
	
	ScriptDependency.prototype.loadComplete = function() {
		Dependency.prototype.loadComplete.call(this);	// call super
		var bUnboundModules = false;
		var oModule;
		while (oModule = oDependencyManager.getUnboundModule()) {
			oModule.setParentDependency(this);
			bUnboundModules = true;
		}
		if (!bUnboundModules)
			this.moduleReady();
	};
	
	ScriptDependency.prototype.toString = function() {
		return 'ScriptDependency';
	};
	
	
	
	
	/**
	 * Dummy dependency implementation for the script type.
	 * Used for script tags that were not dynamically inserted but are in the source page.
	 */
	var DummyScriptDependency = function(oScript) {
		// src property is not absolute in IE6 and IE7
		var sURI = browser_ie && browser_ie_version < 8 ? oScript.getAttribute('src', 4) : oScript.src;
		sURI = sURI || oScript.ownerDocument.location.href;
		ScriptDependency.call(this, sURI);
		this.setScriptNode(oScript);
		this.attachLoadHandler(oScript);
	};
	
	gl.extend(ScriptDependency, DummyScriptDependency);
	
	DummyScriptDependency.prototype.getURI = function() {
		return this.uri;
	};
	
	DummyScriptDependency.prototype.doLoad = function() {
		throw new Error('You can not load a DummyScriptDependency.');
	};
	
	DummyScriptDependency.prototype.toString = function() {
		return 'DummyScriptDependency';
	};
	
	
	
	
	/**
	 * Special dependency type to load the URI resolving code.
	 */
	var URIScriptDependency = function() {
		ScriptDependency.call(this, 'gl-uri.js');
		this.loadListeners = [];
	};
	
	gl.extend(ScriptDependency, URIScriptDependency);
	
	URIScriptDependency.prototype.getURI = function() {
		if (!this.parentModule)
			throw new Error('Need to set parent module first before getting URI.');
		var sBaseURI = this.parentModule.getURI();
		return sBaseURI.substr(0, sBaseURI.lastIndexOf('/') + 1) + this.uri;
	};
	
	URIScriptDependency.prototype.load = function() {
		oDependencyManager.registerDependency(this);
		this.doLoad();
	};
	
	URIScriptDependency.prototype.moduleReady = function(oModule) {
		ScriptDependency.prototype.moduleReady.call(this, oModule);
		if (this.isLoaded())
			this.fireLoadEvent(this);
	};
	
	/**
	 * Registers an object as a load listener. When this dependency has loaded,
	 * the ‘dependencyLoaded’ method on the loadListener will be invoked.
	 */
	URIScriptDependency.prototype.addLoadListener = function(oLoadListener) {
		this.loadListeners.push(oLoadListener);
	};
	
	URIScriptDependency.prototype.fireLoadEvent = function() {
		for (var i = 0; i < this.loadListeners.length; i++)
			this.loadListeners[i].dependencyLoaded(this);
	};
	
	URIScriptDependency.prototype.toString = function() {
		return 'URIScriptDependency';
	};
	
	
	
	
	/**
	 * Special dependency type to load dependencies whose type is not registered yet.
	 */
	var UnregisteredDependency = function(sType, sURI, oDependencyManager) {
		Dependency.call(this, sURI);
		this.type = sType;
		this.dependencyManager = oDependencyManager;
		this.loadStarted = false;
		oDependencyManager.addDependencyHandlerListener(this);
	};
	
	gl.extend(Dependency, UnregisteredDependency);
	
	UnregisteredDependency.prototype.dependencyHandlerRegistered = function(sType) {
		if (this.type == sType) {
			var oNewDependency = this.dependencyManager.createDependency(this.type, this.uri);
			for (var i = 0; i < this.parentModule.dependencies.length; i++) {
				// TODO: don’t directly access parent module dependencies collection
				if (this.parentModule.dependencies[i] == this) {
					this.parentModule.dependencies[i] = oNewDependency;
					oNewDependency.setParentModule(this.parentModule);
					if (this.loadStarted)
						oNewDependency.load();
					break;
				}
			}
		}
	};
	
	UnregisteredDependency.prototype.load = function() {
		this.loadStarted = true;
	};
	
	UnregisteredDependency.prototype.toString = function() {
		return 'UnregisteredDependency';
	};
	
	
	
	
	/**
	 * Dependency manager
	 */
	var DependencyManager = function() {
		this.dependencyMap = {};
		this.dependencyList = [];
		this.handlers = {};
		this.unboundModules = [];
		this.handlerListeners = [];
	};
	
	DependencyManager.prototype.isLoaded = function(sURI) {
		return !!this.getDependencyByURI(sURI);
	};
	
	/**
	 * Registers a dependency on DependencyManager.
	 * Uses getURI(), so only register dependencies once their URI is available.
	 * @param oDependency
	 */
	DependencyManager.prototype.registerDependency = function(oDependency) {
		this.dependencyList.push(oDependency);
		this.dependencyMap[oDependency.getURI()] = oDependency;
	};
	
	DependencyManager.prototype.getDependencyByURI = function(sURI) {
		return this.dependencyMap.hasOwnProperty(sURI) && this.dependencyMap[sURI] || null;
	};
	
	DependencyManager.prototype.registerDependencyHandler = function(sType, cDependency) {
		this.handlers[sType] = cDependency;
		
		// fire event
		for (var i = 0; i < this.handlerListeners.length; i++)
			this.handlerListeners[i].dependencyHandlerRegistered(sType);
	};
	
	DependencyManager.prototype.addDependencyHandlerListener = function(oListener) {
		this.handlerListeners.push(oListener);
	};
	
	/**
	 * Put a module in the queue to be picked up by a dependency later.
	 */
	DependencyManager.prototype.registerUnboundModule = function(oModule) {
		this.unboundModules.push(oModule);
	};
	
	/**
	 * Returns a module whose parent dependency has not yet been set.
	 * If there are no more unbound modules, returns null.
	 */
	DependencyManager.prototype.getUnboundModule = function() {
		return this.unboundModules.shift() || null;
	};
	
	/**
	 * Module factory method.
	 */
	DependencyManager.prototype.createModule = function(sName, fInitializer) {
		return new Module(sName, fInitializer);
	};
	
	/**
	 * Dependency factory method.
	 * Creates a dependency based on type.
	 */
	DependencyManager.prototype.createDependency = function(sType, sURI) {
		if (this.handlers.hasOwnProperty(sType)) {
			return new this.handlers[sType](sURI);
		} else {
			return new UnregisteredDependency(sType, sURI, this);
		}
	};
	
	/**
	 * Creates a Dependency object based on descriptor object.
	 * If object is instance of Dependency, returns it immediately.
	 * If object is a string, creates a text/javascript dependency with the string as URI.
	 * If object is an object, uses .type and .src properties to create the dependency.
	 */
	DependencyManager.prototype.createDependencyFromParameter = function(vDescriptor) {
		if (vDescriptor instanceof Dependency) {
			return vDescriptor;
		} else if (typeof vDescriptor == 'object') {
			return this.createDependency(vDescriptor.type || 'text/javascript', vDescriptor.src);
		} else {
			return this.createDependency('text/javascript', vDescriptor);
		}
	};
	
	/**
	 * Instantiates a DummyScriptDependency for every script without dependency.
	 */
	DependencyManager.prototype.dependencyIseEverything = function() {
		var aScripts = document.getElementsByTagName('script');
		for (var i = 0; i < aScripts.length; i++) {
			if (!aScripts[i]._gl_dependency) {
				var oDependency = new DummyScriptDependency(aScripts[i]);
				this.registerDependency(oDependency);
			}
		}
	};
	
	/**
	 * Returns the dependency whose script tag’s readyState is 'interactive', which is the current script.
	 * Searches last-first, in case the script tags are created synchronously by another script.
	 */
	DependencyManager.prototype.getCurrentDependencyIE = function() {
		for (var i = this.dependencyList.length - 1; i >= 0; i--) {
			if (this.dependencyList[i] instanceof ScriptDependency && this.dependencyList[i].isCurrentScript())
				return this.dependencyList[i];
		}
		throw new Error('The current script tag was not found.');
	};
	
	/**
	 * Returns the last script tag that can be found in the document.
	 * While parsing, this is often the current script.
	 */
	DependencyManager.prototype.getLastDependency = function() {
		return this.dependencyList[this.dependencyList.length - 1];
	};
	
	/**
	 * Returns the current dependency, or null if it can not be determined.
	 */
	DependencyManager.prototype.getCurrentDependency = function(sName) {
		if (browser_ie) {
			return this.getCurrentDependencyIE();
		} else {
			var oDependency = this.getLastDependency();
			// XXX: src can be set after the script has been created... more reliable way of detecting?
			if (oDependency instanceof DummyScriptDependency && !oDependency.scriptNode.hasAttribute('src'))
				return oDependency;
		}
		return null;
	};
	
	
	
	
	// initialise dependency manager
	var oDependencyManager = new DependencyManager();
	oDependencyManager.registerDependencyHandler('text/javascript', ScriptDependency);
	
	// create modules for gl and gl.depsys objects
	// load URI library to do URI resolving (a bit of a paradox :))
	var oURIDependency = new URIScriptDependency();
	gl.module('gl.depsys', [oURIDependency], function(){});
	gl.module('gl', [], function(){});
	
	
	
	
	// exports
	this.Module = Module;
	this.Dependency = Dependency;
	this.ScriptDependency = ScriptDependency;
	this.DummyScriptDependency = DummyScriptDependency;
	this.URIScriptDependency = URIScriptDependency;
	this.UnregisteredDependency = UnregisteredDependency;
	this.DependencyManager = DependencyManager;
	this.dependencyManager = oDependencyManager;
	
};
