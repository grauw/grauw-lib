/**
 * @fileOverview
 * 
 * Functions to support a MVC architecture.
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
gl.module('gl.mvc', [], function() {
	
	/**
	 * 
	 */
	var Model = function() {
		this.observers = [];
	};
	
	Model.prototype.addObserver = function(oObserver) {
		this.observers.push(oObserver);
	};
	
	Model.prototype.removeObserver = function(oObserver) {
		for (var i = 0, len = this.observers.length; i < len; i++) {
			if (this.observers[i] == oObserver) {
				this.observers.splice(i, 1);
				return;
			}
		}
	};
	
	Model.prototype.hasObserver = function(oObserver) {
		for (var i = 0, len = this.observers.length; i < len; i++) {
			if (this.observers[i] == oObserver)
				return true;
		}
		return false;
	};
	
	Model.prototype.notifyObservers = function(sContext) {
		for (var i = 0, len = this.observers.length; i < len; i++) {
			this.observers[i].update(sContext, this);
		}
	};
	
	
	
	
	/**
	 * 
	 */
	var View = function(oModel) {
		this.model = oModel;
		this.html = null;
	};
	
	View.prototype.createHTML = function(oDocument) {
		throw new Error('Must implement createHTML().');
	};
	
	View.prototype.getHTML = function(oDocument) {
		if (!this.html) {
			this.html = this.createHTML(oDocument);
			if (this.model instanceof Model)
				this.model.addObserver(this);
		}
		return this.html;
	};
	
	View.prototype.update = function(sContext, oSource) {
		if (!this.html)
			throw new Error('View not created yet.');
		var oHTML = this.createHTML(this.html.ownerDocument);
		if (this.html.parentNode) {
			this.html.parentNode.replaceChild(oHTML, this.html);
		}
		this.html = oHTML;
	};
	
	View.prototype.clear = function() {
		if (this.model instanceof Model)
			this.model.removeObserver(this);
		if (this.html && this.html.parentNode)
			this.html.parentNode.removeChild(this.html);
		this.html = null;
	};
	
	View.prototype.addEventListenerTo = function(oElement, sEvent, fListener) {
		var oThis = this;
		function fWrapper(oEvent) {
			fListener.call(oThis, oEvent || event);
		} 
		if (oElement.addEventListener) {
			oElement.addEventListener(sEvent, fWrapper, false);
		} else {
			oElement.attachEvent('on' + sEvent, fWrapper);
		}
	};
	
	
	
	
	var Iterator = function() {
		throw new Error('Must implement constructor.');
	};
	
	Iterator.prototype.next = function() {
		throw new Error('Must implement next().');
	};
	
	Iterator.prototype.peek = function() {
		throw new Error('Must implement peek().');
	};
	
	Iterator.prototype.hasNext = function() {
		throw new Error('Must implement hasNext().');
	};
	
	Iterator.prototype.forEach = function(fCallback, oContext) {
		while (this.hasNext()) {
			fCallback.call(oContext || this, this.next());
		}
	};
	
	Iterator.prototype.getArray = function() {
		var aCopy = [];
		while (this.hasNext())
			aCopy.push(this.next());
		return aCopy;
	};
	
	
	
	
	var ArrayIterator = function(oArray) {
		this.array = oArray;
		this.index = 0;
	};
	
	gl.extend(Iterator, ArrayIterator);
	
	ArrayIterator.prototype.next = function() {
		return this.array[this.index++];
	};
	
	ArrayIterator.prototype.peek = function() {
		return this.array[this.index];
	};
	
	ArrayIterator.prototype.hasNext = function() {
		return this.index < this.array.length;
	};
	
	ArrayIterator.prototype.getArray = function() {
		return this.array.slice(this.index);
	};
	
	
	
	
	// exports
	this.Model = Model;
	this.View = View;
	this.Iterator = Iterator;
	this.ArrayIterator = ArrayIterator;
	
});
