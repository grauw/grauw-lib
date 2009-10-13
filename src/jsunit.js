gl.require({type: 'application/xml', src: 'jsunit.xml'});

gl.unit = function(module) {
	
	/**
	 * Unit testing framework
	 */
	var JSUnit = function() {
		this.time = null;
		this.log = new gl.unit.JSUnitLog(document);
		this.init();
	};
	module.JSUnit = gl.Class.create(JSUnit);

	JSUnit.prototype.init = function() {
		// override
	};

	JSUnit.prototype.start = function() {
		this.writeln('JSUnit running…');
		try {
			this.test();
		} catch(e) {
			this.writelnError('Error: ' + String(e));
			this.writelnError('JSUnit aborted.');
			this.end();
			throw e;
		}
		this.writeln('JSUnit finished.'); // ...with x errors
		this.end();
	};

	JSUnit.prototype.end = function() {
		document.body.insertBefore(this.log.viewNode, document.body.firstChild);
	};

	JSUnit.prototype.writeln = function(sString) {
		this.log.writeln(sString);
	};

	JSUnit.prototype.writelnError = function(sString) {
		this.log.writelnError(sString);
	};

	JSUnit.prototype.assert = function(bResult, sMessage) {
		if (!bResult)
			this.writelnError('Assertion failed. ' + sMessage);
	};

	JSUnit.prototype.assertEquals = function(oExpected, oResult, sMessage) {
		if (oExpected != oResult)
			this.writelnError('AssertEquals failed. Expected: ' + oExpected + ', result: ' + oResult + ' — ' + sMessage);
	};

	JSUnit.prototype.assertTrue = function(bResult, sMessage) {
		if (!bResult)
			this.writelnError('AssertTrue failed. Result: ' + bResult + ' - ' + sMessage);
	};

	JSUnit.prototype.assertFalse = function(bResult, sMessage) {
		if (bResult)
			this.writelnError('AssertFalse failed. Result: ' + bResult + ' - ' + sMessage);
	};

	JSUnit.prototype.timeStart = function() {
		this.time = new Date();
	};

	JSUnit.prototype.timeEnd = function() {
		return new Date() - this.time;
	};

	return module;
}(gl.unit || {});