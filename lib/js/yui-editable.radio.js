/**
 * Copyright (c) 2009, Dmitri Ischenko
 * All rights reserved.
 * Redistributable under BSD license
 */
YAHOO.namespace("editable");

/**
 * Editable radio button field
 * @param oElem {object} Element to convert to editable
 * @param oOptions {object} Editable element options
 */
YAHOO.editable.radio = function(oElem, oOptions){
	YAHOO.editable.radio.superclass.constructor.apply(this,[oElem, oOptions]);
}
YAHOO.lang.extend(YAHOO.editable.radio, YAHOO.editable.abstractField);

/**
 * Create field element
 * @param oTarget {object} Reference to the target element
 * @return {object} DOM element that will be used for editing
 */
YAHOO.editable.radio.prototype._createField = function(oTarget) {
	var oElem = document.createElement('div'),
		sText = oTarget.innerHTML,
		sFieldName = this._oOptions.fieldName;

	if (this._oOptions.options) {
		var options = this._oOptions.options,
			selected = '',
			aItems = [];
		for (var i in options) {
			selected = (sText == options[i]) ? 'checked' : '';
			aItems.push(
				'<input type="radio" name="' , sFieldName , '" value="' + i + '" ', selected , '>'
				, '<label for="' , sFieldName , '">' , options[i] , '</label>'
			);
		}

		oElem.innerHTML = aItems.join('');
	}

	return oElem;
}

/**
 * Get checked radio element
 * @return {element}
 */
YAHOO.editable.radio.prototype._getCheckedInput = function() {
	for (var i = 0, len = this._oField.children.length; i < len; i++) {
		if (this._oField.children[i].checked) {
			return this._oField.children[i];
		}
	}

	return null;
}

/**
 * Get result from the form
 * @return {string}
 */
YAHOO.editable.radio.prototype._getValue = function(){

	var oRadio = this._getCheckedInput();

	return oRadio ? oRadio.value : null;
}

/**
 * Get final markup
 * @module yui-editable
 * @class radio
 * @return string
 */
YAHOO.editable.radio.prototype._getFinalMarkup = function(sValue) {
	return (sValue in this._oOptions.options)  ? this._oOptions.options[sValue] : '';
}