gl.require(
		'mvc.js',
		'xmlbindings.js',
		{type: 'application/xml', src: 'jsunit.xml'}
	);

gl.module('gl.unit', [], function() {
	
	/**
	 * Unit testing framework
	 */
	var JSUnit = function() {
		this.time = null;
		this.log = new gl.unit.JSUnitLog(document);
		this.init();
	};
	this.JSUnit = gl.Class.create(JSUnit);

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
		document.body.insertBefore(this.log.view, document.body.firstChild);
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
			this.writelnError('AssertEquals failed. ' + sMessage + ' (Expected: ' + oExpected + ', result: ' + oResult + ')');
	};

	JSUnit.prototype.assertTrue = function(bResult, sMessage) {
		if (!bResult)
			this.writelnError('AssertTrue failed. ' + sMessage);
	};

	JSUnit.prototype.assertFalse = function(bResult, sMessage) {
		if (bResult)
			this.writelnError('AssertFalse failed. ' + sMessage);
	};

	JSUnit.prototype.timeStart = function() {
		this.time = new Date();
	};

	JSUnit.prototype.timeEnd = function() {
		return new Date() - this.time;
	};

});
