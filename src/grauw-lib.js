gl = {};


/**
 * Boot this shit!
 */
gl.boot = function() {
}


/**
 * Base object?
 * Just an experiment...
 */
gl.Class = function() {
};

gl.Class.create = function(fConstructor, cBase) {
	// create new prototype object that inherits from cBase
	var cPrototype = new Function;
	cPrototype.prototype = (cBase || Object).prototype;
	fConstructor.prototype = new cPrototype;
	return fConstructor;
}

gl.Class.mixin = function(oObject, hMethods) {
   for (var i in hMethods)
       oObject[i] = hMethods[i];
}


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
}

if (!gl.unit)
	gl.unit = {};

/**
 * Unit testing framework
 */
gl.unit.JSUnit = function() {
	this.time = null;
	this.output = '';
	this.init();
}
gl.unit.JSUnit.prototype = new Object();

gl.unit.JSUnit.prototype.init = function() {
	// override
}

gl.unit.JSUnit.prototype.start = function() {
	// override
	this.end();
}

gl.unit.JSUnit.prototype.end = function() {
	var oTextArea = document.createElement('textarea');
	oTextArea.cols = 80;
	oTextArea.rows = 30;
	oTextArea.style.position = 'absolute';
	oTextArea.style.top = '10px';
	oTextArea.style.right = '10px';
	oTextArea.value = this.output;
	document.body.insertBefore(oTextArea, document.body.firstChild);
}

gl.unit.JSUnit.prototype.writeln = function(sString) {
	this.output += sString + '\n';
}

gl.unit.JSUnit.prototype.timeStart = function() {
	this.time = new Date();
}

gl.unit.JSUnit.prototype.timeEnd = function() {
	return new Date() - this.time;
}



