/**
 * @fileOverview
 * Unit testing framework
 */
gl.module('gl.unit',
	[
		'xmlbindings.js',
		{type: 'application/xml', src: 'log.xml'}
	],
	function() {
	
	// imports
	var Log = gl.unit.Log;
	
	
	
	
	/**
	 * A test unit
	 */
	var Test = function() {
		this.time = -1;
	};
	
	Test.prototype.toString = function() {
		return 'Test';
	};
	
	Test.prototype.getTime = function() {
		if (this.time == -1)
			throw new Error('Test must run before retrieving running time.');
		return this.time;
	};
	
	Test.prototype.run = function() {
		this.initialize();
		var oTime = new Date();
		this.test();
		this.time = new Date() - oTime;
		this.finalize();
	};
	
	Test.prototype.test = function() {
		throw new Error('Must implement test().');
	};
	
	Test.prototype.initialize = function() {
	};
	
	Test.prototype.finalize = function() {
	};
	
	Test.prototype.assert = function(bCondition, sMessage) {
		if (!bCondition)
			throw new AssertException(sMessage);
	};

	Test.prototype.assertEquals = function(vExpected, vResult, sMessage) {
		if (vExpected != vResult)
			this.assert(false, sMessage + ' (Expected: ' + vExpected + ', result: ' + vResult + ')');
	};
	
	
	
	
	/**
	 * A simple test, using a test function.
	 */
	var SimpleTest = function(sName, fTest) {
		Test.call(this);
		this.name = sName;
		this.testFunction = fTest;
	};
	gl.extend(Test, SimpleTest);
	
	SimpleTest.prototype.test = function() {
		var fTest = this.testFunction;
		fTest();
	};
	
	SimpleTest.prototype.toString = function() {
		return this.name;
	};
	
	
	
	
	/**
	 * Exception that is thrown when an assertion fails.
	 */
	var AssertException = function(sMessage) {
		this.message = sMessage;
		Error.call(this, this.toString()); // call super
	};
	gl.extend(Error, AssertException);
	
	AssertException.prototype.toString = function() {
		return 'Assertion failed exception: ' + this.message;
	};
	
	
	
	
	/**
	 * A test suite
	 */
	var TestSuite = function() {
		Test.call(this);
		
		this.errors = 0;
		this.log = new Log(document);
	};
	gl.extend(Test, TestSuite);
	
	TestSuite.prototype.getTests = function() {
		throw new Error('Must implement getTests().');
	};
	
	TestSuite.prototype.initialize = function() {
		this.writeln('Unit tests running…');
	};
	
	TestSuite.prototype.test = function() {
		var aTests = this.getTests();
		for (var i = 0; i < aTests.length; i++) {
			this.writeln(String(aTests[i]));
			if (location.hash != '#notrycatch') {
				// Note: Secret feature for debugging!
				// Add #notrycatch to URL to avoid the try/catch here.
				try {
					aTests[i].run();
				} catch(e) {
					this.writelnError('Error: ' + String(e));
					this.errors++;
				}
			} else {
				aTests[i].run();
			}
			if (aTests[i].getTime() > 8)
				this.writeln('\u00A0\u00A0\u00A0— time taken: ' + aTests[i].getTime() + 'ms');
		};
	};

	TestSuite.prototype.finalize = function() {
		if (!this.errors)
			this.writeln('Unit tests finished.'); // ...with x errors
		else
			this.writeln('Unit tests finished with ' + this.errors + ' errors.');
		this.writeln('Time taken: ' + this.getTime() + 'ms');
		document.body.insertBefore(this.log.view, document.body.firstChild);
	};

	TestSuite.prototype.writeln = function(sString) {
		this.log.writeln(sString);
	};

	TestSuite.prototype.writelnError = function(sString) {
		this.log.writelnError(sString);
	};
	
	
	
	
	// exports
	this.Test = Test;
	this.SimpleTest = SimpleTest;
	this.AssertException = AssertException;
	this.TestSuite = TestSuite;

});
