gl.module('unit',
	[
		'../src/unit.js',
		'../src/mvc.js'
	],
	function() {
	
	// imports
	var Test = gl.unit.Test;
	var SimpleTest = gl.unit.SimpleTest;
	var TestSuite = gl.unit.TestSuite;
	var TestGroup = gl.unit.TestGroup;
	var Model = gl.mvc.Model;
	var View = gl.mvc.View;
	var Iterator = gl.mvc.Iterator;
	var ArrayIterator = gl.mvc.ArrayIterator;
	
	
	
	
	var TestIterator = gl.extend(Iterator, function() {
		this.counter = 1;
	});
	
	TestIterator.prototype.next = function() {
//		return this.counter < 4 ? this.counter++ : null;
		return this.counter++;
	};
	
	TestIterator.prototype.peek = function() {
		return this.counter;
	};
	
	TestIterator.prototype.hasNext = function() {
		return this.counter < 4;
	};
	
	
	
	
	var TestView = function(oModel) {
		View.call(this, oModel);
		this.called = 0;
		this.document = null;
	};
	
	gl.extend(View, TestView);
	
	TestView.prototype.createHTML = function(oDocument) {
		this.called++;
		this.document = this.document && this.document != oDocument ? "Wrong document!" : oDocument;
		return oDocument.createElement('div');
	};
	
	
	
	
	function createSomeViews() {
		return [new TestView({}), new TestView({}), new TestView({}), new TestView({})];
	};
	
	
	
	
	/**
	 * Unit tests
	 */
	var oMVCSuite = new TestSuite([
		new TestGroup('Model',
			[
				new SimpleTest('Model::constructor()', function() {
					var oModel = new Model();
					this.assert(oModel instanceof Model);
				}),
				
				new SimpleTest('Model::hasObserver()', function() {
					var oModel = new Model();
					var oObserver = {update: function() {}};
					this.assertEquals(false, oModel.hasObserver(oObserver));
				}),
				
				new SimpleTest('Model::addObserver()', function() {
					var oModel = new Model();
					var oObserver = {update: function() {}};
					oModel.addObserver(oObserver);
				}),
				
				new SimpleTest('Model::addObserver() first observer', function() {
					var oModel = new Model();
					var oObserver = {update: function() {}};
					oModel.addObserver(oObserver);
					this.assertEquals(true, oModel.hasObserver(oObserver));
				}),
				
				new SimpleTest('Model::addObserver() second observer', function() {
					var oModel = new Model();
					var oObserver1 = {update: function() {}};
					var oObserver2 = {update: function() {}};
					oModel.addObserver(oObserver1);
					oModel.addObserver(oObserver2);
					this.assertEquals(true, oModel.hasObserver(oObserver2));
				}),
				
				new SimpleTest('Model::removeObserver()', function() {
					var oModel = new Model();
					var oObserver = {update: function() {}};
					oModel.removeObserver(oObserver);
				}),
				
				new SimpleTest('Model::removeObserver() existing observer', function() {
					var oModel = new Model();
					var oObserver = {update: function() {}};
					oModel.addObserver(oObserver);
					oModel.removeObserver(oObserver);
					this.assertEquals(false, oModel.hasObserver(oObserver));
				}),
				
				new SimpleTest('Model::removeObserver() first observer', function() {
					var oModel = new Model();
					var oObserver1 = {update: function() {}};
					var oObserver2 = {update: function() {}};
					oModel.addObserver(oObserver1);
					oModel.addObserver(oObserver2);
					oModel.removeObserver(oObserver1);
					this.assertEquals(true, oModel.hasObserver(oObserver2));
				}),
				
				new SimpleTest('Model::removeObserver() second observer', function() {
					var oModel = new Model();
					var oObserver1 = {update: function() {}};
					var oObserver2 = {update: function() {}};
					oModel.addObserver(oObserver1);
					oModel.addObserver(oObserver2);
					oModel.removeObserver(oObserver2);
					this.assertEquals(true, oModel.hasObserver(oObserver1));
				}),
				
				new SimpleTest('Model::removeObserver() doubly added observer', function() {
					var oModel = new Model();
					var oObserver = {update: function() {}};
					oModel.addObserver(oObserver);
					oModel.addObserver(oObserver);
					oModel.removeObserver(oObserver);
					this.assertEquals(true, oModel.hasObserver(oObserver));
				}),
				
				new SimpleTest('Model::notifyObservers()', function() {
					var oModel = new Model();
					var bNotified = false;
					var oObserver = {update: function(sContext, oSource) {
						bNotified = sContext == 'test' && oSource == oModel;
					}};
					oModel.addObserver(oObserver);
					oModel.notifyObservers('test');
					this.assertEquals(true, bNotified);
				}),
				
				new SimpleTest('Model::notifyObservers() multiple observers', function() {
					var oModel = new Model();
					var bNotified1 = false;
					var bNotified2 = false;
					var oObserver1 = {update: function(sContext, oSource) {
						bNotified1 = sContext == 'test' && oSource == oModel;
					}};
					var oObserver2 = {update: function(sContext, oSource) {
						bNotified2 = sContext == 'test' && oSource == oModel;
					}};
					oModel.addObserver(oObserver1);
					oModel.addObserver(oObserver2);
					oModel.notifyObservers('test');
					this.assertEquals(true, bNotified1);
					this.assertEquals(true, bNotified2);
				}),
				
				new SimpleTest('Model::notifyObservers() double observer', function() {
					var oModel = new Model();
					var iNotified = 0;
					var oObserver = {update: function(sContext, oSource) {
						if (sContext == 'test' && oSource == oModel)
							iNotified++;
					}};
					oModel.addObserver(oObserver);
					oModel.addObserver(oObserver);
					oModel.notifyObservers('test');
					this.assertEquals(2, iNotified);
				}),
				
				new SimpleTest('Model::notifyObservers() removed observer', function() {
					var oModel = new Model();
					var bNotified = false;
					var oObserver = {update: function(sContext, oSource) {
						bNotified = true;
					}};
					oModel.addObserver(oObserver);
					oModel.removeObserver(oObserver);
					oModel.notifyObservers('test');
					this.assertEquals(false, bNotified);
				})
			]
		),
		new TestGroup('View',
			[
				new SimpleTest('View::constructor()', function() {
					var oView = new View({});
					this.assert(oView instanceof View);
				}),
				
				new SimpleTest('View::constructor() observable model', function() {
					var oModel = new Model();
					var oView = new View(oModel);
					this.assertEquals(false, oModel.hasObserver(oView));
				}),
				
				new SimpleTest('View::createHTML()', function() {
					var oView = new View({});
					this.assertException(Error, function() {
						oView.createHTML();
					});
				}),
				
				new SimpleTest('View::getHTML()', function() {
					var oView = new TestView({});
					var oHTML = oView.getHTML(document);
					this.assertEquals(1, oView.called);
					this.assertEquals(document, oView.document);
					this.assertEquals('div', oHTML.tagName.toLowerCase());
				}),
				
				new SimpleTest('View::getHTML() twice', function() {
					var oView = new TestView({});
					oView.getHTML(document);
					oView.getHTML(document);
					this.assertEquals(1, oView.called);
					this.assertEquals(document, oView.document);
				}),
				
				new SimpleTest('View::getHTML() observable model', function() {
					var oModel = new Model();
					var oView = new TestView(oModel);
					oView.getHTML(document);
					this.assertEquals(true, oModel.hasObserver(oView));
				}),
				
				new SimpleTest('View::update()', function() {
					var oView = new TestView({});
					oView.getHTML(document);
					oView.update();
					this.assertEquals(2, oView.called);
					this.assertEquals(document, oView.document);
				}),
				
				new SimpleTest('View::update() before createHTML()', function() {
					var oView = new View({});
					this.assertException(Error, function() {
						oView.update();
					});
				}),
				
				new SimpleTest('View::update() attached node', function() {
					var oView = new TestView({});
					var oContainer = document.createElement('div'); 
					var oHTML = oView.getHTML(document);
					oContainer.appendChild(oHTML);
					oView.update();
					this.assertEquals(1, oContainer.childNodes.length);
					this.assertNotEquals(oHTML, oContainer.childNodes[0]);
				}),
				
				new SimpleTest('View::clear()', function() {
					var oView = new TestView({});
					var oContainer = document.createElement('div'); 
					var oHTML = oView.getHTML(document);
					oContainer.appendChild(oHTML);
					oView.clear();
					this.assertEquals(0, oContainer.childNodes.length);
				}),
				
				new SimpleTest('View::clear() observable model', function() {
					var oModel = new Model();
					var oView = new TestView(oModel);
					var oContainer = document.createElement('div');
					var oHTML = oView.getHTML(document);
					oContainer.appendChild(oHTML);
					oView.clear();
					this.assertEquals(false, oModel.hasObserver(oView));
				}),
				
				new SimpleTest('View::clear() initial', function() {
					var oView = new View({});
					oView.clear();
				}),
				
				new SimpleTest('View::clear() initial, observable model', function() {
					var oView = new View(new Model());
					oView.clear();
				}),
				
				new SimpleTest('View::addEventListenerTo()', function() {
					var oView = new View({});
					var oInput = document.createElement('input');
					var bTriggered = false;
					oView.addEventListenerTo(oInput, 'click', function(oEvent) {
						bTriggered = oEvent.type == 'click' && this == oView;
					});
					document.body.appendChild(oInput); // needed by IE
					if (oInput.dispatchEvent) {
						var oEvent = document.createEvent('MouseEvents');
						oEvent.initMouseEvent('click', true, true, null, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
						oInput.dispatchEvent(oEvent);
					} else {
						oInput.fireEvent("onclick");
					}
					this.assertEquals(true, bTriggered);
					
					// clean up
					document.body.removeChild(oInput);
				}),
				
				new SimpleTest('View::renderViews(views, element)', function() {
					var oView = new View({});
					var aViews = createSomeViews();
					var oContainer = document.createElement('div');
					oContainer.appendChild(document.createTextNode('x1'));
					oContainer.appendChild(document.createTextNode('x2'));
					oView.renderViews(aViews, oContainer);
					this.assertEquals(aViews[0].getHTML(document), oContainer.childNodes[0]);
					this.assertEquals(aViews[1].getHTML(document), oContainer.childNodes[1]);
					this.assertEquals(aViews[2].getHTML(document), oContainer.childNodes[2]);
					this.assertEquals(aViews[3].getHTML(document), oContainer.childNodes[3]);
					this.assertEquals(4, oContainer.childNodes.length);
				}),
				
				new SimpleTest('View::renderViews(views, element, after)', function() {
					var oView = new View({});
					var aViews = createSomeViews();
					var oContainer = document.createElement('div');
					var oAfter = document.createTextNode('after');
					oContainer.appendChild(document.createTextNode('x1'));
					oContainer.appendChild(oAfter);
					oContainer.appendChild(document.createTextNode('x2'));
					oView.renderViews(aViews, oContainer, oAfter);
					this.assertEquals(oAfter, oContainer.childNodes[1]);
					this.assertEquals(aViews[0].getHTML(document), oContainer.childNodes[2]);
					this.assertEquals(aViews[1].getHTML(document), oContainer.childNodes[3]);
					this.assertEquals(aViews[2].getHTML(document), oContainer.childNodes[4]);
					this.assertEquals(aViews[3].getHTML(document), oContainer.childNodes[5]);
					this.assertEquals(6, oContainer.childNodes.length);
				}),
				
				new SimpleTest('View::renderViews(views, element, , before)', function() {
					var oView = new View({});
					var aViews = createSomeViews();
					var oContainer = document.createElement('div');
					var oBefore = document.createTextNode('before');
					oContainer.appendChild(document.createTextNode('x1'));
					oContainer.appendChild(oBefore);
					oContainer.appendChild(document.createTextNode('x2'));
					oView.renderViews(aViews, oContainer, null, oBefore);
					this.assertEquals(aViews[0].getHTML(document), oContainer.childNodes[0]);
					this.assertEquals(aViews[1].getHTML(document), oContainer.childNodes[1]);
					this.assertEquals(aViews[2].getHTML(document), oContainer.childNodes[2]);
					this.assertEquals(aViews[3].getHTML(document), oContainer.childNodes[3]);
					this.assertEquals(oBefore, oContainer.childNodes[4]);
					this.assertEquals(6, oContainer.childNodes.length);
				}),
				
				new SimpleTest('View::renderViews(views, element, after, before)', function() {
					var oView = new View({});
					var aViews = createSomeViews();
					var oContainer = document.createElement('div');
					var oAfter = document.createTextNode('after');
					var oBefore = document.createTextNode('before');
					oContainer.appendChild(oAfter);
					oContainer.appendChild(document.createTextNode('x'));
					oContainer.appendChild(oBefore);
					oView.renderViews(aViews, oContainer, oAfter, oBefore);
					this.assertEquals(oAfter, oContainer.childNodes[0]);
					this.assertEquals(aViews[0].getHTML(document), oContainer.childNodes[1]);
					this.assertEquals(aViews[1].getHTML(document), oContainer.childNodes[2]);
					this.assertEquals(aViews[2].getHTML(document), oContainer.childNodes[3]);
					this.assertEquals(aViews[3].getHTML(document), oContainer.childNodes[4]);
					this.assertEquals(oBefore, oContainer.childNodes[5]);
					this.assertEquals(6, oContainer.childNodes.length);
				}),
				
				new SimpleTest('View::renderViews(views, element) reordering', function() {
					var oView = new View({});
					var aViews = createSomeViews();
					var oContainer = document.createElement('div');
					oContainer.appendChild(aViews[1].getHTML(document));
					oContainer.appendChild(aViews[3].getHTML(document));
					oContainer.appendChild(aViews[2].getHTML(document));
					oContainer.appendChild(aViews[0].getHTML(document));
					oView.renderViews(aViews, oContainer);
					this.assertEquals(aViews[0].getHTML(document), oContainer.childNodes[0]);
					this.assertEquals(aViews[1].getHTML(document), oContainer.childNodes[1]);
					this.assertEquals(aViews[2].getHTML(document), oContainer.childNodes[2]);
					this.assertEquals(aViews[3].getHTML(document), oContainer.childNodes[3]);
					this.assertEquals(4, oContainer.childNodes.length);
				}),
				
				new SimpleTest('View::renderViews(views, element) inserting', function() {
					var oView = new View({});
					var aViews = createSomeViews();
					var oContainer = document.createElement('div');
					oContainer.appendChild(aViews[0].getHTML(document));
					oContainer.appendChild(aViews[1].getHTML(document));
					oContainer.appendChild(aViews[3].getHTML(document));
					oView.renderViews(aViews, oContainer);
					this.assertEquals(aViews[0].getHTML(document), oContainer.childNodes[0]);
					this.assertEquals(aViews[1].getHTML(document), oContainer.childNodes[1]);
					this.assertEquals(aViews[2].getHTML(document), oContainer.childNodes[2]);
					this.assertEquals(aViews[3].getHTML(document), oContainer.childNodes[3]);
					this.assertEquals(4, oContainer.childNodes.length);
				}),
				
				new SimpleTest('View::renderViews(views, element) removing', function() {
					var oView = new View({});
					var aViews = createSomeViews();
					var oContainer = document.createElement('div');
					oContainer.appendChild(aViews[3].getHTML(document));
					oContainer.appendChild(document.createElement('div'));
					oContainer.appendChild(aViews[0].getHTML(document));
					oContainer.appendChild(document.createTextNode('x'));
					oContainer.appendChild(aViews[1].getHTML(document));
					oContainer.appendChild(aViews[2].getHTML(document));
					oView.renderViews(aViews, oContainer);
					this.assertEquals(aViews[0].getHTML(document), oContainer.childNodes[0]);
					this.assertEquals(aViews[1].getHTML(document), oContainer.childNodes[1]);
					this.assertEquals(aViews[2].getHTML(document), oContainer.childNodes[2]);
					this.assertEquals(aViews[3].getHTML(document), oContainer.childNodes[3]);
					this.assertEquals(4, oContainer.childNodes.length);
				})
			]
		),
		new TestGroup('ArrayIterator',
			[
				new SimpleTest('ArrayIterator::constructor()', function() {
					var oIterator = new ArrayIterator([]);
					this.assert(oIterator instanceof ArrayIterator);
					this.assert(oIterator instanceof Iterator);
				}),
				
				new SimpleTest('ArrayIterator::next()', function() {
					var oIterator = new ArrayIterator([1, 2, 3]);
					this.assertEquals(1, oIterator.next());
					this.assertEquals(2, oIterator.next());
					this.assertEquals(3, oIterator.next());
					this.assertEquals(undefined, oIterator.next());
				}),
				
				new SimpleTest('ArrayIterator::next() empty array', function() {
					var oIterator = new ArrayIterator([]);
					this.assertEquals(undefined, oIterator.next());
				}),
				
				new SimpleTest('ArrayIterator::peek()', function() {
					var oIterator = new ArrayIterator([1, 2, 3]);
					this.assertEquals(1, oIterator.peek());
				}),
				
				new SimpleTest('ArrayIterator::peek() after next()', function() {
					var oIterator = new ArrayIterator([1, 2, 3]);
					oIterator.next();
					this.assertEquals(2, oIterator.peek());
				}),
				
				new SimpleTest('ArrayIterator::peek() empty array', function() {
					var oIterator = new ArrayIterator([]);
					this.assertEquals(undefined, oIterator.peek());
				}),
				
				new SimpleTest('ArrayIterator::hasNext()', function() {
					var oIterator = new ArrayIterator([1, 2, 3]);
					this.assertEquals(true, oIterator.hasNext());
				}),
				
				new SimpleTest('ArrayIterator::hasNext() empty array', function() {
					var oIterator = new ArrayIterator([]);
					this.assertEquals(false, oIterator.hasNext());
				}),
				
				new SimpleTest('ArrayIterator::hasNext() after next()', function() {
					var oIterator = new ArrayIterator([1, 2, 3]);
					oIterator.next();
					this.assertEquals(true, oIterator.hasNext());
				}),
				
				new SimpleTest('ArrayIterator::hasNext() after last next()', function() {
					var oIterator = new ArrayIterator([1]);
					oIterator.next();
					this.assertEquals(false, oIterator.hasNext());
				}),
				
				new SimpleTest('ArrayIterator::forEach()', function() {
					var oIterator = new ArrayIterator([1, 2, 3]);
					var iCount = 0;
					var bCorrect = true;
					oIterator.forEach(function(iValue) {
						iCount++;
						bCorrect = bCorrect && iValue == iCount;
					});
					this.assertEquals(3, iCount);
					this.assertEquals(true, bCorrect);
				}),
				
				new SimpleTest('ArrayIterator::forEach() after next()', function() {
					var oIterator = new ArrayIterator([1, 2, 3]);
					var iCount = 0;
					var bCorrect = true;
					oIterator.next();
					oIterator.forEach(function(iValue) {
						iCount++;
						bCorrect = bCorrect && iValue == iCount + 1;
					});
					this.assertEquals(2, iCount);
					this.assertEquals(true, bCorrect);
				}),
				
				new SimpleTest('ArrayIterator::getArray()', function() {
					var oIterator = new ArrayIterator([3, 2, 1]);
					var aTest = oIterator.getArray();
					this.assertEquals(3, aTest.length);
					this.assertEquals(3, aTest[0]);
					this.assertEquals(2, aTest[1]);
					this.assertEquals(1, aTest[2]);
				}),
				
				new SimpleTest('ArrayIterator::getArray() returns new array', function() {
					var aTest = [1, 2, 3];
					var oIterator = new ArrayIterator(aTest);
					this.assertNotEquals(aTest, oIterator.getArray());
				}),
				
				new SimpleTest('ArrayIterator::getArray() after next()', function() {
					var oIterator = new ArrayIterator([3, 2, 1]);
					oIterator.next();
					var aTest = oIterator.getArray();
					this.assertEquals(2, aTest.length);
					this.assertEquals(2, aTest[0]);
					this.assertEquals(1, aTest[1]);
				})
			]
		),
		new TestGroup('Iterator',
			[
				new SimpleTest('Iterator::forEach()', function() {
					var oIterator = new TestIterator();
					var iCount = 0;
					var bCorrect = true;
					oIterator.forEach(function(iValue) {
						iCount++;
						bCorrect = bCorrect && iValue == iCount;
					});
					this.assertEquals(3, iCount);
					this.assertEquals(true, bCorrect);
				}),
				
				new SimpleTest('Iterator::forEach() after next()', function() {
					var oIterator = new TestIterator();
					var iCount = 0;
					var bCorrect = true;
					oIterator.next();
					oIterator.forEach(function(iValue) {
						iCount++;
						bCorrect = bCorrect && iValue == iCount + 1;
					});
					this.assertEquals(2, iCount);
					this.assertEquals(true, bCorrect);
				}),
				
				new SimpleTest('Iterator::getArray()', function() {
					var oIterator = new TestIterator();
					var aTest = oIterator.getArray();
					this.assertEquals(3, aTest.length);
					this.assertEquals(1, aTest[0]);
					this.assertEquals(2, aTest[1]);
					this.assertEquals(3, aTest[2]);
				}),
				
				new SimpleTest('Iterator::getArray() after next()', function() {
					var oIterator = new TestIterator();
					oIterator.next();
					var aTest = oIterator.getArray();
					this.assertEquals(2, aTest.length);
					this.assertEquals(2, aTest[0]);
					this.assertEquals(3, aTest[1]);
				})
			]
		)
	]);
	
	
	
	
	// exports
	this.mvcSuite = oMVCSuite;

});
