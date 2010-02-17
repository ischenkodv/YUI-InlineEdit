/**
 * Copyright (c) 2009, Dmytro Ischenko
 * All rights reserved.
 * Redistributable under BSD license
 */
YAHOO.namespace("editable");

/**
 * @description Editable textarea field
 * @param oElem {object} Element to convert to editable
 * @param oOptions {object} Editable element options
 */
YAHOO.editable.checkbox = function(oElem, oOptions){
	var oDefaultOptions = {
		fieldsClass : YAHOO.editable.checkbox.fieldClass,
		fieldsTag : YAHOO.editable.checkbox.fieldsTag
	};
	YAHOO.lang.augmentObject(oDefaultOptions, oOptions, true);

	YAHOO.editable.checkbox.superclass.constructor.apply(this,[oElem, oDefaultOptions]);
}
// inherit from abstractField
YAHOO.lang.extend(YAHOO.editable.checkbox, YAHOO.editable.abstractField);


/**
 * Class of checkbox elements
 * @static
 */
YAHOO.editable.checkbox.fieldClass = '';

/**
 * Tag name of checkbox elements
 * @static
 */
YAHOO.editable.checkbox.fieldsTag = 'li';

/**
 * @description Create field element
 * @param oTarget {object} Reference to the target element
 * @return {object} DOM element that will be used for editing
 */
YAHOO.editable.checkbox.prototype._createField = function(oTarget) {
	var aCurrentFields,
		sClass = this._oOptions.fieldsClass ? this._oOptions.fieldsClass : null,
		sTag = this._oOptions.fieldsTag ? this._oOptions.fieldsTag : null;
	if (sClass) {
		aCurrentFields = YAHOO.util.Dom.getElementsByClassName(sClass, sTag, oTarget);
	} else if (sTag) {
		aCurrentFields = oTarget.getElementsByTagName(sTag);
	} else {
		return false;
	}

	if (!aCurrentFields.length) {
		return false;
	}
	
	var oElem,
		oLabel,
		oDiv,
		aCurrentValues = [],
		oCont = document.createElement('div');

	for (var i = aCurrentFields.length; --i >= 0;) {
		aCurrentValues.push(aCurrentFields[i].innerHTML);
	}

	for (var i in this._oOptions.values) {
		oElem = document.createElement('input');
		oElem.setAttribute('type', 'checkbox');
		oElem.setAttribute('name',this._oOptions.fieldName + '[]');
		oElem.value = i;


		if (this.inArray(this._oOptions.values[i], aCurrentValues)) {
			oElem.setAttribute('checked', 'checked');
		}

		oLabel = document.createElement('label');
		oLabel.setAttribute('for', this._oOptions.fieldName);
		oLabel.innerHTML = this._oOptions.values[i];

		oDiv = document.createElement('div');

		oDiv.appendChild(oElem);
		oDiv.appendChild(oLabel);

		oCont.appendChild(oDiv);
	}

	return oCont.children.length ? oCont : false;
}

/**
 * Get result from the form
 * @return {array}
 */
YAHOO.editable.checkbox.prototype._getValue = function(){
	var results = [];
	YAHOO.util.Dom.getElementsBy(
		function(elem){
			return (elem.type == 'checkbox' && elem.checked) ? true : false;
		},
		'input',
		this._oField,
		function(elem){
			this.push(elem.value);
		},
		results,
		true
	);

	return results;
}

/**
 * Get final markup
 * @module yui-editable
 * @class checkbox
 * @return string
 */
YAHOO.editable.checkbox.prototype._getFinalMarkup = function(aInput){

	var result = '',
		sOpenTag = '<' + this._oOptions.fieldsTag + (this._oOptions.fieldsClass ? ' class="' + this._oOptions.fieldsClass + '"' : '') + '>',
		sCloseTag = '</' + this._oOptions.fieldsTag + '>';

	if (aInput.length > 0) {
		for (var i = 0, len = aInput.length; i < len; i++) {
			if (aInput[i] in this._oOptions.values) {
				result += sOpenTag + this._oOptions.values[aInput[i]] + sCloseTag;
			}
		}
	} else {
		result += sOpenTag + this._oOptions.emptyPlaceholder + sCloseTag;
	}

	return result;
}