gl.module('gl.unit',
	[
		'xmlbindings.js',
		{type: 'application/xml', src: 'jsunit.xml'}
	],
	function() {
	
	/**
	 * Unit testing framework
	 */
	var JSUnit = function() {
		this.time = null;
		this.log = new gl.unit.JSUnitLog(document);
	};

	JSUnit.prototype.start = function() {
		this.writeln('JSUnit running…');
		if (location.hash != '#notrycatch') {
			// Note: Secret feature for debugging!
			// Add #notrycatch to URL to avoid the try/catch here.
			try {
				this.test();
			} catch(e) {
				this.writelnError('Error: ' + String(e));
				this.writelnError('JSUnit aborted.');
				this.end();
				throw e;
			}
		} else {
			this.test();
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

	JSUnit.prototype.timeStart = function() {
		this.time = new Date();
	};

	JSUnit.prototype.timeEnd = function() {
		return new Date() - this.time;
	};
	
	
	
	
	// exports
	this.JSUnit = JSUnit;

});
