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
	};
	this.mixin = mixin;
	
	
	
	
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
		// create new prototype object that inherits from cBase
		var cPrototype = new Function;
		cPrototype.prototype = cBase.prototype;
		fConstructor.prototype = new cPrototype;
		fConstructor.prototype.constructor = fConstructor;
		return fConstructor;
	};
	this.extend = extend;
	
	
	
	
	/**
	 * Base class.
	 * Use extend() method to create subclasses.
	 * This provides an alternate approach to creating classes, compared to gl.extend(). 
	 */
	var Class = function() {
	};
	this.Class = Class;
	
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
	
};


/**
 * Dependency system
 */
gl.depsys = new function() {

	var browser_ie = !!window.ActiveXObject;
	var browser_ie_version_match = /MSIE (\d+(?:\.\d*)?)/.exec(navigator.appVersion);
	var browser_ie_version = parseFloat(browser_ie_version_match && browser_ie_version_match[1] || '0');
	var XMLHttpRequest = window.XMLHttpRequest || function() { return new ActiveXObject("MSXML2.XMLHTTP.3.0"); };
	
	/**
	 * Returns the last script tag, which is presumed to be this script.
	 * Will probably not work for deferred scripts or certain dynamically inserted scripts...
	 * (But good enough for now.)
	 */
	function getCurrentScript() {
		var aScripts = document.getElementsByTagName('script');
		return aScripts[aScripts.length - 1];
	}
	
	/**
	 * Creates a Dependency object based on descriptor object
	 */
	function createDependency(vDescriptor) {
		var bIsObject = typeof vDescriptor == 'object';
		var sRelativeURI = bIsObject ? vDescriptor.src : vDescriptor;
		var sType = bIsObject && vDescriptor.type || 'text/javascript';
		return oDependencyManager.createDependency(sType, sRelativeURI);
	}
	
	/**
	 * Instantiates a DummyScriptDependency for every script without dependency.
	 */
	function dependencyIseEverything() {
		var aScripts = document.getElementsByTagName('script');
		for (var i = aScripts.length - 1; i >= 0; i--) {
			// TODO: currently skips every script without src
			// XXX: src can be set after the script has been created... more reliable way of detecting?
			if (!aScripts[i]._gl_dependency && aScripts[i].src) {
				var oDependency = new DummyScriptDependency(aScripts[i]);
				oDependencyManager.registerDependency(oDependency);
			}
		}
	}
	
	/**
	 * load URI library to do URI resolving (a bit of a paradox :))
	 */
	function loadURILibrary() {
		dependencyIseEverything();
		var sBaseURI = getCurrentScript()._gl_dependency.getURI();
		var oURIDependency = new URIScriptDependency(sBaseURI);
		oURIDependency.load();
//		dependencyIseEverything();
//		var oModule = new Module('gl.depsys', fCallback);
//		oModule.addDependency(oDependency);
//		oDependencyManager.registerModule(oModule);
//		function fCallback() {
//			// do something
//		}
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
	 * 
	 * The dependency URIs are accepted as plain strings and in the following format:
	 * {type: 'application/xml', src: 'jsunit.xml'}
	 * 
	 * The src field is a relative URI pointing to the file you want to load.
	 * The type field specifies an optional MIME type which will influence how the
	 * file is loaded, by default it is text/javascript.
	 */
	gl.module = function(sName, aDependencies, fImplementation) {
		dependencyIseEverything();
		var oModule = new Module(sName, fImplementation);
		for (var i = 0; i < aDependencies.length; i++) {
			var oDependency = createDependency(aDependencies[i]);
			oModule.addDependency(oDependency);
		}
		oDependencyManager.registerModule(oModule);
		oModule.process();
	};
	
	
	
	
	/**
	 * An object containing the information of a module.
	 * @param {String} sName 
	 * @param {Array} aDependencies
	 * @param {Function} fInitializer
	 */
	var Module = function(sName, fInitializer) {
		this.name = sName;
		this.initializer = fInitializer;
		this.dependencies = [];
		this.parentDependency = null;
		this.object = null;
	};
	
	this.Module = Module;
	
	Module.prototype.getURI = function() {
		if (!this.parentDependency)
			throw new Error('Module getURI() can not be used before parent dependency is set.');
		return this.parentDependency.getURI();
	};
	
	Module.prototype.setParentDependency = function(oDependency) {
		this.parentDependency = oDependency;
		this.loadDependencies();
		//oDependency.addLoadListener(this);
	};
	
	Module.prototype.getParentDependency = function() {
		return this.parentDependency;
	};
	
	Module.prototype.addDependency = function(oDependency) {
		this.dependencies.push(oDependency);
	};
	
	Module.prototype.process = function() {
//		if (!this.parentDependency)
//			throw new Error('Module process() can not be used before parent dependency is set.');
		this.object = this.createModuleObject(this.name);	// XXX: maybe move to the constructor?
//		if (this.parentDependency)
//			this.loadDependencies();	// XXX: remove?
	};
	
	Module.prototype.createModuleObject = function() {
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
		for (var i = 0; i < this.dependencies.length; i++) {
			this.dependencies[i].addLoadListener(this);
			this.dependencies[i].setBaseURI(this.getURI());
			this.dependencies[i].load();
		}
		if (!this.dependencies.length)
			this.ready();
	};
	
	Module.prototype.dependencyLoaded = function(oDependency) {
		if (this.allDependenciesLoaded()) {
			this.ready();
		}
	};
	
	Module.prototype.allDependenciesLoaded = function() {
		// probably this can be implemented a little more efficiently
		for (var i = 0; i < this.dependencies.length; i++) {
			if (!this.dependencies[i].allModulesLoaded())
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
		this.loadListeners = [];
		this.loaded = false;
		this.modules = [];
	};
	
	this.Dependency = Dependency;
	
	/**
	 * Registers a module to be a child of this dependency.
	 * Registered modules are taken into account by allModulesLoaded().
	 * @param oModule The module in this dependency.
	 * @return
	 */
	Dependency.prototype.registerModule = function(oModule) {
		this.modules.push(oModule);
	};
	
	Dependency.prototype.getURI = function() {
		if (!this.baseURI)
			throw new Error('Need to set base URI first before getting URI.')
		return gl.uri.URI.resolve(this.uri, this.baseURI);
	};
	
	Dependency.prototype.setBaseURI = function(sBaseURI) {
		this.baseURI = sBaseURI;
	};
	
	Dependency.prototype.load = function() {
		throw new Error('Abstract method must be implemented by subclass.');
	};
	
	Dependency.prototype.allModulesLoaded = function() {
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
		if (this.allModulesLoaded())
			this.fireLoadEvent();
	};

	/**
	 * Callback when load is complete
	 * @return
	 */
	Dependency.prototype.loadComplete = function() {
		this.loaded = true;
	};
	
	/**
	 * Registers an object as a load listener. When this dependency has loaded,
	 * the ‘dependencyLoaded’ method on the loadListener will be invoked.
	 */
	Dependency.prototype.addLoadListener = function(oLoadListener) {
		this.loadListeners.push(oLoadListener);
	};
	
	Dependency.prototype.fireLoadEvent = function() {
		for (var i = 0; i < this.loadListeners.length; i++) {
			this.loadListeners[i].dependencyLoaded(this);
		}
		// XXX: possible GC optimisation?
//		this.loadListeners = [];	// will only load once, clean up for better GC
	};
	
	
	
	
	/**
	 * Dependency implementation for the script type.
	 * Uses MIME-type ‘application/javascript’.
	 */
	var ScriptDependency = function(sURI) {
		Dependency.call(this, sURI);
		this.scriptNode = null;
	};

	this.ScriptDependency = gl.extend(Dependency, ScriptDependency);
	
	ScriptDependency.prototype.setScriptNode = function(oScript) {
		this.scriptNode = oScript;
		oScript._gl_dependency = this;
	};
	
	ScriptDependency.prototype.load = function() {
		// TODO: don’t load existing dependencies twice
//		if (oDependencyManager.isLoaded(this.uri)) {
//			Dependency.prototype.loadComplete.call(this);	// FIXME
//			return;
//		}
		
		var oHead = document.getElementsByTagName('head')[0];
		var oScript = document.createElement('script');
		this.setScriptNode(oScript);
		// FIXME: use addEventListener / attachEvent
		var oThis = this;
		oScript.onload = function() {
			oThis.loadComplete();
		};
		oScript.type = 'text/javascript';
		oScript.src = this.getURI();
		oHead.appendChild(oScript);	// execute script
	};
	
	ScriptDependency.prototype.loadComplete = function() {
		Dependency.prototype.loadComplete.call(this);	// call super
		var oModule;
		while (oModule = oDependencyManager.getUnboundModule()) {
			this.registerModule(oModule);
			oModule.setParentDependency(this);
		}
		if (!this.modules.length)
			this.moduleReady();
	};
	
	
	
	
	/**
	 * Dummy dependency implementation for the script type.
	 * Used for script tags that were not dynamically inserted but are in the source page.
	 */
	var DummyScriptDependency = function(oScript) {
		// src property is not absolute in IE6 and IE7
		var sURI = browser_ie && browser_ie_version < 8 ? oScript.getAttribute('src', 4) : oScript.src;
		ScriptDependency.call(this, sURI);
		this.setScriptNode(oScript);
		var oThis = this;
		// FIXME: use addEventListener / attachEvent
		oScript.onload = function() {
			oThis.loadComplete();
		};
	};
	
	this.DummyScriptDependency = gl.extend(ScriptDependency, DummyScriptDependency);
	
	DummyScriptDependency.prototype.getURI = function() {
		return this.uri;
	};
	
	DummyScriptDependency.prototype.load = function() {
		throw new Error('You can not load a DummyScriptDependency.')
	};
	
	
	
	
	/**
	 * Special dependency type to load the URI resolving code.
	 */
	var URIScriptDependency = function(sBaseURI) {
		ScriptDependency.call(this, 'gl-uri.js');
		this.baseURI = sBaseURI;
	};
	this.URIScriptDependency = gl.extend(ScriptDependency, URIScriptDependency);
	
	URIScriptDependency.prototype.getURI = function() {
		return this.baseURI.substr(0, this.baseURI.lastIndexOf('/') + 1) + this.uri;
	};
	
	
	
	
	/**
	 * Dependency manager
	 */
	var DependencyManager = function() {
		this.dependencyMap = {};
		this.dependencyList = [];
		this.handlers = {};
		this.moduleQueue = [];
	};
	
	this.DependencyManager = DependencyManager;
	
	DependencyManager.prototype.isLoaded = function(sURI) {
		return !!this.getDependencyByURI(sURI);
	};
	
	DependencyManager.prototype.registerDependency = function(oDependency) {
		this.dependencyList.push(oDependency);
		return oDependency;
		//return this.dependencyMap[oDependency.getURI()] = oDependency;
	};
	
	DependencyManager.prototype.getDependencyByURI = function(sURI) {
		return this.dependencyMap.hasOwnProperty(sURI) && this.dependencyMap[sURI] || null;
	};
	
	DependencyManager.prototype.registerDependencyHandler = function(sType, cDependency) {
		this.handlers[sType] = cDependency;
	};
	
	/**
	 * Dependency factory method.
	 * Creates a dependency based on type.
	 * Also automatically registers the created dependency.
	 */
	DependencyManager.prototype.createDependency = function(sType, sURI) {
		if (this.handlers.hasOwnProperty(sType)) {
			var oDependency = new this.handlers[sType](sURI);
			this.registerDependency(oDependency);
			return oDependency;
		}
		return null;
	};
	
	/**
	 * Put a module in the queue to be picked up by a dependency later.
	 */
	DependencyManager.prototype.registerModule = function(oModule) {
		this.moduleQueue.push(oModule);
	};
	
	/**
	 * Returns a module whose parent dependency has not yet been set.
	 * If there are no more unbound modules, returns null.
	 */
	DependencyManager.prototype.getUnboundModule = function() {
		var oModule;
		while (oModule = this.moduleQueue.shift()) {
			if (!oModule.getParentDependency())
				return oModule;
		}
		return null;
	};
	
	
	
	
	// initialise dependency manager
	var oDependencyManager = new DependencyManager();
	oDependencyManager.registerDependencyHandler('text/javascript', ScriptDependency);
	
	loadURILibrary();
	
	// exports
	this.dependencyManager = oDependencyManager;
	
};
