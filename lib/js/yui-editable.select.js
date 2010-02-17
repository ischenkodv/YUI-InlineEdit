/**
 * Copyright (c) 2009, Dmitri Ischenko
 * All rights reserved.
 * Redistributable under BSD license
 */
YAHOO.namespace("editable");

/**
 * Editable select field
 * @param oElem {object} Element to convert to editable
 * @param oOptions {object} Editable element options
 */
YAHOO.editable.select = function(oElem, oOptions){
	YAHOO.editable.select.superclass.constructor.apply(this,[oElem, oOptions]);
}
YAHOO.lang.extend(YAHOO.editable.select, YAHOO.editable.abstractField);

/**
 * Create field element
 * @param oTarget {object} Reference to the target element
 * @return {object} DOM element that will be inserted into form
 */
YAHOO.editable.select.prototype._createField = function(oTarget) {
	var oElem = document.createElement('select'),
		sText = oTarget.innerHTML;
	oElem.setAttribute('name',this._oOptions.fieldName);

	if (this._oOptions.options) {
		var options = this._oOptions.options,
			aStr = [];
		for (var i in options) {
			aStr.push(
				'<option value="' , i , '" '
				, (sText == options[i]) ? 'selected="selected"' : ''
				, '>'
				, options[i]
				, '</option>'
			);
		}
		oElem.innerHTML = aStr.join('');
	}

	return oElem;
}

/**
 * Generate the markup that will be inserted as a result into page
 * @param data {string} The form value
 * @return {string}
 */
YAHOO.editable.select.prototype._getFinalMarkup = function(data){
	return (data in this._oOptions.options) ? this._oOptions.options[data] : '';
}