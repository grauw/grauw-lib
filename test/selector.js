if (!window.gl)
	gl = {};

/**
 * Unit tests
 */
SelectorUnit = function() {
	gl.unit.JSUnit.call(this);
}
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
}

/**
 * Unit tests
 * See RFC 3986 appendix C
 */
SelectorUnit.prototype.unitTests = function() {
	for (var i = 0; i < this.tests.length; i++) {
		var test = this.tests[i];
		this.writeln('Querying "' + test[0] + '" on document.');
		try {
			var aResult = gl.selector.queryAll(document, test[0]);
			this.assertTrue(aResult instanceof Array, 'Result is array.');
			this.assertEquals(test[1].length, aResult.length, 'Result length mismatch.');
			for (var j = 0; j < aResult.length; j++) {
				this.assertEquals(test[1][j], aResult[j].getAttribute('id'), 'Result node ID mismatch.');
			}
		} catch(e) {
			this.writelnError('Error: ' + String(e));
		}
	}
}

/**
 * Performance tests
 */
SelectorUnit.prototype.performanceTest = function() {
}
