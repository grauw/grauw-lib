/**
 * @fileOverview
 * 
 * DOM 3 Events framework
 * 
 * Provides generic event classes, and a wrapper for IE HTML events.
 * 
 * See: http://www.w3.org/TR/DOM-Level-3-Events/
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
 */

/**
 * Some notes:
 * 
 * MSDN: “If you attach multiple functions to the same event on the same object,
 * the functions are called in random order, immediately after the object's
 * event handler is called.”
 * 
 * DOM 3: “Next, the implementation must determine the current target's
 * candidate event listeners. This shall be the list of all event listeners that
 * have been registered on the current target in their order of registration.
 * Once determined, the candidate event listeners cannot be changed; adding or
 * removing listeners does not affect the current target's candidate event
 * listeners.”
 */
gl.module('gl.events', [], function() {

	/**
	 * @param {Object} cBase
	 */
	function extend(cBase) {
		// create new prototype object that inherits from cBase
		var cPrototype = new Function;
		cPrototype.prototype = (cBase || Object).prototype;
		return new cPrototype;
	};
	
	/**
	 * DOM 3 Event object
	 * See: http://www.w3.org/TR/DOM-Level-3-Events/#interface-Event
	 */
	var Event = function() {
		this.type = null;
		this.namespaceURI = null;
		this.target = null;
		this.currentTarget = null;
		this.eventPhase = Event.CAPTURING_PHASE;
		this.bubbles = false;
		this.cancelable = false;
		this.defaultPrevented = false;
		this.timeStamp = new Date().getTime();
	};
	
	Event.prototype = extend(Object);
	
	Event.CAPTURING_PHASE = 1;
	Event.AT_TARGET       = 2;
	Event.BUBBLING_PHASE  = 3;
	
	Event.prototype.stopPropagation = function() {
	};
	
	Event.prototype.stopImmediatePropagation = function() {
	};
	
	Event.prototype.preventDefault = function() {
		this.defaultPrevented = true;
	};
	
	Event.prototype.initEvent = function(eventType, canBubble, cancelable) {
		this.initEventNS(null, eventType, canBubble, cancelable);
	};
	
	Event.prototype.initEventNS = function(namespaceURI, eventType, canBubble, cancelable) {
		this.namespaceURI = namespaceURI;
		this.type = eventType;
		this.bubbles = canBubble;
		this.cancelable = cancelable;
	};
	
	
	var PrefixStore = function() {
		this.store = {};
		this.currentId = 0;
	};
	
	PrefixStore.prototype = extend(Object);
	
	PrefixStore.prototype.getPrefix = function(sNamespaceURI) {
		if (this.store.hasOwnProperty(sNamespaceURI))
			return this.store[sNamespaceURI];
		else
			return this.store[sNamespaceURI] = '_ns' + this.currentId++ + '_';
	};
	
	var oPrefixStore = new PrefixStore();
	
	
	var IEEventTarget = function() {
		// interface
	};
	
	IEEventTarget.prototype = extend(EventTarget);
	
	IEEventTarget.prototype.addEventListener = function(type, listener, useCapture) {
		this.attachEvent(type, listener);
	};
	
	IEEventTarget.prototype.addEventListenerNS = function(namespaceURI, type, listener, useCapture) {
		var sType = namespaceURI ? oPrefixStore.getPrefix(namespaceURI) + type : type;
		this.addEventListener(sType, listener, useCapture);
	};
	
	IEEventTarget.prototype.removeEventListener = function(type, listener, useCapture) {
		this.detachEvent(type, listener);
	};
	
	IEEventTarget.prototype.removeEventListenerNS = function(namespaceURI, type, listener, useCapture) {
		var sType = namespaceURI ? oPrefixStore.getPrefix(namespaceURI) + type : type;
		this.addEventListener(sType, listener, useCapture);
	};
	
	IEEventTarget.prototype.dispatchEvent = function(oEvent) {
		var bCanceled = this.fireEvent(oEvent.type, { _gl_event: oEvent });
		return bCanceled ? oEvent.defaultPrevented : false;
	};
	
	
	
	var IEEventListenerWrapper = function(type, listener, useCapture) {
		this.type = null;
		this.listener = null;
		this.useCapture = useCapture;
	};
	
	IEEventListenerWrapper.prototype = extend(EventListener);
	
	IEEventListenerWrapper.prototype.handleEvent = function(oEvent) {
		// TODO: deal with exceptions
		var bCanceled = this.listener(oEvent);
		if (bCanceled == false)
			oEvent.preventDefault();
		if (oEvent.defaultPrevented)
			event.returnValue = false;
		if (oEvent._propagationStopped)
			event.cancelBubble = true;
	};
	
	function handler() {
		var oEvent = event._gl_event || (event._gl_event = createEventFromIEEvent(event));
		oEvent.currentTarget = this;
		// clone listener list (to avoid mutations per DOM 3)
		var aListeners = this._gl_eventlistener[oEvent.type].concat();
		for (var i = 0, len = aListeners.length; i < len; i++)
			if (aListeners[i].useCapture == oEvent.eventPhase)
				aListeners[i].handleEvent(oEvent);
	}
	
	/**
	 * @param {Event} oIEEvent
	 * @param {Object} oCurrentTarget
	 */
	function createEventFromIEEvent(oIEEvent, oCurrentTarget) {
		var oEvent = new Event();
		var sType = oIEEvent.type;
		switch (sType) {
			case 'dblclick':
			case 'contextmenu':
				sType = 'click';
				break;
		}
		if (hIEEventProperties.hasOwnProperty(sType)) {
			var bBubbling = hIEEventProperties[sType][0];
			var bCancelable = hIEEventProperties[sType][1];
		} else {
			// if not in the list, just assume true...
			var bBubbling = true;	
			var bCancelable = true;
		}
		oEvent.initEvent(sType, bBubbling, bCancelable);
		oEvent.target = oIEEvent.srcElement;
	};
	
	/**
	 * Which events bubble (1st value) and which are cancellable (2nd value)
	 */
	var hIEEventProperties = {
		'abort' : [false, true],
		'activate' : [true, false],
		'afterprint' : [false, false],
		'afterupdate' : [true, false],
		'beforeactivate' : [true, true],
		'beforecopy' : [true, true],
		'beforecut' : [true, true],
		'beforedeactivate' : [true, true],
		'beforeeditfocus' : [true, true],
		'beforepaste' : [true, true],
		'beforeprint' : [false, false],
		'beforeunload' : [false, true],
		'beforeupdate' : [true, true],
		'blur' : [false, false],
		'bounce' : [false, true],
		'cellchange' : [true, false],
		'change' : [false, true],
		'click' : [true, true],
		'contextmenu' : [true, true],
		'controlselect' : [true, true],
		'copy' : [true, true],
		'cut' : [true, true],
		'dataavailable' : [true, false],
		'datasetchanged' : [true, false],
		'datasetcomplete' : [true, false],
		'dblclick' : [true, true],
		'deactivate' : [true, false],
		'drag' : [true, true],
		'dragend' : [true, true],
		'dragenter' : [true, true],
		'dragleave' : [true, true],
		'dragover' : [true, true],
		'dragstart' : [true, true],
		'drop' : [true, true],
		'error' : [false, true],
//		'error' : [false, false],	// fired on XDomainRequest
		'errorupdate' : [true, false],
		'filterchange' : [false, false],
		'finish' : [false, true],
		'focus' : [false, false],
		'focusin' : [true, false],
		'focusout' : [true, false],
		'hashchange' : [true, true],
		'help' : [true, true],
		'keydown' : [true, true],
		'keypress' : [true, true],
		'keyup' : [true, false],
		'layoutcomplete' : [true, true],
		'load' : [false, false],
//		'load' : [false, false],	// fired on XDomainRequest
		'losecapture' : [false, false],
		'message' : [false, true],
		'mousedown' : [true, true],
		'mouseenter' : [false, false],
		'mouseleave' : [false, false],
		'mousemove' : [true, false],
		'mouseout' : [true, false],
		'mouseover' : [true, true],
		'mouseup' : [true, true],
		'mousewheel' : [true, true],
		'move' : [true, false],
		'moveend' : [true, false],
		'movestart' : [true, true],
		'offline' : [false, false],
		'online' : [false, false],
//		'page' : [true, true],	// MSDN says: not implemented (?)
		'paste' : [true, true],
		'progress' : [false, false],
		'propertychange' : [false, false],
		'readystatechange' : [false, false],
//		'readystatechange' : [false, false],	// XMLHttpRequest
		'reset' : [false, true],
		'resize' : [false, false],
		'resizeend' : [true, false],
		'resizestart' : [true, true],
		'rowenter' : [true, false],
		'rowexit' : [false, true],
		'rowsdelete' : [true, false],
		'rowsinserted' : [true, false],
		'scroll' : [false, false],
		'select' : [false, true],
		'selectionchange' : [false, false],
		'selectstart' : [true, true],
		'start' : [false, false],
		'stop' : [false, false],
		'storage' : [false, false],
		'storagecommit' : [false, false],
		'submit' : [false, true],
		'timeout' : [false, false],
		'unload' : [false, false]
	};
	
});
