gl.module(
	'unit',
	[
		'../src/unit.js',
		'../src/selector.js'
	],
	function() {
	
	// imports
	var Test = gl.require(gl.unit.Test);
	var TestSuite = gl.require(gl.unit.TestSuite);
	var TestGroup = gl.require(gl.unit.TestGroup);
	var SimpleTest = gl.require(gl.unit.SimpleTest);
	var Parser = gl.require(gl.selector.Parser);
	var NthSelector = gl.require(gl.selector.NthSelector);
	
	
	
	
	var SelectorTest = function(sSelector, aMatches) {
		Test.call(this);
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
	 * Test parsing of position (an+b, odd, even) in the nth-* selectors,
	 * which should result in integer values a and b corresponding to an+b.
	 * @param sNth The nth-* selector position
	 * @param iA The expected a value
	 * @param iB The expected b value
	 */
	var NthTest = function(sNth, iA, iB) {
		Test.call(this);
		this.nth = sNth;
		this.a = iA;
		this.b = iB;
	};
	gl.extend(Test, NthTest);

	NthTest.prototype.toString = function() {
		return 'Test parsing of nth-* position “' + this.nth + '”';
	};
	
	NthTest.prototype.test = function() {
		var oNth = new NthSelector(this.nth);
		this.assertEquals(this.a, oNth.a, 'Value a should be correct.');
		this.assertEquals(this.b, oNth.b, 'Value b should be correct.');
	};
	
	
	
	
	/**
	 * Unit tests
	 */
	var suite = new TestSuite([
			new TestGroup('Universal selector tests', [
				new SelectorTest('*[lang]', ['t0', 't7', 't8'])
			]),
			new TestGroup('Type selector tests', [
				new SelectorTest('li', ['t1', 't2', 't3', 't4', 't5', 't6'])
			]),
			new TestGroup('Class selector tests', [
				new SelectorTest('.test1', ['t7']),
				new SelectorTest('.test2', ['t7']),
				new SelectorTest('.test3', ['t7']),
				new SelectorTest('.test4', [])
			]),
			new TestGroup('ID selector tests', [
				new SelectorTest('#t7', ['t7']),
				new SelectorTest('ul#t7', ['t7']),
				new SelectorTest('ul#t7 li', ['t1', 't2', 't3', 't4', 't5']),	// descendant combinator test
				new SelectorTest('#t13 *', []),									// IE quirk test (comment nodes treated as elements)
				new SelectorTest('ul#t7 > li', ['t1', 't2', 't3', 't4', 't5']),	// child combinator tests
				new SelectorTest('body > li', []),
				new SelectorTest('#t13 > *', [])								// IE quirk test (comment nodes treated as elements)
			]),
			new TestGroup(':empty selector tests', [
				new SelectorTest('span:empty', ['t10', 't13'])
			]),
			new TestGroup('Attribute selector tests', [
				new SelectorTest('ul[lang=en-GB]', ['t7']),					// attribute exists / equals tests
				new SelectorTest('form[class]', ['t20']),
				new SelectorTest('input[class]', []),
				new SelectorTest('input[readonly]', ['t24']),				// IE quirk test (readOnly)
				new SelectorTest('input[readonly="readonly"]', ['t24']),	// IE quirk test (readOnly=true)
				new SelectorTest('input[type]', ['t24', 't29']),
				new SelectorTest('input[type="text"]', ['t29']),			// default value test
				new SelectorTest('input[class]', []),
				new SelectorTest('input[value="one"]', ['t29']),			// IE quirk test (defaultValue)
				new SelectorTest('input[value="two"]', []),
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
				new SelectorTest('ul[lang$=""]', [])
			]),
			new TestGroup(':lang() selector tests', [
				new SelectorTest('ul:lang(en)', ['t7']),					// :lang tests
				new SelectorTest('ul:lang(en-GB)', ['t7']),
				new SelectorTest('ul:lang(EN-gb)', ['t7']),
				new SelectorTest('ul:lang(en-US)', []),
				new SelectorTest('ul:lang(e)', []),
				new SelectorTest('li:lang(en-GB)', ['t1', 't2', 't3', 't4', 't5'])
			]),
			new TestGroup(':not() selector tests', [
				new SelectorTest('ul:not(li)', ['t7', 't8']),				// :not tests
				new SelectorTest('ul:not(ul)', []),
				new SelectorTest('ul:not(.test1)', ['t8']),					// :not parsing tests
				new SelectorTest('span:not(:empty)', ['t11', 't12', 't14']),
				new SelectorTest('ul:not(:lang(en))', ['t8']),
				new SelectorTest('ul.test1 li:not(#t2):not([id=t4])', ['t1', 't3', 't5'])
			]),
			new TestGroup('Nth-selector position parsing tests', [
				new NthTest('odd', 2, 1),
				new NthTest('even', 2, 0),
				new NthTest('2n+1', 2, 1),
				new NthTest('2n+0', 2, 0),
				new NthTest('4n+1', 4, 1),
				new NthTest('4n+2', 4, 2),
				new NthTest('4n+3', 4, 3),
				new NthTest('4n+4', 4, 4),
				new NthTest('10n-1', 10, -1),
				new NthTest('10n+9', 10, 9),
//				new NthTest('10n+-1', undefined, undefined),
				new NthTest('0n+5', 0, 5),
				new NthTest('5', 0, 5),
				new NthTest('1n+0', 1, 0),
				new NthTest('n+0', 1, 0),
				new NthTest('n', 1, 0),
				new NthTest('2n', 2, 0),
				new NthTest(' 3n + 1 ', 3, 1),
				new NthTest(' +3n - 2 ', 3, -2),
				new NthTest(' -n+ 6', -1, 6),
				new NthTest(' +6 ', 0, 6),
//				new NthTest('3 n', undefined, undefined),
//				new NthTest('+ 2n', undefined, undefined),
//				new NthTest('+ 2 ', undefined, undefined),
				new NthTest('-n+6', -1, 6)
			]),
			new TestGroup('Nth-selector tests', [
				new SelectorTest('tr:only-child', ['t40']),
				new SelectorTest('td:only-child', []),
				new SelectorTest('th:only-child', []),
				new SelectorTest('button:only-child', []),
				new SelectorTest('tr:first-child', ['t40']),
				new SelectorTest('td:first-child', ['t41']),
				new SelectorTest('th:first-child', []),
				new SelectorTest('tr:last-child', ['t40']),
				new SelectorTest('td:last-child', []),
				new SelectorTest('th:last-child', ['t48']),
				
				new SelectorTest('td:nth-child(2)', ['t42']),
				new SelectorTest('td:nth-child(3)', []),
				new SelectorTest('th:nth-last-child(6)', ['t43']),
				new SelectorTest('th:nth-last-child(5)', []),
				new SelectorTest('td:nth-child(odd)', ['t41', 't45', 't47']),
				new SelectorTest('td:nth-child(even)', ['t42', 't44', 't46']),
				new SelectorTest('td:nth-last-child(even)', ['t41', 't45', 't47']),
				new SelectorTest('td:nth-last-child(odd)', ['t42', 't44', 't46']),
				new SelectorTest('#t40 > *:nth-child(4n+1)', ['t41', 't45']),
				new SelectorTest('#t40 > *:nth-last-child(4n+1)', ['t44', 't48']),
				new SelectorTest('#t40 > *:nth-child(4n+0)', ['t44', 't48']),
				new SelectorTest('#t40 > *:nth-child(4n+4)', ['t44', 't48']),
				new SelectorTest('#t40 > *:nth-child(4n+3)', ['t43', 't47']),
				new SelectorTest('#t40 > *:nth-child(4n-1)', ['t43', 't47']),
				new SelectorTest('#t40 > *:nth-last-child(4n-1)', ['t42', 't46']),
				new SelectorTest('#t40 > *:nth-child(4n+5)', ['t45']),
				new SelectorTest('td:nth-child(1n+0)', ['t41', 't42', 't44', 't45', 't46', 't47']),
				new SelectorTest('td:nth-child(-1n+4)', ['t41', 't42', 't44']),
				new SelectorTest('td:nth-last-child(-1n+3)', ['t46', 't47']),
				
				new SelectorTest('tr:only-of-type', ['t40']),
				new SelectorTest('td:only-of-type', []),
				new SelectorTest('th:only-of-type', []),
				new SelectorTest('button:only-of-type', ['t25']),
				new SelectorTest('tr:first-of-type', ['t40']),
				new SelectorTest('td:first-of-type', ['t41']),
				new SelectorTest('th:first-of-type', ['t43']),
				new SelectorTest('tr:last-of-type', ['t40']),
				new SelectorTest('td:last-of-type', ['t47']),
				new SelectorTest('th:last-of-type', ['t48']),
				
				new SelectorTest('td:nth-of-type(3)', ['t44']),
				new SelectorTest('#t40 > *:nth-of-type(2)', ['t42', 't48']),
				new SelectorTest('td:nth-last-of-type(3)', ['t45']),
				new SelectorTest('#t40 > *:nth-last-of-type(2)', ['t43', 't46']),
				new SelectorTest('td:nth-of-type(3n+1)', ['t41', 't45']),
				new SelectorTest('td:nth-last-of-type(3n+1)', ['t44', 't47']),
				new SelectorTest('td:nth-of-type(3n-1)', ['t42', 't46']),
				new SelectorTest('td:nth-last-of-type(-1n+2)', ['t46', 't47']),
				
				new SelectorTest('td:nth-of-type(n+2):nth-last-of-type(n+2)', ['t42', 't44', 't45', 't46']),
				new SelectorTest('td:not(:first-of-type):not(:last-of-type)', ['t42', 't44', 't45', 't46'])
			]),
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
		]);
	
	// TODO: Selectors that should result in parsing errors
//	       	'ul:not(.test1.test2)'
	
	
	
	
	// exports
	window.suite = oSuite;
	
});
