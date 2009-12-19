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
	 * Base object?
	 * Just an experiment...
	 */
	var Class = function() {
	};
	this.Class = Class;
	
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
	Class.create = function(fConstructor, cBase) {
		// create new prototype object that inherits from cBase
		var cPrototype = new Function;
		cPrototype.prototype = (cBase || Object).prototype;
		fConstructor.prototype = new cPrototype;
		fConstructor.prototype.constructor = fConstructor;
		// fConstructor.parent = cBase? (or is that implicit from prototype?)
		return fConstructor;
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
	Class.create2 = function(cBase, hMembers, hStaticMembers) {
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
	var Prototype = function() {
	};
	this.Prototype = Prototype;
	
	Prototype.extend = function(cBase) {
		// create new prototype object that inherits from cBase
		var cPrototype = new Function;
		cPrototype.prototype = (cBase || Object).prototype;
		return new cPrototype;
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
	 * Returns the URI of a script tag.
	 * In IE6 and IE7 the src property is not absolute, so need to use another method.
	 * If no src property is specified, it returns the URI of the _gl_dependency property
	 * which is present if the script tag was created by a dependency.
	 */
	function getScriptURI(oScript) {
		var sScriptSrc = browser_ie && browser_ie_version < 8 ? oScript.getAttribute('src', 4) : oScript.src;
		return sScriptSrc || (oScript._gl_dependency && oScript._gl_dependency.getURI()) || null;
	}
	
	/**
	 * Returns the last script tag, which is presumed to be this script.
	 * Will probably not work for deferred scripts or certain dynamically inserted scripts...
	 * (But good enough for now.)
	 */
	function getCurrentScript() {
		if (ScriptDependency.currentDependency)
			return ScriptDependency.currentDependency.scriptNode;
		var aScripts = document.getElementsByTagName('script');
		return aScripts[aScripts.length - 1];
	}
	
	/**
	 * Creates a Dependency object based on descriptor object and base URI
	 */
	function createDependency(vDescriptor, sBaseURI) {
		var bIsObject = typeof vDescriptor == 'object';
		var sRelativeURI = bIsObject ? vDescriptor.src : vDescriptor;
		var sType = bIsObject && vDescriptor.type || 'text/javascript';
		var sURI = gl.uri.URI.resolve(sRelativeURI, sBaseURI);
		return oDependencyManager.createDependency(sType, sURI);
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
	 * mechanism to determine the base URI will fail.
	 * 
	 * XXX: Maybe it should also accept plain strings (and then )
	 */
	gl.require = function() {
		var sBaseURI = getScriptURI(getCurrentScript());
		for (var i = 0; i < arguments.length; i++) {
			var oDependency = createDependency(arguments[i], sBaseURI);
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
	 * 
	 * The dependency URIs are accepted as plain strings and in the following format:
	 * {type: 'application/xml', src: 'jsunit.xml'}
	 * 
	 * The src field is a relative URI pointing to the file you want to load.
	 * The type field specifies an optional MIME type which will influence how the
	 * file is loaded, by default it is text/javascript.
	 */
	gl.module = function(sName, aDependencies, fImplementation) {
		var sBaseURI = getScriptURI(getCurrentScript());
		var oModule = new Module(sName, fImplementation, sBaseURI);
		if (ScriptDependency.currentDependency)
			ScriptDependency.currentDependency.registerModule(oModule);
		for (var i = 0; i < aDependencies.length; i++) {
			var oDependency = createDependency(aDependencies[i], sBaseURI);
			oModule.addDependency(oDependency);
		}
//		oModuleManager.register(oModule);
		oModule.process();
	};

	/**
	 * An object containing the information of a module.
	 * @param {String} sName 
	 * @param {Array} aDependencies
	 * @param {Function} fInitializer
	 */
	var Module = function(sName, fInitializer, sURI) {
		this.name = sName;
		this.initializer = fInitializer;
		this.uri = sURI;
		this.dependencies = [];
		this.object = null;
	};
	
	this.Module = Module;
	
	Module.prototype.getURI = function(oDependency) {
		return this.uri;
	};
	
	Module.prototype.addDependency = function(oDependency) {
		this.dependencies.push(oDependency);
	};
	
	Module.prototype.process = function() {
		this.object = this.createModuleObject(this.name);	// XXX: maybe move to the constructor?
		this.loadDependencies();
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
			this.dependencies[i].loadAsync();
		}
		if (!this.dependencies.length)
			this.initialize();
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
		this.initializer.call(this.object, this);
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
	 * Registered modules are taken into account by isLoaded().
	 * @param oModule The module in this dependency.
	 * @return
	 */
	Dependency.prototype.registerModule = function(oModule) {
		this.modules.push(oModule);
	};
	
	Dependency.prototype.getURI = function() {
		return this.uri;
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
	};
	
	
	
	
	/**
	 * Dependency implementation for the script type.
	 * Uses MIME-type ‘application/javascript’.
	 */
	var ScriptDependency = function(sURI) {
		Dependency.call(this, sURI);
		this.scriptNode = null;
	};

	this.ScriptDependency = gl.Class.create(ScriptDependency, Dependency);
	
	ScriptDependency.currentDependency = null;
	
	ScriptDependency.prototype.load = function() {
		this._load(false);
	};
	
	ScriptDependency.prototype.loadAsync = function() {
		this._load(true);
	};
	
	ScriptDependency.prototype._load = function(bAsync) {
		if (oDependencyManager.isLoaded(this.uri)) {
			this.loadComplete();
			return;
		}
		
		var oXHR = new XMLHttpRequest();
		if (bAsync) {
			var oThis = this;
			oXHR.onreadystatechange = function() {
				if (oXHR.readyState == 4)
					oThis._loadComplete(oXHR);
			}
		}
		oXHR.open('GET', this.uri, bAsync);
		oXHR.setRequestHeader('Accept', 'text/javascript');
		oXHR.send();
		if (!bAsync)
			this._loadComplete(oXHR);
	};
	
	ScriptDependency.prototype._loadComplete = function(oXHR) {
		var oHead = document.getElementsByTagName('head')[0];
		var oScript = document.createElement('script');
		this.scriptNode = oScript;
		oScript.type = 'text/javascript';
		oScript._gl_dependency = this;
		
		var sScript = oXHR.responseText;
		oScript.text = sScript;
		ScriptDependency.currentDependency = this;
		oHead.appendChild(oScript);	// execute script
		ScriptDependency.currentDependency = null;
		// oScript.src = this.uri;
		this.loadComplete();
	};
	
	
	
	
	/**
	 * Dependency manager
	 */
	var DependencyManager = function() {
		this.dependencyMap = {};
		this.handlers = {};
	};
	
	this.DependencyManager = DependencyManager;
	
	DependencyManager.prototype.isLoaded = function(sURI) {
		if (this.getDependencyByURI(sURI))
			return true;
		var aScripts = document.getElementsByTagName('script');
		for (var i = 0; i < aScripts.length; i++) {
			if (getScriptURI(aScripts[i]) == sURI)
				return true;
		}
		return false;
	};
	
	DependencyManager.prototype.getDependencyByURI = function(sURI) {
		return this.dependencyMap.hasOwnProperty(sURI) && this.dependencyMap[sURI] || null;
	};
	
	DependencyManager.prototype.registerDependencyHandler = function(sType, cDependency) {
		this.handlers[sType] = cDependency;
	};
	
	DependencyManager.prototype.createDependency = function(sType, sURI) {
		return this.handlers[sType] && new this.handlers[sType](sURI) || null;
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
	
	// load URI library to do URI resolving (a bit of a paradox :))
	var sBaseURI = getScriptURI(getCurrentScript());
	var oURIDependency = new ScriptDependency(sBaseURI.substr(0, sBaseURI.lastIndexOf('/')) + '/gl-uri.js');
	oURIDependency.load();
	
	// exports
	this.dependencyManager = oDependencyManager;
	
};
