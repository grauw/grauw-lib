/**
 * @fileOverview
 * 
 * Fast JavaScript parser.
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
gl.module('gl.jsparser', [], function() {
	
	var slice = Array.prototype.slice;
	
	
	
	
	var Symbol = function() {
		throw new Error('Can not instantiate.');
	};
	
	/**
	 * 
	 * @param {String} sInput
	 *     The input string.
	 * @param {Number} iPos
	 *     The position within the input string of the first character to match.
	 * @returns {Number}
	 *     The position of the first character after the match, or 0 if no match.
	 */
	Symbol.prototype.match = function() {
		throw new Error('Must implement match().');
	};
	
	Symbol.prototype.toString = function() {
		return 'Symbol';
	};
	
	
	
	
	/**
	 * A production rule.
	 * A rule consists of one or more choices of symbols or symbol sequences.
	 * Each argument represents a choice. To encode a sequence, use Seq.
	 */
	var Production = function() {
		this.choices = [];
	};
	
	gl.extend(Symbol, Production);
	
	Production.prototype.add = function() {
		var aSymbols = [];
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] == 'string') {
				aSymbols.push(new S(arguments[i]));
			} else if (arguments[i] instanceof RegExp) {
				aSymbols.push(new RE(arguments[i]));
			} else {
				aSymbols.push(arguments[i]);
			}
		}
		if (aSymbols.length > 1) {
			this.choices.push(new Seq(aSymbols));
		} else {
			this.choices.push(aSymbols[0]);
		}
	};
	
	Production.prototype.match = function(sInput, iPos) {
		var iMatch = 0;
		for (var i = 0, len = this.choices.length; i < len && !iMatch; i++) {
			iMatch = this.choices[i].match(sInput, iPos);
		}
		return iMatch;
	};
	
	Production.prototype.toString = function() {
		return "Production";
	};
	
	
	
	
	var Seq = function(aSymbols) {
		this.symbols = aSymbols;
	};
	
	gl.extend(Symbol, Seq);
	
	Seq.prototype.match = function(sInput, iPos) {
		// XXX possible optimisations:
		// - alias this.symbols?
		var iMatch = iPos;
		for (var i = 0, len = this.symbols.length; i < len && iMatch; i++) {
			iMatch = this.symbols[i].match(sInput, iMatch);
		}
		return iMatch;
	};
	
	Seq.prototype.toString = function() {
		return "Seq";
	};
	
	
	
	
	var S = function(sString) {
		this.string = sString;
	};
	
	gl.extend(Symbol, S);
	
	S.prototype.match = function(sInput, iPos) {
		// XXX possible optimisations:
		// - see if using charAt() or indexOf() is faster
		// - maybe a tokeniser can help?
		// - store length as property
		if (sInput.substr(iPos, this.string.length) == this.string)
			return iPos + this.string.length;
		return 0;
	};
	
	S.prototype.toString = function() {
		return 'S "' + this.string + '"';
	};
	
	
	
	
	var RE = function(oSymbol) {
		if (!oSymbol.global)
			throw new Error('The regexp must be global.');
		this.regexp = oSymbol;
	};
	
	gl.extend(Symbol, RE);
	
	RE.prototype.match = function(sInput, iPos) {
		this.regexp.lastIndex = iPos;
		var aMatch = this.regexp.exec(sInput);
		if (aMatch && sInput.substr(iPos, aMatch[0].length) == aMatch[0])
			return this.regexp.lastIndex;
		return 0;
	};
	
	RE.prototype.toString = function() {
		return "RE " + this.regexp;
	};
	
	
	
	
	var Optional = function(oSymbol) {
		this.symbol = oSymbol;
	};
	
	gl.extend(Symbol, Optional);
	
	Optional.prototype.match = function(sInput, iPos) {
		return this.symbol.match(sInput, iPos) || iPos;
	};
	
	Optional.prototype.toString = function() {
		return "Optional " + this.symbol;
	};
	
	
	
	
	/**
	 * If the phrase “[lookahead ∉ set]” appears in the right-hand side of a
	 * production, it indicates that the production may not be used if the
	 * immediately following input token is a member of the given set.
	 */
	var LookAhead = function(aSymbols) {
		this.symbols = aSymbols;
	};

	gl.extend(Symbol, LookAhead);
	
	LookAhead.prototype.match = function(sInput, iPos) {
		var iMatch = 0;
		for (var i = 0, len = this.symbols.length; i < len && !iMatch; i++) {
			iMatch = this.symbols.match(sInput, iPos);
		}
		return iMatch ? 0 : iPos;
	};
	
	LookAhead.prototype.toString = function() {
		return "LookAhead";
	};
	
	
	

	var Parser = function() {
		
		//
		// Initialise the ECMAScript 5 grammar.
		//
		
		var oIdentifier = new Production();
		var oExpression = new Production();
		var oExpressionNoIn = new Production();
		var oAssignmentExpression = new Production();
		var oAssignmentExpressionNoIn = new Production();
		var oLeftHandSideExpression = new Production();
		
		// A.4 Statements
		
		var oStatement = new Production();
		var oBlock = new Production();
		var oStatementList = new Production();
		var oVariableStatement = new Production();
		var oVariableDeclarationList = new Production();
		var oVariableDeclarationListNoIn = new Production();
		var oVariableDeclaration = new Production();
		var oVariableDeclarationNoIn = new Production();
		var oInitialiser = new Production();
		var oInitialiserNoIn = new Production();
		var oEmptyStatement = new Production();
		var oExpressionStatement = new Production();
		var oIfStatement = new Production();
		var oIterationStatement = new Production();
		var oContinueStatement = new Production();
		var oBreakStatement = new Production();
		var oReturnStatement = new Production();
		var oWithStatement = new Production();
		var oSwitchStatement = new Production();
		var oCaseBlock = new Production();
		var oCaseClauses = new Production();
		var oCaseClause = new Production();
		var oDefaultClause = new Production();
		var oLabelledStatement = new Production();
		var oThrowStatement = new Production();
		var oTryStatement = new Production();
		var oCatch = new Production();
		var oFinally = new Production();
		var oDebuggerStatement = new Production();
		
		oStatement.toString = function() { return "Statement"; };
		oBlock.toString = function() { return "Block"; };
		
		oStatement.add(oBlock);
		oStatement.add(oVariableStatement);
		oStatement.add(oEmptyStatement);
		oStatement.add(oExpressionStatement);
		oStatement.add(oIfStatement);
		oStatement.add(oIterationStatement);
		oStatement.add(oContinueStatement);
		oStatement.add(oBreakStatement);
		oStatement.add(oReturnStatement);
		oStatement.add(oWithStatement);
		oStatement.add(oLabelledStatement);
		oStatement.add(oSwitchStatement);
		oStatement.add(oThrowStatement);
		oStatement.add(oTryStatement);
		oStatement.add(oDebuggerStatement);
		
		oBlock.add("{", new Optional(oStatementList), "}");
		
		oStatementList.add(oStatement);
//		oStatementList.add(oStatementList, oStatement);
		
		oVariableStatement.add("var", oVariableDeclarationList, ";");
		
		oVariableDeclarationList.add(oVariableDeclaration);
		oVariableDeclarationList.add(oVariableDeclarationList, oVariableDeclaration);
		
		oVariableDeclarationListNoIn.add(oVariableDeclarationNoIn);
		oVariableDeclarationListNoIn.add(oVariableDeclarationListNoIn, oVariableDeclarationNoIn);
		
		oVariableDeclaration.add(oIdentifier, new Optional(oInitialiser));
		
		oVariableDeclarationNoIn.add(oIdentifier, new Optional(oInitialiserNoIn));
		
		oInitialiser.add("=", oAssignmentExpression);
		
		oInitialiserNoIn.add("=", oAssignmentExpressionNoIn);
		
		oEmptyStatement.add(";");
		
		oExpressionStatement.add(new LookAhead(new S("{"), new S("function")), oExpression, ";");
		
		oIfStatement.add("if", "(", oExpression, ")", oStatement, "else", oStatement);
		oIfStatement.add("if", "(", oExpression, ")", oStatement);
		
		oIterationStatement.add("do", oStatement, "while (", oExpression, ");");
		oIterationStatement.add("while", "(", oExpression, ")", oStatement);
		oIterationStatement.add("for", "(", new Optional(oExpressionNoIn), ";",
				new Optional(oExpression), ";", new Optional(oExpression), ")", oStatement);
		oIterationStatement.add("for", "(", "var", new Optional(oVariableDeclarationListNoIn), ";",
				new Optional(oExpression), ";", new Optional(oExpression), ")", oStatement);
		oIterationStatement.add("for", "(", oLeftHandSideExpression, "in", oExpression, ")", oStatement);
		oIterationStatement.add("for", "(", "var", oVariableDeclarationNoIn, "in", oExpression, ")", oStatement);
		
		// XXX: using new LookAhead for [no LineTerminator here]
		oContinueStatement.add("continue", new LookAhead(new S("\n")), new Optional(oIdentifier));
		
		// XXX: using new LookAhead for [no LineTerminator here]
		oBreakStatement.add("break", new LookAhead(new S("\n")), new Optional(oIdentifier));
		
		// XXX: using new LookAhead for [no LineTerminator here]
		oReturnStatement.add("return", new LookAhead(new S("\n")), new Optional(oExpression));
		
		oWithStatement.add("with", "(", oExpression, ")", oStatement);
		
		oSwitchStatement.add("switch", "(", oExpression, ")", oCaseBlock);
		
		oCaseBlock.add("{", new Optional(oCaseClauses), "}");
		oCaseBlock.add("{", new Optional(oCaseClauses), oDefaultClause, new Optional(oCaseClauses), "}");

		oCaseClauses.add(oCaseClause);
		oCaseClauses.add(oCaseClauses, oCaseClause);

		oCaseClause.add("case", oExpression, ":", new Optional(oStatementList));

		oDefaultClause.add("default", ":", new Optional(oStatementList));

		oLabelledStatement.add(oIdentifier, ":", oStatement);

		// XXX: using new LookAhead for [no LineTerminator here]
		oThrowStatement.add("throw", new LookAhead(new S("\n")), oExpression, ";");
		
		oTryStatement.add("try", oBlock, oCatch);
		oTryStatement.add("try", oBlock, oFinally);
		oTryStatement.add("try", oBlock, oCatch, oFinally);
		
		oCatch.add("catch", "(", oIdentifier, ")", oBlock);
		
		oFinally.add("finally", oBlock);
		
		oDebuggerStatement.add("debugger", ";");
		
		
		
		
		// A.5 Functions and Programs
		// XXX: incomplete
		
		var oProgram = new Production();
		var oSourceElements = new Production();
		var oSourceElement = new Production();
		
		oProgram.add(new Optional(oSourceElements));
		
		oSourceElements.add(oSourceElement);
//		oSourceElements.add(oSourceElements, oSourceElement);
		
		oSourceElement.add(oStatement);
//		oSourceElement.add(oFunctionDeclaration);
		
		this.program = oProgram;
	};
	
	Parser.prototype.test = function(sProgram) {
		return !!this.program.match("~" + sProgram, 1);	// the "~" + ..., 1 bit is a hack
	};
	
	
	
	
	var Lexer = function() {
		this.WhiteSpace = /[ \t\x0B\f\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF]/g;
		this.LineTerminator = /[\n\r\u2028\u2029]/g;
		this.Comment = /\/\*[\s\S]*?\*\/|\/\/.*/g;
		{
			{
				var sUnicodeLetter = 'a-zA-Z'; // simplification, does not include the full range
				var sUnicodeCombiningMark = ''; // TODO
				var sUnicodeDigit = '\\d'; // simplification, does not include the full range
				var sUnicodeConnectorPunctuation = ''; // TODO
				var sIdentifierStart = '[' + sUnicodeLetter + '$_]|\\\\u[0-9a-fA-F]{4}';
				var sIdentifierPart = '[' + sUnicodeLetter + sUnicodeDigit + '$_\\u200C\\u200D' +
						sUnicodeCombiningMark + sUnicodeConnectorPunctuation + ']+|\\\\u[0-9a-fA-F]{4}';
			}
			// simplification, does not exclude and reserved words
			this.IdentifierName = new RegExp('(?:' + sIdentifierStart + ')(?:' + sIdentifierPart + ')*', 'g');
			this.Punctuator = /[{}()\[\].;,~?:]|\+\+|--|&&|\|\||(?:[=!+\-*%&|^]|<<|>>|>>>|[<>]|==|!=)=?/g;
			// TODO: Note: The source character immediately following a NumericLiteral must not be an IdentifierStart or DecimalDigit.
			this.NumericLiteral = /(?:(?:0(?!\d)|[1-9][0-9]*)(?:\.[0-9]+)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?|0[xX][0-9a-fA-F]+/g;
			var oStringLiteralDouble = /"(?:[^\\"]+|\\(?:0(?!\d)|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|\r\n|[^0-9xu]))*"/g;
			var oStringLiteralSingle = /'(?:[^\\']+|\\(?:0(?!\d)|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|\r\n|[^0-9xu]))*'/g;
			this.StringLiteral = new RegExp(oStringLiteralDouble.source + '|' + oStringLiteralSingle.source, 'g');
		}
		this.Token = new RegExp(
				this.IdentifierName.source + '|' +
				this.NumericLiteral.source + '|' + // swapped with Punctuator to match .1-style numbers...
				this.Punctuator.source + '|' +
				this.StringLiteral.source, 'g');
		
		this.DivPunctuator = /\/=?/g;
		
		this.InputElementDiv = new RegExp(
				this.WhiteSpace.source + '|' +
				this.LineTerminator.source + '|' +
				this.Comment.source + "|" +
				this.Token.source + '|' +
				this.DivPunctuator.source, 'g');
		
		this.Keyword = /break|do|instanceof|typeof|case|else|new|var|catch|finally|return|void|continue|for|switch|while|debugger|function|this|with|default|if|throw|delete|in|try/g;
		this.FutureReservedWord = /class|enum|extends|super|const|export|import/g;
		this.NullLiteral = /null/g;
		this.BooleanLiteral = /true|false/g;
		this.ReservedWord = new RegExp(
				this.Keyword.source + '|' +
				this.FutureReservedWord.source + '|' +
				this.NullLiteral.source + '|' +
				this.BooleanLiteral.source, 'g');
		this.Identifier = new RegExp('(?!' + this.ReservedWord.source + ')', 'g');
	};
	
	Lexer.prototype.split = function(sInput) {
		var sTokens = sInput.match(this.InputElementDiv) || [];
		if (sTokens.join('') != sInput)
			throw new Error('Parsing failed.');
		return sTokens;
	};
	
	
	
	
	// exports
	this.Symbol = Symbol;
	this.Production = Production;
	this.Seq = Seq;
	this.S = S;
	this.RE = RE;
	this.Optional = Optional;
	this.LookAhead = LookAhead;
	this.Parser = Parser;
	this.Lexer = Lexer;
	
});
