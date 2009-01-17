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
	this.outputDiv = document.createElement('div');
	this.init();
}
gl.unit.JSUnit.prototype = new Object();

gl.unit.JSUnit.prototype.init = function() {
	// override
}

gl.unit.JSUnit.prototype.start = function() {
	this.writeln('JSUnit running...');
	this.test();
	this.writeln('JSUnit finished.');
	this.end();
}

gl.unit.JSUnit.prototype.end = function() {
	this.outputDiv.style.width = '800px';
	this.outputDiv.style.position = 'absolute';
	this.outputDiv.style.top = '10px';
	this.outputDiv.style.right = '10px';
	this.outputDiv.style.fontFamily = 'Arial, sans-serif';
	this.outputDiv.style.fontSize = 'smaller';
	document.body.insertBefore(this.outputDiv, document.body.firstChild);
}

gl.unit.JSUnit.prototype.writeln = function(sString) {
	var oDiv = document.createElement('div');
	oDiv.appendChild(document.createTextNode(sString));
	this.outputDiv.appendChild(oDiv);
}

gl.unit.JSUnit.prototype.writelnError = function(sString) {
	var oDiv = document.createElement('div');
	oDiv.style.color = '#f00';
	oDiv.appendChild(document.createTextNode(sString));
	this.outputDiv.appendChild(oDiv);
}

gl.unit.JSUnit.prototype.assertEquals = function(oExpected, oResult, sMessage) {
	if (oExpected != oResult)
		this.writelnError('AssertEquals failed. Expected: ' + oExpected + ', result: ' + oResult + ' — ' + sMessage);
}

gl.unit.JSUnit.prototype.assertTrue = function(bResult, sMessage) {
	if (!bResult)
		this.writelnError('AssertTrue failed. Result: ' + bResult + ' - ' + sMessage);
}

gl.unit.JSUnit.prototype.assertFalse = function(bResult, sMessage) {
	if (bResult)
		this.writelnError('AssertFalse failed. Result: ' + bResult + ' - ' + sMessage);
}

gl.unit.JSUnit.prototype.timeStart = function() {
	this.time = new Date();
}

gl.unit.JSUnit.prototype.timeEnd = function() {
	return new Date() - this.time;
}



