gl.require(
		{type: 'text/javascript', src: '../src/jsunit.js'},
		{type: 'text/javascript', src: '../src/selector.js'}
	);

/*
gl.module(
	'unit.selector',
//	{type: 'text/javascript', src: '../src/jsunit.js'},
//	{type: 'text/javascript', src: '../src/selector.js'},
	[
		'../src/jsunit.js',
		'../src/selector.js',
		
	],
	function() {
	}
);
*/



/**
 * Unit tests
 */
SelectorUnit = function() {
	gl.unit.JSUnit.call(this);
};
gl.extend(gl.unit.JSUnit, SelectorUnit);

/**
 * Unit tests
 */
SelectorUnit.prototype.tests = [
		['li', ['t1', 't2', 't3', 't4', 't5', 't6']],	// type selector test	
		['#t7', ['t7']],								// id selector tests
		['ul#t7', ['t7']],
		['ul#t7 li', ['t1', 't2', 't3', 't4', 't5']],	// descendant combinator test
		['ul#t7 > li', ['t1', 't2', 't3', 't4', 't5']],	// child combinator tests
		['body > li', []],
		['span:empty', ['t10', 't13']],				// :empty test
		['ul[lang=en-GB]', ['t7']],					// attribute exists / equals tests
		['form[class]', ['t20']],
		['input[class]', []],
		['input[readonly]', ['t24']],				// IE quirk test (readOnly)
		['input[readonly="readonly"]', ['t24']],	// IE quirk test (readOnly=true)
		['input[type]', ['t24']],
		['input[type="text"]', []],					// default value test
		['label[for="t27"]', ['t28']],				// IE quirk test (htmlFor)
		['form[className]', []],					// IE quirk test (class)
		['form[enctype]', ['t20']],					// IE quirk test (encType)
		['form[enctype="text/plain"]', ['t20']],
		['form[enctype="application/x-www-form-urlencoded"]', []],	// default value test
		['form[action]', ['t20']],
		['form[action=""]', ['t20']],				// empty attribute equals test
		['form[method="GET"]', []],
		['option[value="abc"]', []],
		['option[value="xyz"]', ['t23']],
		['button[value="xyz"]', ['t25']],
		['ul[class~="test1"]', ['t7']],				// attribute list selector tests
		['ul[class~="test2"]', ['t7']],
		['ul[class~="test3"]', []],
		['ul[class~="test1 test2"]', []],
		['ul[class~=" "]', []],
		['ul[class~=""]', []],						// empty attribute selector test
		['ul[lang|=en]', ['t7']],					// language attribute selector tests
		['ul[lang|=en-GB]', ['t7']],
		['ul[lang|=en-US]', []],
		['ul[lang|=e]', []],
		['ul[lang|=""]', []],						// empty attribute selector tests
		['ul[lang*=""]', []],
		['ul[lang^=""]', []],
		['ul[lang$=""]', []],
		['ul:lang(en)', ['t7']],					// :lang tests
		['ul:lang(en-GB)', ['t7']],
		['ul:lang(EN-gb)', ['t7']],
		['ul:lang(en-US)', []],
		['ul:lang(e)', []],
		['li:lang(en-GB)', ['t1', 't2', 't3', 't4', 't5']],
		['ul:not(li)', ['t7', 't8']],				// :not tests
		['ul:not(ul)', []],
		['ul:not(.test1)', ['t8']],					// :not parsing tests
		['span:not(:empty)', ['t11', 't12', 't14']],
		['ul:not(:lang(en))', ['t8']],
		['ul.test1 *:not(#t2):not([id=t4])', ['t1', 't3', 't5']]
	];

// Selectors that should result in parsing errors
SelectorUnit.prototype.parsingTests = [
       	'ul:not(.test1.test2)'
	];

/**
 * Main test function
 */
SelectorUnit.prototype.test = function() {
	this.apiTests();
	this.unitTests();
	this.performanceTest();
};

/**
 * Tests for the various objects
 */
SelectorUnit.prototype.apiTests = function() {
	this.parserTest();
};

SelectorUnit.prototype.parserTest = function() {
	this.writeln('Testing selector parsing.');
	var oParser = new gl.selector.Parser();
	var oCachingParser = new gl.selector.CachingParser();
	for (var i = 0; i < this.tests.length; i++) {
		try {
			oParser.parse(this.tests[i][0]);
			oCachingParser.parse(this.tests[i][0]);
		} catch(e) {
			if (e instanceof gl.selector.ParsingException)
				this.assert(false, 'Selector “' + this.tests[i][0] + '” should not cause a parse error.')
			else
				throw e;
		}
	}
};

/**
 * Unit tests
 */
SelectorUnit.prototype.unitTests = function() {
	this.writeln('Testing selector querying and matching.');
	for (var i = 0; i < this.tests.length; i++) {
		var test = this.tests[i];
		this.writeln('Testing selector “' + test[0] + '”.');
		try {
			this.unitTestQuery(test[0], test[1]);
			this.unitTestMatch(test[0], test[1]);
		} catch(e) {
			this.writelnError('Error: ' + String(e));
//			throw e;
		}
	}
};

SelectorUnit.prototype.unitTestQuery = function(sSelector, aExpected) {
	var aResult = gl.selector.queryAll(document, sSelector);
	this.assertEquals(aExpected.length, aResult.length, 'Result length should match expected length.');
	for (var i = 0; i < aExpected.length || i < aResult.length; i++) {
		var sExpected = i < aExpected.length ? aExpected[i] : 'undefined';
		var sResult = aResult[i] ? aResult[i].getAttribute('id') : 'undefined';
		this.assertEquals(sExpected, sResult, 'Result node ID should match expected ID.');
	}
};

SelectorUnit.prototype.unitTestMatch = function(sSelector, aExpected) {
	for (var i = 0; i < aExpected.length; i++) {
		var oNode = document.getElementById(aExpected[i]);
		var bMatch = gl.selector.match(oNode, sSelector);
		this.assertTrue(bMatch, 'Node with ID ' + aExpected[i] + ' should match.');
	}
};

/**
 * Performance tests
 */
SelectorUnit.prototype.performanceTest = function() {
};
