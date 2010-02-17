/**
 * Copyright (c) 2009, Dmitri Ischenko
 * All rights reserved.
 * Redistributable under BSD license
 */
YAHOO.namespace("editable");

/**
 * Editable textarea field
 * @param oElem {object} Element to convert to editable
 * @param oOptions {object} Editable element options
 * @constructor
 */
YAHOO.editable.textarea = function(oElem, oOptions){
	var oDefaultOptions = {
		rows : YAHOO.editable.textarea.rows,
		cols : YAHOO.editable.textarea.cols
	};
	YAHOO.lang.augmentObject(oDefaultOptions, oOptions, true);

	YAHOO.editable.textarea.superclass.constructor.apply(this,[oElem, oDefaultOptions]);
}
YAHOO.lang.extend(YAHOO.editable.textarea, YAHOO.editable.abstractField);


/**
 * Number of rows in textarea
 * @static
 */
YAHOO.editable.textarea.rows = 3;

/**
 * Number of columns in textarea
 * @static
 */
YAHOO.editable.textarea.cols = 30;


/**
 * Create field element
 * @param oTarget {object} Reference to the target element
 * @return {object} DOM element that will be used for editing
 */
YAHOO.editable.textarea.prototype._createField = function(oTarget) {
	var oElem = document.createElement('textarea');

	oElem.setAttribute('rows', this._oOptions.rows);
	oElem.setAttribute('cols', this._oOptions.cols);
	oElem.setAttribute('name',this._oOptions.fieldName);
	oElem.value = oTarget.innerHTML;

	return oElem;
}
