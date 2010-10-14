gl.module('unit',
	[
		'../src/unit.js',
		'../src/jsparser.js'
	],
	function() {
	
	// imports
	var Test = gl.require(gl.unit.Test);
	var SimpleTest = gl.require(gl.unit.SimpleTest);
	var TestSuite = gl.require(gl.unit.TestSuite);
	var TestGroup = gl.require(gl.unit.TestGroup);
	var Symbol = gl.require(gl.jsparser.Symbol);
	var Production = gl.require(gl.jsparser.Production);
	var Seq = gl.require(gl.jsparser.Seq);
	var S = gl.require(gl.jsparser.S);
	var RE = gl.require(gl.jsparser.RE);
	var Optional = gl.require(gl.jsparser.Optional);
	var LookAhead = gl.require(gl.jsparser.LookAhead);
	var Parser = gl.require(gl.jsparser.Parser);
	
	
	
	
	var oParser = new Parser();
	
	
	
	
	var MatchTest = function(sProgram) {
		Test.call(this);
		this.program = sProgram;
	};
	
	gl.extend(Test, MatchTest);
	
	MatchTest.prototype.test = function() {
		this.assert(oParser.test(this.program), 'Should match.');
	};
	
	MatchTest.prototype.toString = function() {
		return 'Matching "' + this.program + '"';
	};
	
	
	
	
	var NoMatchTest = function(sProgram) {
		Test.call(this);
		this.program = sProgram;
	};
	
	gl.extend(Test, NoMatchTest);
	
	NoMatchTest.prototype.test = function() {
		this.assert(!oParser.test(this.program), 'Should not match.');
	};
	
	NoMatchTest.prototype.toString = function() {
		return 'Not matching "' + this.program + '"';
	};
	
	
	
	
	/**
	 * Unit tests
	 */
	var oSuite = new TestSuite([
		new TestGroup('Production class', [
			new SimpleTest('Production::constructor()', function() {
				var oProduction = new Production();
				this.assert(oProduction instanceof Production);
				this.assert(oProduction instanceof Symbol);
			}),
			
			new SimpleTest('Production::add(string)', function() {
				var oProduction = new Production();
				oProduction.add("test");
			}),
			
			new SimpleTest('Production::add(Symbol)', function() {
				var oProduction = new Production();
				oProduction.add(new S("test"));
			}),
			
			new SimpleTest('Production::add(string) twice', function() {
				var oProduction = new Production();
				oProduction.add("test1");
				oProduction.add("test2");
			}),
			
			new SimpleTest('Production::add(Symbol, Symbol)', function() {
				var oProduction = new Production();
				oProduction.add(new S("test1"), new S("test2"));
			}),
			
			new SimpleTest('Production::match()', function() {
				var oProduction = new Production();
				this.assertEquals(0, oProduction.match("", 0));
			}),
			
			new SimpleTest('Production::match() after add(string)', function() {
				var oProduction = new Production();
				oProduction.add("test");
				this.assertEquals(4, oProduction.match("test", 0));
			}),
			
			new SimpleTest('Production::match() after add(Symbol)', function() {
				var oProduction = new Production();
				oProduction.add(new S("test"));
				this.assertEquals(4, oProduction.match("test", 0));
			}),
			
			new SimpleTest('Production::match() after add(string) twice', function() {
				var oProduction = new Production();
				oProduction.add("foo");
				oProduction.add("test");
				this.assertEquals(4, oProduction.match("test", 0));
			}),
			
			new SimpleTest('Production::match() after add(Symbol, Symbol)', function() {
				var oProduction = new Production();
				oProduction.add(new S("foo"), new S("bar"));
				this.assertEquals(6, oProduction.match("foobar", 0));
			}),
			
			new SimpleTest('Production::match() after add(Symbol) in context', function() {
				var oProduction = new Production();
				oProduction.add(new S("test"));
				this.assertEquals(6, oProduction.match("x-test-y", 2));
			}),
			
			new SimpleTest('Production::match() after add(Symbol) no match', function() {
				var oProduction = new Production();
				oProduction.add(new S("no-match"));
				this.assertEquals(0, oProduction.match("test", 0));
			})
		]),
		new TestGroup('Seq class', [
			new SimpleTest('Seq::constructor()', function() {
				var oSeq = new Seq([]);
				this.assert(oSeq instanceof Seq);
				this.assert(oSeq instanceof Symbol);
			}),
			
			new SimpleTest('Seq::match() empty', function() {
				var oSeq = new Seq([]);
				this.assertEquals(0, oSeq.match("x-test-y", 0));
			}),
			
			new SimpleTest('Seq::match() empty, in context', function() {
				var oSeq = new Seq([]);
				this.assertEquals(2, oSeq.match("x-test-y", 2));
			}),
			
			new SimpleTest('Seq::match() single', function() {
				var oSeq = new Seq([new S("test")]);
				this.assertEquals(0, oSeq.match("test", 0));
			}),
			
			new SimpleTest('Seq::match() multiple', function() {
				var oSeq = new Seq([new S("x-"), new S("test")]);
				this.assertEquals(6, oSeq.match("x-test-y", 0));
			}),
			
			new SimpleTest('Seq::match() multiple, in context', function() {
				var oSeq = new Seq([new S("-test"), new S("-")]);
				this.assertEquals(7, oSeq.match("x-test-y", 1));
			}),
			
			new SimpleTest('Seq::match() multiple, complete', function() {
				var oSeq = new Seq([new S("x-"), new S("test"), new S("-y")]);
				this.assertEquals(7, oSeq.match("x-test-y", 1));
			})
		]),
		new TestGroup('S class', [
			new SimpleTest('S::constructor()', function() {
				var oS = new S("test");
				this.assert(oS instanceof S);
				this.assert(oS instanceof Symbol);
			}),
			
			new SimpleTest('S::match()', function() {
				var oS = new S("test");
				this.assertEquals(4, oS.match("test", 0));
			}),
			
			new SimpleTest('S::match() in context', function() {
				var oS = new S("test");
				this.assertEquals(6, oS.match("x-test-y", 2));
			}),
			
			new SimpleTest('S::match() no match', function() {
				var oS = new S("test");
				this.assertEquals(0, oS.match("", 0));
			})
		]),
		new TestGroup('RE class', [
  			new SimpleTest('RE::constructor()', function() {
  				var oRE = new RE(/test/g);
  				this.assert(oRE instanceof RE);
  				this.assert(oRE instanceof Symbol);
  			}),
  			
  			new SimpleTest('RE::constructor() non-global', function() {
  				this.assertException(Error, function() {
  	  				new RE(/test/);
  				});
  			}),
  			
  			new SimpleTest('RE::constructor() missing argument', function() {
  				this.assertException(Error, function() {
  	  				new RE();
  				});
  			}),
  			
  			new SimpleTest('RE::match()', function() {
  				var oRE = new RE(/test/g);
  				this.assertEquals(4, oRE.match("test", 0));
  			}),
  			
  			new SimpleTest('RE::match() in context', function() {
  				var oRE = new RE(/test/g);
  				this.assertEquals(6, oRE.match("x-test-y", 2));
  			}),
  			
  			new SimpleTest('RE::match() no match', function() {
  				var oRE = new RE(/test/g);
  				this.assertEquals(0, oRE.match("", 0));
  			}),
  			
  			new SimpleTest('RE::match() no match in context', function() {
  				var oRE = new RE(/test/g);
  				this.assertEquals(0, oRE.match("x-test-y", 0));
  			})
  		]),
		new TestGroup('Optional class', [
			new SimpleTest('Optional::constructor()', function() {
				var oOptional = new Optional();
				this.assert(oOptional instanceof Optional);
				this.assert(oOptional instanceof Symbol);
			}),
			
			new SimpleTest('Optional::match()', function() {
				var oOptional = new Optional(new S("test"));
				this.assertEquals(4, oOptional.match("test", 0));
			}),
			
			new SimpleTest('Optional::match() in context', function() {
				var oOptional = new Optional(new S("test"));
				this.assertEquals(6, oOptional.match("x-test-y", 2));
			}),
			
			new SimpleTest('Optional::match() no match', function() {
				var oOptional = new Optional(new S("test"));
				this.assertEquals(2, oOptional.match("x-y", 2));
			}),
			
			new SimpleTest('Optional::match() problematic?', function() {
				var oOptional = new Optional(new S("test"));
				this.assertEquals(0, oOptional.match("", 0));
			})
		]),
		new TestGroup('LookAhead class', [
			new SimpleTest('LookAhead::constructor()', function() {
				var oLookAhead = new LookAhead();
				this.assert(oLookAhead instanceof LookAhead);
				this.assert(oLookAhead instanceof Symbol);
			}),
			
			new SimpleTest('LookAhead::match() problematic?', function() {
				var oLookAhead = new LookAhead(new S("test"));
				this.assertEquals(0, oLookAhead.match("test", 0));
			}),
			
			new SimpleTest('LookAhead::match() in context', function() {
				var oLookAhead = new LookAhead(new S("test"));
				this.assertEquals(2, oLookAhead.match("x-test-y", 2));
			}),
			
			new SimpleTest('LookAhead::match() not found', function() {
				var oLookAhead = new LookAhead(new S("test"));
				this.assertEquals(1, oLookAhead.match("x-y-z", 1));
			}),
			
			new SimpleTest('LookAhead::match() not found, problematic?', function() {
				var oLookAhead = new LookAhead(new S("test"));
				this.assertEquals(0, oLookAhead.match("x-y-z", 0));
			})
		]),
		new TestGroup('Parser class', [
			new SimpleTest('Parser::constructor()', function() {
				var oParser = new Parser();
				this.assert(oParser instanceof Parser);
			}),
			
			new SimpleTest('Parser::test() simple program', function() {
				var oParser = new Parser();
				this.assertEquals(true, oParser.test(";"));
			}),
			
			new SimpleTest('Parser::test() empty program', function() {
				var oParser = new Parser();
				this.assertEquals(true, oParser.test(""));
			}),
			
			new SimpleTest('Parser::test() illegal program', function() {
				var oParser = new Parser();
				this.assertEquals(false, oParser.test(")"));
			})
		]),
		new TestGroup('Matching tests', [
			// empty
			new MatchTest(""),
			
			// statements
			new MatchTest(";"),
			new MatchTest("{}"),
			new MatchTest("{{}}"),
			
			// illegal
			new NoMatchTest(")")
		])
	]);
	
	
	
	
	// exports
	window.suite = oSuite;

});
