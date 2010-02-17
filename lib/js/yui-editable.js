/**
 * Copyright (c) 2009, Dmitri Ischenko
 * All rights reserved.
 * Redistributable under BSD license
 */
YAHOO.namespace("editable");

/**
 * @description Abstract editable field class
 * @module editable
 * @class abstractField
 * @constructor
 */
YAHOO.editable.abstractField = function(oElem, oOptions){
	if (!oElem) return;

	// never initialize same element twice
	if (oElem.$isEditable) return;

	var YUE = YAHOO.util.Event,
		YEA = YAHOO.editable.abstractField;

	this._oElem = oElem;
	this._editState = false;

	// Default options
	this._oOptions = {
		url				: YEA.url,
		async_method	: YEA.async_method,
		editEvent		: YEA.editEvent,
		requestParams	: YEA.requestParams,
		fieldName		: YEA.fieldName,
		indicator		: YEA.indicator,
		validate		: YEA.validate,
		filter			: YEA.filter,
		buttons			: YEA.buttons
	};

	// Augment user defined options
	this.setOptions(oOptions);

	// Fields will become editable on double click
	if (this._oOptions.editEvent) {
		YUE.addListener(oElem, this._oOptions.editEvent, this.edit, this, true);
	}

	// Assign action for ESC key and click out
	var oHtml = document.getElementsByTagName('html')[0];
	YUE.addListener(oHtml, "click", this._onClickOutCallback, this, true);
	YUE.addListener(oHtml, "keyup", this._onKeyUpCallback, this, true);

	// Mark that the DOM element already converted to editable
	oElem.$isEditable = true;

	// By default element is enabled
	this.enable();
}

/**
 * URL to send the AJAX request to
 * @static
 */
YAHOO.editable.abstractField.url = '';

/**
 * Asynchronous request method
 * @static
 */
YAHOO.editable.abstractField.asynch_method = 'POST';

/**
 * Event that triggers editable form
 * @static
 */
YAHOO.editable.abstractField.editEvent = 'dblclick';

/**
 * Parameters that appended to the asynchronous request
 * @static
 */
YAHOO.editable.abstractField.requestParams = {};

/**
 * Name of the editable field
 * @static
 */
YAHOO.editable.abstractField.fieldName = 'var';

/**
 * Loading indicator (throbber)
 * @static
 */
YAHOO.editable.abstractField.indicator = 'Saving...';

/**
 * Validator function
 * @static
 */
YAHOO.editable.abstractField.validate = null;

/**
 * Filter function
 * @static
 */
YAHOO.editable.abstractField.filter = null;

/**
 * Buttons
 * @static
 */
YAHOO.editable.abstractField.buttons = null;




