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
	[{type: 'text/css', src: 'unit.css'}],
	function() {
	
	/**
	 * In some browsers (IE) exceptions don’t cast to string nicely.
	 * @param oError The error object.
	 * @returns {string} The error message.
	 */
	function errorToString(oError) {
		var sError = String(oError);
		if (oError instanceof Error && sError.indexOf(oError.message) == -1)
			return oError.name + ': ' + oError.message;
		return sError;
	}
	
	/**
	 * Convert an object to string in a nice readable format showing indications of type.
	 * @param oError The error object.
	 * @returns {string} The error message.
	 */
	function objectToString(oObject) {
		if (typeof oObject == 'string' || oObject instanceof String) {
			return '"' + oObject.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')
					.replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\v/g, '\\v')
					.replace(/[\b]/g, '\\b').replace(/\f/g, '\\f') + '"';
		} else if (oObject instanceof Array) {
			var aResult = [];
			for (var i = 0; i < oObject.length; i++) {
				aResult.push(objectToString(oObject[i]));
			}
			return '[' + aResult.join(', ') + ']';
		}
		return String(oObject);
	}
	
	
	
	
	/**
	 * A test unit
	 */
	var Test = function() {
		this.time = -1;
		this.errors = [];
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
	Test.prototype.addError = function(oError) {
		this.errors.push(oError);
	};
	
	Test.prototype.getErrors = function() {
		return this.errors;
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
			this.assert(false, 'Expected: ' + objectToString(vExpected) +
					', result: ' + objectToString(vResult) + '.' +
					(sMessage ? ' ' + sMessage : ''));
	};

	Test.prototype.assertNotEquals = function(vNotExpected, vResult, sMessage) {
		if (vNotExpected === vResult)
			this.assert(false, 'Not expected: ' + objectToString(vResult) + '.' +
					(sMessage ? ' ' + sMessage : ''));
	};

	Test.prototype.assertException = function(cException, fTest, sMessage) {
		var oException = null;
		try {
			fTest.call(this);
		} catch(e) {
			oException = e;
		}
		if (!oException) {
			this.assert(false, 'No exception thrown.' +
					(sMessage ? ' ' + sMessage : ''));
		}
		if (cException && !(oException instanceof cException)) {
			this.assert(false, 'Unexpected exception thrown: ' + errorToString(oException) + '.' +
					(sMessage ? ' ' + sMessage : ''));
		}
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
		return 'Assertion failed.' + (this.message ? ' ' + this.message : '');
	};
	
	
	
	
	/**
	 * A group of tests
	 */
	var TestGroup = function(sName, aTests) {
		Test.call(this);
		this.name = sName;
		this.tests = aTests || [];
		this.collapsed = true;
	};
	gl.extend(Test, TestGroup);
	
	TestGroup.prototype.getTests = function() {
		return this.tests;
	};
	
	TestGroup.prototype.addTest = function(oTest) {
		this.tests.push(oTest);
	};
	
	TestGroup.prototype.getErrors = function() {
		var aErrors = [];
		for (var i = 0; i < this.tests.length; i++) {
			aErrors.push.apply(aErrors, this.tests[i].getErrors());
		}
		return aErrors;
	};
	
	TestGroup.prototype.test = function() {
		var aTests = this.getTests();
		for (var i = 0; i < aTests.length; i++) {
			if (location.hash != '#notrycatch') {
				// Note: Secret feature for debugging!
				// Add #notrycatch to URL to avoid the try/catch here.
				try {
					aTests[i].run();
				} catch(e) {
					aTests[i].addError(e);
				}
			} else {
				aTests[i].run();
			}
		};
		this.collapsed = !this.getErrors().length;
	};
	
	TestGroup.prototype.isCollapsed = function() {
		return this.collapsed;
	};
	
	TestGroup.prototype.collapse = function() {
		this.collapsed = true;
	};
	
	TestGroup.prototype.expand = function() {
		this.collapsed = false;
	};
	
	TestGroup.prototype.toString = function() {
		return this.name;
	};
	
	
	
	
	/**
	 * A test suite
	 */
	var TestSuite = function(aTests) {
		TestGroup.call(this, 'Test suite', aTests);
	};
	gl.extend(TestGroup, TestSuite);
	
	TestSuite.prototype.finalize = function() {
		document.body.insertBefore(
				new WindowView(new Window(this)).getHTML(document),
				document.body.firstChild);
	};
	
	
	
	
	/**
	 * A window container
	 */
	var Window = function(oTestSuite) {
		this.testSuite = oTestSuite;
		this.minimized = false;
	};
	
	Window.prototype.isMinimized = function() {
		return this.minimized;
	};
	
	Window.prototype.setMinimized = function(bValue) {
		this.minimized = bValue;
	};
	
	Window.prototype.getTitle = function() {
		return 'Unit test log';
	};
	
	Window.prototype.getBodyContents = function() {
		return [this.testSuite];
	};
	
	
	
	
	/**
	 * Simple view base class.
	 * @param {Object} oModel A model object.
	 */
	var SimpleView = function(oModel) {
		this.model = oModel;
		this.html = null;
	};
	
	SimpleView.prototype.getHTML = function(oDocument) {
		if (!this.html)
			this.html = this.createHTML(oDocument);
		return this.html;
	};
	
	SimpleView.prototype.createHTML = function(oDocument) {
		throw new Error('Must implement createHTML().');
	};
	
	SimpleView.prototype.update = function() {
		if (!this.html)
			throw new Error('View not created yet.');
		var oHTML = this.createHTML(this.html.ownerDocument);
		if (this.html.parentNode)
			this.html.parentNode.replaceChild(oHTML, this.html);
		this.html = oHTML;
	};
	
	SimpleView.prototype.addEventListenerTo = function(oElement, sEvent, fListener) {
		var oThis = this;
		function fWrapper(oEvent) {
			fListener.call(oThis, oEvent || event);
		} 
		if (oElement.addEventListener) {
			oElement.addEventListener(sEvent, fWrapper, false);
		} else {
			oElement.attachEvent('on' + sEvent, fWrapper);
		}
	};
	
	
	
	
	/**
	 * View for TestSuite.
	 * @param {TestSuite} oModel
	 */
	var TestSuiteView = function(oModel) {
		SimpleView.call(this, oModel);
	};
	
	gl.extend(SimpleView, TestSuiteView);
	
	TestSuiteView.prototype.createHTML = function(oDocument) {
		var oTestSuite = oDocument.createElement('div');
		oTestSuite.className = 'gl-unit-testsuite';
		var oTests = oDocument.createElement('ul');
		oTests.className = 'gl-tests';
		var aTests = this.model.getTests();
		for (var i = 0; i < aTests.length; i++) {
			if (aTests[i] instanceof TestGroup)
				oTests.appendChild(new TestGroupView(aTests[i]).getHTML(oDocument));
			else if (aTests[i] instanceof Test)
				oTests.appendChild(new TestView(aTests[i]).getHTML(oDocument));
		}
		oTestSuite.appendChild(oTests);
		var oCompleted = oDocument.createElement('div');
		oCompleted.className = 'gl-completed';
		var aErrors = this.model.getErrors();
		var sCompleted;
		if (aErrors.length) {
			oCompleted.className += ' gl-with-errors';
			sCompleted = 'Unit tests completed with ' + aErrors.length + ' errors.';
		} else {
			sCompleted = 'Unit tests completed.';
		}
		oCompleted.appendChild(oDocument.createTextNode(sCompleted));
		oTestSuite.appendChild(oCompleted);
		var oTime = oDocument.createElement('div');
		oTime.appendChild(oDocument.createTextNode('Time taken: ' + this.model.getTime() + 'ms'));
		oTestSuite.appendChild(oTime);
		return oTestSuite;
	};
	
	
	
	
	/**
	 * View for Test.
	 * @param {Test} oModel
	 */
	var TestView = function(oModel) {
		SimpleView.call(this, oModel);
	};
	
	gl.extend(SimpleView, TestView);
	
	TestView.prototype.createHTML = function(oDocument) {
		var oTest = oDocument.createElement('li');
		oTest.className = 'gl-unit-test';
		oTest.appendChild(oDocument.createTextNode(this.model.toString()));
		if (!this.model.hasCompleted()) {
			oTest.className += ' gl-notcompleted';
		}
		var aErrors = this.model.getErrors();
		if (aErrors.length) {
			oTest.className += ' gl-error';
			for (var i = 0; i < aErrors.length; i++) {
				oTest.appendChild(oDocument.createTextNode(' — ' + errorToString(aErrors[i])));
			}
		}
		if (this.model.hasCompleted() && this.model.getTime() > 8) {
			oTest.appendChild(oDocument.createTextNode(' — time taken: ' + this.model.getTime() + 'ms'));
		}
		return oTest;
	};
	
	
	
	
	/**
	 * View for TestGroup.
	 * @param {TestGroup} oModel
	 */
	var TestGroupView = function(oModel) {
		SimpleView.call(this, oModel);
	};
	
	gl.extend(SimpleView, TestGroupView);
	
	TestGroupView.prototype.createHTML = function(oDocument) {
		var oGroup = oDocument.createElement('li');
		oGroup.className = 'gl-unit-testgroup';
		if (!this.model.hasCompleted()) {
			oGroup.className += ' gl-notcompleted';
		}
		if (this.model.isCollapsed()) {
			oGroup.className += ' gl-collapsed';
		}
		var oName = oDocument.createElement('div');
		oName.className = 'gl-unit-testgroup-name';
		oName.appendChild(oDocument.createTextNode(this.model.toString()));
		if (this.model.hasCompleted() && this.model.getTime() > 8) {
			oName.appendChild(oDocument.createTextNode(' — time taken: ' + this.model.getTime() + 'ms'));
		}
		if (this.model.isCollapsed() && this.model.getErrors().length) {
			var oErrorCount = oDocument.createElement('span');
			oErrorCount.className += ' gl-unit-testgroup-errorcount';
			oErrorCount.appendChild(oDocument.createTextNode(' (with ' + this.model.getErrors().length + ' errors)'));
			oName.appendChild(oErrorCount);
		}
		this.addEventListenerTo(oName, 'click', this.handleCollapse);
		oGroup.appendChild(oName);
		var oContents = oDocument.createElement('ul');
		oContents.className = 'gl-unit-testgroup-contents';
		var aTests = this.model.getTests();
		for (var i = 0; i < aTests.length; i++) {
			var oTestView = null;
			if (aTests[i] instanceof TestGroup)
				oTestView = new TestGroupView(aTests[i]);
			else if (aTests[i] instanceof Test)
				oTestView = new TestView(aTests[i]);
			oContents.appendChild(oTestView.getHTML(oDocument));
		}
		oGroup.appendChild(oContents);
		return oGroup;
	};
	
	TestGroupView.prototype.handleCollapse = function() {
		if (this.model.isCollapsed())
			this.model.expand();
		else
			this.model.collapse();
		this.update();
	};
	
	
	
	
	/**
	 * View for Window.
	 * @param {Window} oModel
	 */
	var WindowView = function(oModel) {
		SimpleView.call(this, oModel);
	};
	
	gl.extend(SimpleView, WindowView);
	
	WindowView.prototype.createHTML = function(oDocument) {
		var oWindow = oDocument.createElement('div');
		oWindow.className = 'gl-window' + (this.model.isMinimized() ? ' gl-window-minimized' : '');
		var oTitle = oDocument.createElement('h2');
		oTitle.appendChild(oDocument.createTextNode(this.model.getTitle()));
		var oButton = oDocument.createElement('button');
		try {
			oButton.type = 'button';
		} catch(e) {
			oButton = oDocument.createElement('<button type="button">');	// IE6/7/8...
		}
		oButton.appendChild(oDocument.createTextNode(this.model.isMinimized() ? '+' : '-'));
		this.addEventListenerTo(oButton, 'click', this.handleToggleMinimised);
		oTitle.appendChild(oButton);
		oWindow.appendChild(oTitle);
		
		var oBody = oDocument.createElement('div');
		oBody.className = 'gl-window-body';
		var aContents = this.model.getBodyContents();
		for (var i = 0; i < aContents.length; i++) {
			if (aContents[i] instanceof TestSuite)
				oBody.appendChild(new TestSuiteView(aContents[i]).getHTML(oDocument));
		}
		oWindow.appendChild(oBody);
		return oWindow;
	};
	
	WindowView.prototype.handleToggleMinimised = function() {
		this.model.setMinimized(!this.model.isMinimized());
		this.update();
	};
	
	
	
	
	// exports
	this.Test = Test;
	this.SimpleTest = SimpleTest;
	this.AssertException = AssertException;
	this.TestGroup = TestGroup;
	this.TestSuite = TestSuite;
	this.Window = Window;
	this.SimpleView = SimpleView;
	this.TestSuiteView = TestSuiteView;
	this.TestView = TestView;
	this.TestGroupView = TestGroupView;
	this.WindowView = WindowView;
	this.errorToString = errorToString;
	this.objectToString = objectToString;

});
