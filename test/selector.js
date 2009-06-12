/**
 * Unit tests
 */
SelectorUnit = function() {
	gl.unit.JSUnit.call(this);
};
gl.Class.create(SelectorUnit, gl.unit.JSUnit);

/**
 * Unit tests
 */
SelectorUnit.prototype.tests = [
		['li', ['t1', 't2', 't3', 't4', 't5', 't6']],
		['span:empty', ['t10', 't13']],
		['ul[lang=en-GB]', ['t7']],
		['ul[class~="test1"]', ['t7']],
		['ul[class~="test2"]', ['t7']],
		['ul[class~="test3"]', []],
		['ul[class~="test1 test2"]', []],
		['ul[lang~=""]', []],
		['ul[lang|=en]', ['t7']],
		['ul[lang|=en-GB]', ['t7']],
		['ul[lang|=en-US]', []],
		['ul[lang|=e]', []],
		['ul[lang|=""]', []],
		['ul[lang*=""]', []],
		['ul[lang^=""]', []],
		['ul[lang$=""]', []],
		['ul:lang(en)', ['t7']],
		['ul:lang(en-GB)', ['t7']],
		['ul:lang(EN-gb)', ['t7']],
		['ul:lang(en-US)', []],
		['ul:lang(e)', []],
		['li:lang(en-GB)', ['t1', 't2', 't3', 't4', 't5']]
	];

/**
 * Main test function
 */
SelectorUnit.prototype.test = function() {
	this.performanceTest();
	this.unitTests();
};

/**
 * Unit tests
 * See RFC 3986 appendix C
 */
SelectorUnit.prototype.unitTests = function() {
	for (var i = 0; i < this.tests.length; i++) {
		var test = this.tests[i];
		this.writeln('Testing selector “' + test[0] + '”.');
		try {
			this.unitTestQuery(test[0], test[1]);
			this.unitTestMatch(test[0], test[1]);
		} catch(e) {
			this.writelnError('Error: ' + String(e));
			throw e;
		}
	}
};

SelectorUnit.prototype.unitTestQuery = function(sSelector, aExpected) {
	var aResult = gl.selector.queryAll(document, sSelector);
	this.assertEquals(aExpected.length, aResult.length, 'Result length should match expected length.');
	for (var i = 0; i < aExpected.length; i++) {
		this.assertEquals(aExpected[i], aResult[i].getAttribute('id'), 'Result node ID should match expected ID.');
	}
};

SelectorUnit.prototype.unitTestMatch = function(sSelector, aExpected) {
	if (!aExpected.length)
		return;
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
