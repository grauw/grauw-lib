gl.module(
	'unit',
	[
		'../src/unit.js',
		'../src/selector.js'
	],
	function() {
	
	// imports
	var Test = gl.unit.Test;
	var TestSuite = gl.unit.TestSuite;
	var Parser = gl.selector.Parser;
	var SimpleTest = gl.unit.SimpleTest;
	
	
	
	
	var SelectorTest = function(sSelector, aMatches) {
		this.selector = sSelector;
		this.matches = aMatches;
	};
	gl.extend(Test, SelectorTest);
	
	SelectorTest.prototype.toString = function() {
		return 'Test selector “' + this.selector + '”';
	};
	
	SelectorTest.prototype.test = function() {
		this.parseTest();
		this.matchTest();
		this.queryTest();
	};
	
	SelectorTest.prototype.parseTest = function() {
		new Parser().parse(this.selector);
	};
	
	SelectorTest.prototype.matchTest = function() {
		for (var i = 0; i < this.matches.length; i++) {
			var oNode = document.getElementById(this.matches[i]);
			var bMatch = gl.selector.match(oNode, this.selector);
			this.assert(bMatch, 'Node with ID ' + this.matches[i] + ' should match.');
		}
	};
	
	SelectorTest.prototype.queryTest = function() {
		var aResult = gl.selector.queryAll(document, this.selector);
		this.assertEquals(this.matches.length, aResult.length, 'Result length should match expected length.');
		for (var i = 0; i < this.matches.length || i < aResult.length; i++) {
			var sExpected = i < this.matches.length ? this.matches[i] : 'undefined';
			var sResult = aResult[i] ? aResult[i].getAttribute('id') : 'undefined';
			this.assertEquals(sExpected, sResult, 'Result node ID should match expected ID.');
		}
	};
	
	
	
	
	/**
	 * Unit tests
	 */
	var SelectorSuite = function() {
		TestSuite.call(this);
	};
	this.SelectorSuite = gl.extend(TestSuite, SelectorSuite);
	
	/**
	 * Unit tests
	 */
	SelectorSuite.prototype.getTests = function() {
		return [
			new SelectorTest('*[lang]', ['t0', 't7', 't8']),				// universal selector test
			new SelectorTest('li', ['t1', 't2', 't3', 't4', 't5', 't6']),	// type selector test
			new SelectorTest('.test1', ['t7']),								// class selector tests
			new SelectorTest('.test2', ['t7']),
			new SelectorTest('.test3', ['t7']),
			new SelectorTest('.test4', []),
			new SelectorTest('#t7', ['t7']),								// id selector tests
			new SelectorTest('ul#t7', ['t7']),
			new SelectorTest('ul#t7 li', ['t1', 't2', 't3', 't4', 't5']),	// descendant combinator test
			new SelectorTest('#t13 *', []),									// IE quirk test (comment nodes treated as elements)
			new SelectorTest('ul#t7 > li', ['t1', 't2', 't3', 't4', 't5']),	// child combinator tests
			new SelectorTest('body > li', []),
			new SelectorTest('#t13 > *', []),								// IE quirk test (comment nodes treated as elements)
			new SelectorTest('span:empty', ['t10', 't13']),				// :empty test
			new SelectorTest('ul[lang=en-GB]', ['t7']),					// attribute exists / equals tests
			new SelectorTest('form[class]', ['t20']),
			new SelectorTest('input[class]', []),
			new SelectorTest('input[readonly]', ['t24']),				// IE quirk test (readOnly)
			new SelectorTest('input[readonly="readonly"]', ['t24']),	// IE quirk test (readOnly=true)
			new SelectorTest('input[type]', ['t24']),
			new SelectorTest('input[type="text"]', []),					// default value test
			new SelectorTest('label[for="t27"]', ['t28']),				// IE quirk test (htmlFor)
			new SelectorTest('form[className]', []),					// IE quirk test (class)
			new SelectorTest('form[enctype]', ['t20']),					// IE quirk test (encType)
			new SelectorTest('form[enctype="text/plain"]', ['t20']),
			new SelectorTest('form[enctype="application/x-www-form-urlencoded"]', []),	// default value test
			new SelectorTest('form[action]', ['t20']),
			new SelectorTest('form[action=""]', ['t20']),				// empty attribute equals test
			new SelectorTest('form[method="GET"]', []),
			new SelectorTest('option[value="abc"]', []),
			new SelectorTest('option[value="xyz"]', ['t23']),
			new SelectorTest('button[value="xyz"]', ['t25']),
			new SelectorTest('ul[class~="test1"]', ['t7']),				// attribute list selector tests
			new SelectorTest('ul[class~="test2"]', ['t7']),
			new SelectorTest('ul[class~="test3"]', ['t7']),
			new SelectorTest('ul[class~="test4"]', []),
			new SelectorTest('ul[class~="test1 test2"]', []),
			new SelectorTest('ul[class~=" "]', []),
			new SelectorTest('ul[class~=""]', []),						// empty attribute selector test
			new SelectorTest('ul[lang|=en]', ['t7']),					// language attribute selector tests
			new SelectorTest('ul[lang|=en-GB]', ['t7']),
			new SelectorTest('ul[lang|=en-US]', []),
			new SelectorTest('ul[lang|=e]', []),
			new SelectorTest('ul[lang|=""]', []),						// empty attribute selector tests
			new SelectorTest('ul[lang*=""]', []),
			new SelectorTest('ul[lang^=""]', []),
			new SelectorTest('ul[lang$=""]', []),
			new SelectorTest('ul:lang(en)', ['t7']),					// :lang tests
			new SelectorTest('ul:lang(en-GB)', ['t7']),
			new SelectorTest('ul:lang(EN-gb)', ['t7']),
			new SelectorTest('ul:lang(en-US)', []),
			new SelectorTest('ul:lang(e)', []),
			new SelectorTest('li:lang(en-GB)', ['t1', 't2', 't3', 't4', 't5']),
			new SelectorTest('ul:not(li)', ['t7', 't8']),				// :not tests
			new SelectorTest('ul:not(ul)', []),
			new SelectorTest('ul:not(.test1)', ['t8']),					// :not parsing tests
			new SelectorTest('span:not(:empty)', ['t11', 't12', 't14']),
			new SelectorTest('ul:not(:lang(en))', ['t8']),
			new SelectorTest('ul.test1 li:not(#t2):not([id=t4])', ['t1', 't3', 't5']),
			new SimpleTest('Test querying on copies', function() {
				// When nodes are cloned with innerHTML in IE, the __queryResult ‘expando property’
				// is converted to string, and thus "false" evaluates to true instead of false.
				var oFirstDiv = document.getElementById('t30');
				var oSecondDiv = document.getElementById('t31');
				
				var oResult1 = gl.selector.query(oFirstDiv, 'em');
				this.assert(oResult1, 'Should find match.');
				var oResult2 = gl.selector.query(oFirstDiv, 'em');
				this.assert(oResult2, 'Should find match.');
				
				// copy with cloneNode
				var oNode = oFirstDiv.firstChild;
				while (oNode) {
					oSecondDiv.appendChild(oNode.cloneNode(true));
					oNode = oNode.nextSibling;
				}
				var oResult3 = gl.selector.query(oSecondDiv, 'em');
				this.assert(oResult3, 'Should find match in nodes copied with cloneNode.');
				var oResult4 = gl.selector.query(oSecondDiv, 'em');
				this.assert(oResult4, 'Should find match in nodes copied with cloneNode.');
				
				// copy with innerHTML
				oSecondDiv.innerHTML = oFirstDiv.innerHTML;
				var oResult5 = gl.selector.query(oSecondDiv, 'em');
				this.assert(oResult5, 'Should find match in nodes copied with innerHTML.');
				var oResult6 = gl.selector.query(oSecondDiv, 'em');
				this.assert(oResult6, 'Should find match in nodes copied with innerHTML.');
			})
		];
	};
	
	// TODO: Selectors that should result in parsing errors
	SelectorSuite.prototype.parsingTests = [
	       	'ul:not(.test1.test2)'
		];
	
	
	
	
	// exports
	this.SelectorTest = SelectorTest;
	this.SelectorSuite = SelectorSuite;
	
});
