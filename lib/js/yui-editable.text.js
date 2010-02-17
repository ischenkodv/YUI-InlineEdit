/**
 * Copyright (c) 2009, Dmitri Ischenko
 * All rights reserved.
 * Redistributable under BSD license
 */
YAHOO.namespace("editable");

/**
 * Editable text field
 * @param oElem {object} Element to convert to editable
 * @param oOptions {object} Editable element options
 * @constructor
 */
YAHOO.editable.text = function(oElem, oOptions){
	YAHOO.editable.text.superclass.constructor.apply(this,[oElem, oOptions]);
}
YAHOO.lang.extend(YAHOO.editable.text, YAHOO.editable.abstractField);

/**
 * Create field element
 * @param oTarget {object} Reference to the target element
 * @return {object} DOM element that will be used for editing
 */
YAHOO.editable.text.prototype._createField = function(oTarget) {
	var oElem = document.createElement('input');
	oElem.setAttribute('type','text');
	oElem.setAttribute('name',this._oOptions.fieldName);
	oElem.value = oTarget.innerHTML;
	return oElem;
}