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
	var objectToString = gl.require(gl.unit.objectToString);
	var Symbol = gl.require(gl.jsparser.Symbol);
	var Production = gl.require(gl.jsparser.Production);
	var Seq = gl.require(gl.jsparser.Seq);
	var S = gl.require(gl.jsparser.S);
	var RE = gl.require(gl.jsparser.RE);
	var Optional = gl.require(gl.jsparser.Optional);
	var LookAhead = gl.require(gl.jsparser.LookAhead);
	var Parser = gl.require(gl.jsparser.Parser);
	var Lexer = gl.require(gl.jsparser.Lexer);
	
	
	
	
	var oParser = new Parser();
	
	
	
	
	var LexerTest = function(sInput, aExpected) {
		Test.call(this);
		this.input = sInput;
		this.expected = aExpected;
	};
	gl.extend(Test, LexerTest);
	
	LexerTest.prototype.test = function() {
		var oLexer = new Lexer();
		var aOutput = oLexer.tokenize(this.input);
		for (var i = 0; i < this.expected.length && i < aOutput.length; i++) {
			this.assertEquals(this.expected[i], aOutput[i], "Output part " + i + " should match.");
		}
		var aOutput = oLexer.tokenize(" " + this.input + " ");
		for (var i = 0; i < this.expected.length && i < aOutput.length - 2; i++) {
			this.assertEquals(this.expected[i], aOutput[i + 1], "Context test: output part " + i + " should match.");
		}
	};
	
	LexerTest.prototype.toString = function() {
		return 'Lexing ' + objectToString(this.input);
	};
	
	
	
	
	var LexerErrorTest = function(sInput) {
		Test.call(this);
		this.input = sInput;
	};
	gl.extend(Test, LexerErrorTest);
	
	LexerErrorTest.prototype.test = function() {
		var oLexer = new Lexer();
		this.assertException(Error, function() {
			oLexer.split(this.input);
		});
	};
	
	LexerErrorTest.prototype.toString = function() {
		return 'Lexing ' + objectToString(this.input) + ', expecting error';
	};
	
	
	
	
	var MatchTest = function(sProgram) {
		Test.call(this);
		this.program = sProgram;
	};
	gl.extend(Test, MatchTest);
	
	MatchTest.prototype.test = function() {
		this.assert(oParser.test(this.program), 'Should match.');
	};
	
	MatchTest.prototype.toString = function() {
		return 'Matching ' + objectToString(this.program);
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
		return 'Matching ' + objectToString(this.program) + ', expecting no match';
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
		new TestGroup('Lexer class', [
			new SimpleTest('Lexer::constructor()', function() {
				var oLexer = new Lexer();
				this.assert(oLexer instanceof Lexer);
			}),
			
			new SimpleTest('Lexer::tokenize() empty program', function() {
				var oLexer = new Lexer();
				var aResult = oLexer.tokenize('');
				this.assert(aResult instanceof Array);
				this.assertEquals(0, aResult.length);
			}),
			
			new SimpleTest('Lexer::tokenize() simple program', function() {
				var oLexer = new Lexer();
				var aResult = oLexer.tokenize(' ');
				this.assert(aResult instanceof Array);
				this.assertEquals(1, aResult.length);
				this.assertEquals(' ', aResult[0]);
			}),
			
			new SimpleTest('Lexer::tokenize() slightly less simple program', function() {
				var oLexer = new Lexer();
				var aResult = oLexer.tokenize(' \n');
				this.assert(aResult instanceof Array);
				this.assertEquals(2, aResult.length);
				this.assertEquals(' ', aResult[0]);
				this.assertEquals('\n', aResult[1]);
			}),
			
			new SimpleTest('Lexer::processTokens()', function() {
				var oLexer = new Lexer();
				var bWhiteSpaceCalled = false;
				var bLineTerminatorCalled = false;
				var bCommentCalled = false;
				var bTokenCalled = false;
				var bDivPunctuatorCalled = false;
				oLexer.processTokens([' ', '\n', '//', 'x', '/'], {
					parseWhiteSpace: function(sToken) { bWhiteSpaceCalled = sToken == ' '; },
					parseLineTerminator: function(sToken) { bLineTerminatorCalled = sToken == '\n'; },
					parseComment: function(sToken) { bCommentCalled = sToken == '//'; },
					parseToken: function(sToken) { bTokenCalled = sToken == 'x'; },
					parseDivPunctuator: function(sToken) { bDivPunctuatorCalled = sToken == '/'; }
				});
				this.assertEquals(true, bWhiteSpaceCalled, 'parseWhiteSpace() should be called.');
				this.assertEquals(true, bLineTerminatorCalled, 'parseLineTerminator() should be called.');
				this.assertEquals(true, bCommentCalled, 'parseComment() should be called.');
				this.assertEquals(true, bTokenCalled, 'parseToken() should be called.');
				this.assertEquals(true, bDivPunctuatorCalled, 'parseDivPunctuator() should be called.');
			}),
			
			new SimpleTest('Lexer::processToken() IdentifierName', function() {
				var oLexer = new Lexer();
				var bIdentifierNameCalled = false;
				oLexer.processToken('x', {
					parseIdentifierName: function(sToken) { bIdentifierNameCalled = sToken == 'x'; }
				});
				this.assertEquals(true, bIdentifierNameCalled, 'parseIdentifierName() should be called.');
			}),
			
			new SimpleTest('Lexer::processToken() Punctuator', function() {
				var oLexer = new Lexer();
				var bPunctuatorCalled = false;
				oLexer.processToken('.', {
					parsePunctuator: function(sToken) { bPunctuatorCalled = sToken == '.'; }
				});
				this.assertEquals(true, bPunctuatorCalled, 'parsePunctuator() should be called.');
			}),
			
			new SimpleTest('Lexer::processToken() NumericLiteral', function() {
				var oLexer = new Lexer();
				var bNumericLiteralCalled = false;
				oLexer.processToken('0', {
					parseNumericLiteral: function(sToken) { bNumericLiteralCalled = sToken == '0'; }
				});
				this.assertEquals(true, bNumericLiteralCalled, 'parseNumericLiteral() should be called.');
			}),
			
			new SimpleTest('Lexer::processToken() StringLiteral', function() {
				var oLexer = new Lexer();
				var bStringLiteralCalled = false;
				oLexer.processToken('""', {
					parseStringLiteral: function(sToken) { bStringLiteralCalled = sToken == '""'; }
				});
				this.assertEquals(true, bStringLiteralCalled, 'parseStringLiteral() should be called.');
			})
		]),
		new TestGroup('Lexer tests', [
			// WhiteSpace tests
			new LexerTest(' ', [' ']),
			new LexerTest("  ", [" ", " "]),
			new LexerTest("\u0009\u000B\u000C\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003" +
					"\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF",
					["\u0009", "\u000B", "\u000C", "\u0020", "\u00A0", "\u1680", "\u180E", "\u2000",
					 "\u2001", "\u2002", "\u2003", "\u2004", "\u2005", "\u2006", "\u2007", "\u2008",
					 "\u2009", "\u200A", "\u202F", "\u205F", "\u3000", "\uFEFF"]),
			// LineTerminator tests
			new LexerTest("\n\r\r\n\n\u2028\u2029", ["\n", "\r", "\r", "\n", "\n", "\u2028", "\u2029"]),
			// Comment tests
			new LexerTest("//foo\n", ['//foo', '\n']),
			new LexerTest("//\n", ["//", "\n"]),
			new LexerTest("// foo \n", ["// foo ", "\n"]),
			new LexerTest("/**/", ["/**/"]),
			new LexerTest("/* foo */\n", ["/* foo */", "\n"]),
			new LexerTest("/* * */", ["/* * */"]),
			new LexerTest("/* **/*/", ["/* **/", "*", "/"]),
			new LexerTest("/* \n */", ["/* \n */"]),
			// Token tests
			new LexerTest("a", ["a"]),
			new LexerTest("foo", ["foo"]),
			new LexerTest("f00", ["f00"]),
			new LexerTest("class", ["class"]),
			new LexerTest("$1", ["$1"]),
			new LexerTest("_1$", ["_1$"]),
			new LexerTest("{}()[].;,<><=>===!====!==+-*%++--<<>>>>>&|^!~&&||?:=+=-=*=%=<<=>>=>>>=&=|=^=",
					'{', '}', '(', ')', '[', ']', '.', ';', ',', '<', '>', '<=', '>=', '==', '!=',
					'===', '!==', '+', '-', '*', '%', '++', '--', '<<', '>>', '>>>', '&', '|', '^',
					'!', '~', '&&', '||', '?', ':', '=', '+=', '-=', '*=', '%=', '<<=', '>>=', '>>>=',
					'&=', '|=', '^='),
			new LexerTest("0", ["0"]),
			new LexerTest("123", ["123"]),
			new LexerTest(".1", [".1"]),
			new LexerTest("0.1", ["0.1"]),
			new LexerTest("0.123", ["0.123"]),
			new LexerTest("123.123", ["123.123"]),
			new LexerTest("0.1e1", ["0.1e1"]),
			new LexerTest("0.1E1", ["0.1E1"]),
			new LexerTest("0.1e12", ["0.1e12"]),
			new LexerTest("0.1e+12", ["0.1e+12"]),
			new LexerTest("0.1e-1", ["0.1e-1"]),
			new LexerTest("2e10", ["2e10"]),
			new LexerTest(".2e10", [".2e10"]),
			new LexerTest("2.2e10", ["2.2e10"]),
			new LexerErrorTest("00"),
			new LexerErrorTest("0123"),
			new LexerTest("''", ["''"]),
			new LexerTest('""', ['""']),
			new LexerTest("'foo'", ["'foo'"]),
			new LexerTest("'\\0'", ["'\\0'"]),
			new LexerTest("'\\''", ["'\\''"]),
			new LexerTest('"\\""', ['"\\""']),
			new LexerErrorTest("'\\00'"),
			new LexerErrorTest("'\\'"),
			// DivPunctuator tests
			new LexerTest("/", ["/"]),
			new LexerTest("/=", ["/="])
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
