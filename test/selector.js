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
 * See RFC 3986 appendix C
 */
SelectorUnit.prototype.tests = [
		['li', ['t1-1', 't1-2', 't1-3', 't1-4', 't1-5', 't1-6']],
		['span:empty', ['t2-1', 't2-4']],
		['ul[lang=en-GB]', ['t3-1']],
		['ul[class~="test1"]', ['t3-1']],
		['ul[class~="test2"]', ['t3-1']],
		['ul[class~="test3"]', []],
		['ul[class~="test1 test2"]', []],
		['ul[lang~=""]', []],
		['ul[lang|=en]', ['t3-1']],
		['ul[lang|=en-GB]', ['t3-1']],
		['ul[lang|=en-US]', []],
		['ul[lang|=e]', []],
		['ul[lang|=""]', []],
		['ul[lang*=""]', []],
		['ul[lang^=""]', []],
		['ul[lang$=""]', []],
		['ul:lang(en)', ['t3-1']],
		['ul:lang(en-GB)', ['t3-1']],
		['ul:lang(EN-gb)', ['t3-1']],
		['ul:lang(en-US)', []],
		['ul:lang(e)', []],
		['li:lang(en-GB)', ['t1-1', 't1-2', 't1-3', 't1-4', 't1-5']]
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
