/**
 * @fileOverview
 * 
 * Unit testing framework
 * 
 * @author Laurens Holst (http://www.grauw.nl/)
 * 
 *   Copyright 2010 Laurens Holst
 * 
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 * 
 */
gl.module('gl.unit',
	[
		'xmlbindings.js',
		{type: 'application/xml', src: 'log.xml'}
	],
	function() {
	
	// imports
	var Log = gl.unit.Log;
	var LogMessage = gl.unit.LogMessage;
	
	
	
	
	/**
	 * A test unit
	 */
	var Test = function() {
		this.time = -1;
		this.error = null;
	};
	
	Test.prototype.toString = function() {
		return 'Test';
	};
	
	Test.prototype.getTime = function() {
		if (this.time == -1)
			throw new Error('Test must run before retrieving running time.');
		return this.time;
	};
	
	Test.prototype.hasCompleted = function() {
		return this.time != -1;
	};
	
	/**
	 * If an error has occurred and was caught, set it for the purpose of rendering it to the view. 
	 */
	Test.prototype.setError = function(oError) {
		this.error = oError;
	};
	
	Test.prototype.getError = function(oError) {
		return this.error;
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
		if (vExpected !== vResult)
			this.assert(false, sMessage + ' (Expected: ' + vExpected + ', result: ' + vResult + ')');
	};
	
	
	
	
	/**
	 * A simple test, using a test function.
	 */
	var SimpleTest = function(sName, fTest) {
		Test.call(this);
		this.name = sName;
		this.test = fTest;
	};
	gl.extend(Test, SimpleTest);
	
	SimpleTest.prototype.toString = function() {
		return this.name;
	};
	
	
	
	
	/**
	 * Exception that is thrown when an assertion fails.
	 */
	var AssertException = function(sMessage) {
		this.message = sMessage;
	};
	
	AssertException.prototype.toString = function() {
		return 'Assertion failed exception: ' + this.message;
	};
	
	
	
	
	/**
	 * A test suite
	 */
	var TestSuite = function() {
		Test.call(this);
		
		this.errors = 0;
		this._tests = null;
	};
	gl.extend(Test, TestSuite);
	
	TestSuite.prototype.getTests = function() {
		throw new Error('Must implement getTests().');
	};
	
	TestSuite.prototype._getTests = function() {
		if (!this._tests)
			this._tests = this.getTests();
		return this._tests;
	};
	
	TestSuite.prototype.test = function() {
		var aTests = this._getTests();
		for (var i = 0; i < aTests.length; i++) {
			if (location.hash != '#notrycatch') {
				// Note: Secret feature for debugging!
				// Add #notrycatch to URL to avoid the try/catch here.
				try {
					aTests[i].run();
				} catch(e) {
					aTests[i].setError(e);
					this.errors++;
				}
			} else {
				aTests[i].run();
			}
		};
	};

	TestSuite.prototype.finalize = function() {
		document.body.insertBefore(new Log(this).getView(document), document.body.firstChild);
	};
	
	
	
	
	// exports
	this.Test = Test;
	this.SimpleTest = SimpleTest;
	this.AssertException = AssertException;
	this.TestSuite = TestSuite;

});