YAHOO.editable.abstractField.prototype = {

	/**
	 * Reference to the editable element
	 * @property
	 */
	_oElem: null,

	/**
	 * Reference to the element created for editing
	 * @property
	 */
	_oField: null,

	/**
	 * Initial content
	 * @property
	 */
	_sInitialText: '',

	/**
	 * Initial field value
	 * @property
	 */
	_sInitialValue: null,

	/**
	 * Shows if element enabled for editing
	 * @property
	 */
	_bEnabled: false,

	/**
	 * @method setOptions
	 * @description Set editable element's options
	 * @param oOptions {object}
	 * @public
	 */
	setOptions : function(oOptions) {
		YAHOO.lang.augmentObject(this._oOptions, oOptions, true);
	},


	/**
	 * @method enable
	 * @description Enable editable element
	 * @public
	 */
	enable : function() {
		this._bEnabled = true;
	},

	/**
	 * @method disable
	 * @description Disable editable element
	 * @public
	 */
	disable : function() {
		this._bEnabled = false;
	},

	/**
	 * Function that trigger editing
	 */
	edit : function(e){
		var oEvent = YAHOO.util.Event.getEvent(e);
		YAHOO.util.Event.stopEvent(oEvent);

		// check if we already instantiated form
		if (this._editState) return;

		// Save initial text of the container
		this._sInitialText = this._oElem.innerHTML;

		this._createForm();

		this._sInitialValue = this._getValue();

		this._editState = true;

		// select text in field if possible
		if (typeof this._oField.select == 'function'){
			this._oField.select();
		}
	},

	/**
	 * Cancel field editing, return to the initial text
	 */
	cancelEdit : function(){
		// Stop asynchronous request if it's in progress
		if (YAHOO.util.Connect.isCallInProgress(this._oRequest)) {
			YAHOO.util.Connect.abort(this._oRequest);
		}

		YAHOO.util.Event.purgeElement(this._oForm, true);
		this._oForm = null;
		this._editState = false;
		if (typeof this._sInitialText == 'string') {
			this._oElem.innerHTML = this._sInitialText;
		}
		this._sInitialText = null;
	},

	/**
	 * Set action when user clicked outside editable field
	 * @param e {object} Event object
	 */
	_onClickOutCallback : function(e){
		if (this._oForm){
			// Check if user clicked outside the form
			var oTarget = YAHOO.util.Event.getTarget(e),
				that = this;

			if (YAHOO.util.Dom.getAncestorBy(oTarget, function(oElem){
						return oElem == that._oForm ? true : false;
					})) {
						return false;
					}

			this._sendForm();
		}
	},

	/**
	 * @description Set action when user pressed ESC key
	 * @param e {object} Event object
	 */
	_onKeyUpCallback : function(e){
		if (e.keyCode == 27) {
			this.cancelEdit();
		}
	},

	/**
	 * Save results of editing
	 */
	_saveEdit : function(oResponse){
		YAHOO.util.Event.purgeElement(this._oForm, true);

		var oElem = this._oElem;

		// Parse response
		try {
			var data = YAHOO.lang.JSON.parse(oResponse.responseText);

			if (data && data.success) {
				oElem.innerHTML = (typeof data.result == 'string') ? data.result : this._getFinalMarkup(oResponse.argument);
			} else {
				throw Error(data.error ? data.error : 'Error parsing result');
			}

			YAHOO.util.Event.purgeElement(this._oForm, true);
			this._oForm = null;
			this._editState = false;
			this._sInitialText = null;

		}
		catch (e) {
			this._showError( (e instanceof SyntaxError) ? 'Error parsing result' : e.message );
			this.cancelEdit();
			return;
		}
	},

	/**
	 * Show throbber
	 */
	_showIndicator : function(){
		if (!this._oOptions.indicator) return;

		// Hide buttons if they exists
		YAHOO.util.Dom.getElementsByClassName(
				'YUI_Editable_Buttons',
				'div',
				this._oForm,
				function(elem){
					elem.style.display = 'none';
				}
			);

		var oIndicator = this._oIndicator = document.createElement('div');
		oIndicator.className = 'YUI_Editable_Indicator';
		oIndicator.innerHTML = this._oOptions.indicator;

		this._oForm.appendChild(oIndicator);
	},

	/**
	 * Hide throbber
	 */
	_hideIndicator : function(){
		if (!this._oIndicator) {
			return;
		}

		// Hide buttons if they exists
		YAHOO.util.Dom.getElementsByClassName(
				'YUI_Editable_Buttons',
				'div',
				this._oForm,
				function(elem){
					elem.style.display = 'block';
				}
			);

		this._oIndicator.parentNode.removeChild(this._oIndicator);
		this._oIndicator = null;
	},

	/**
	 * Callback for form submit
	 * @param e {object} Event object
	 */
	_onFormSubmit : function(e){
		YAHOO.util.Event.stopEvent(e);
		this._sendForm();
	},

	/**
	 * Send form data to the server
	 */
	_sendForm : function(){

		// Check if request is in progress
		if (YAHOO.util.Connect.isCallInProgress(this._oRequest)) {
			return;
		}

		
		var sUrl = this._oOptions.url,
			sResult = this._getValue();

		// Filter final text
		if (typeof this._oOptions.filter == 'function') {
			sResult = this._oOptions.filter(sResult);
		}

		// Validate final text
		if (typeof this._oOptions.validate == 'function') {
			if (!this._oOptions.validate(sResult)) {
				this.cancelEdit();
				return;
			}
		}

		// don't send request if user made no changes in the field
		if (sResult.toString() === this._sInitialValue.toString()) {
			this.cancelEdit();
			return;
		}

		// send asynchronous request
		var callback = {
			success: this._saveEdit,
			failure: this._saveEdit,
			argument: sResult,
			scope: this
		};

		if (this._oOptions.indicator) {
			callback.customevents = {
				onStart: function() {
					this._showIndicator();
				},
				onComplete: function() {
					this._hideIndicator();
				}
			};
		}

		this._oRequest = YAHOO.util.Connect.asyncRequest("POST", sUrl, callback, this._composeRequestParams(sResult));
	},

	/**
	 * Clears target element
	 */
	_clearElement : function(){
		this._oElem.innerHTML = '';
	},

	/**
	 * Create form element that will hold editable field
	 */
	_createForm : function(){

		// Get form field (every children classes have to implement the _createField method)
		var oField = this._oField = this._createField(this._oElem);
		if (!oField) {
			return;
		}

		this._clearElement();

		var oForm = this._oForm = document.createElement('form');
		YAHOO.util.Event.addListener(oForm, 'submit', this._onFormSubmit, this, true);

		oForm.ondblclick = function(e){
			YAHOO.util.Event.stopEvent(
				YAHOO.util.Event.getEvent(e)
			);
		};

		this._oElem.appendChild(oForm);
		this._oForm.appendChild(oField);

		if (this._oOptions.buttons) {
			var oButtons = document.createElement('div');
			oButtons.className = 'YUI_Editable_Buttons';

			if ('submit' in this._oOptions.buttons) {
				var oSubmitButton = document.createElement('input');
				oSubmitButton.setAttribute('type', 'submit');
				oSubmitButton.setAttribute('name', 'save');
				oSubmitButton.value = this._oOptions.buttons.submit || 'Submit';
				oButtons.appendChild(oSubmitButton);
			}
			if ('cancel' in this._oOptions.buttons) {
				var oCancelButton = document.createElement('input');
				oCancelButton.setAttribute('type', 'button');
				oCancelButton.setAttribute('name', 'cancel');
				oCancelButton.value = this._oOptions.buttons.cancel || 'Cancel';
				YAHOO.util.Event.addListener(oCancelButton, 'click', this.cancelEdit, this, true);
				oButtons.appendChild(oCancelButton)
			}

			if (oButtons.children.length > 0) {
				this._oForm.appendChild(oButtons);
			}
		}

	},

	/**
	 * Compiles result parameters that will be sent to server
	 * @result {string}
	 */
	_composeRequestParams : function(input) {
		var sParams = '',
			aAdditionalParams = [],
			oOptions = this._oOptions;

		if (input instanceof Array){
			sParams = input.join();
		} else {
			sParams = input;
		}

		if (typeof oOptions.requestParams == 'object') {
			for (var j in oOptions.requestParams) {
				aAdditionalParams.push(j , '=' , oOptions.requestParams[j]);
			}
		}

		return oOptions.fieldName
				+ '='
				+ encodeURIComponent(sParams)
				+ '&'
				+ aAdditionalParams.join('');
	},

	/**
	 * Get final markup that will be inserted in page
	 * @module yui-editable
	 * @class abstractField
	 * @return string
	 */
	_getFinalMarkup : function(sText){
		return sText;
	},

	/**
	 * @description Get result from the form
	 * @return {string}
	 */
	_getValue : function(){
		return this._oField.value;
	},

	_showError : function(sError){
		alert(sError);
	},

	/**
	 * Check if element exists in the array
	 * @return {boolean}
	 */
	inArray : function(needle, haystack) {
		if (haystack instanceof Array) {

			for (var i = haystack.length; --i >= 0;) {
				if (haystack[i] === needle) {
					return true;
				}
			}

		}

		return false;
	}
}