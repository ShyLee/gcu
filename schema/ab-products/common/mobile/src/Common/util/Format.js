/**
 * Provides number formatting and parsing functions.
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.util.Format', {

	requires : 'Ext.util.Format',

	singleton : true,

	/**
	 * @property The default value for the number grouping separator. Can be set to the grouping separator for the
	 *           locale in the setNumberFormatSeparators function.
	 */
	groupingSeparator : ',',

	/**
	 * @property The default value for the number decimal separator. Can be set to the grouping separator for the locale
	 *           in the setNumberFormatSeparators function.
	 */
	decimalSeparator : '.',

	/**
	 * @property
	 * @private The neutral grouping separator character
	 */
	neutralGroupingSeparator : ',',

	/**
	 * @propert
	 * @private The neutral decimal separator character
	 */
	neutralDecimalSeparator : '.',

	constructor : function(config) {
		this.registerFormatFunctions();
	},

	/**
	 * Registers formatting functions in the Ext namespace. The formatting functions are used when foramtting items in
	 * list view item templates.
	 */
	registerFormatFunctions : function() {
		Ext.apply(Ext.util.Format, {
			string : function(v, format) {
				if (v === null) {
					return '';
				} else {
					return v;
				}
			}
		});

		Ext.apply(Ext.util.Format, {
			number : function(v, decimals) {
				return Common.util.Format.formatNumber(v, decimals);
			}
		});
	},

	/**
	 * Formats
	 * 
	 * @param value
	 *            {String} The value to format
	 * @param decimals
	 *            {Integer}
	 * @return {String}
	 */
	formatNumber : function(value, decimals) {

		value = Ext.Number.from(value, NaN);
		if (isNaN(value)) {
			return '';
		}

		if (Ext.isEmpty(decimals)) {
			decimals = 0;
		}

		var formattedValue = value.toFixed(decimals);
		formattedValue = this.insertGroupingSeparator(formattedValue, true, true);

		return formattedValue;

	},

	/**
	 * Sets the format parameters to the localized values
	 * 
	 * @param groupingSeparator
	 * @param decimalSeparator
	 * @param currencySymbol
	 */

	setNumberFormatSeparators : function(decimalSeparator, groupingSeparator) {

		this.groupingSeparator = groupingSeparator || this.groupingSeparator;
		this.decimalSeparator = decimalSeparator || this.decimalSeparator;

	},

	/**
	 * Converts the number to neutral format
	 * 
	 * @param value
	 * @return {String}
	 */
	parseNumber : function(value) {

		var parsedValue = value;
		// remove group separator
		parsedValue = this.removeGroupingSeparator(parsedValue, true);
		parsedValue = parsedValue.replace(this.decimalSeparator, this.neutralDecimalSeparator);

		return parsedValue;
	},

	/**
	 * Adds the locale specific grouping separator to the formatted number. Converted from ab-core.js
	 * 
	 * @param value
	 * @param useNeutralDecimal
	 * @param useLocalizedValue
	 * @return {*}
	 */
	insertGroupingSeparator : function(value, useNeutralDecimal, useLocalizedValue) {
		var formattedValue = value;
		if (!Ext.isEmpty(value)) {
			var numberRe = new RegExp("(-?[0-9]+)([0-9]{3})");
			var groupingSeparator = this.groupingSeparator;

			var neutralDecimalSeparator = this.decimalSeparator;
			var decimalSeparator = this.decimalSeparator;

			if (typeof useNeutralDecimal != "undefined" && useNeutralDecimal === true) {
				decimalSeparator = this.neutralDecimalSeparator;
			}
			if (typeof useLocalizedValue != "undefined" && useLocalizedValue === false) {
				groupingSeparator = this.neutralGroupingSeparator;
				neutralDecimalSeparator = this.neutralDecimalSeparator;
			}
			var decimalPosition = value.indexOf(decimalSeparator);
			var numberValue = value;
			var fractionalValue = "";
			if (decimalPosition > 0) {
				numberValue = value.substring(0, decimalPosition);
				fractionalValue = neutralDecimalSeparator + value.substring(decimalPosition + 1, value.length);
			}
			while (numberRe.test(numberValue)) {
				numberValue = numberValue.replace(numberRe, "$1" + groupingSeparator + "$2");
			}
			formattedValue = numberValue + fractionalValue;
		}
		return formattedValue;
	},

	/**
	 * Removes the locale specific grouping separator. Converted from ab-core.js
	 * 
	 * @param value
	 * @param useLocalizedFormat
	 * @return {*}
	 */
	removeGroupingSeparator : function(value, useLocalizedFormat) {
		var formattedValue = value, thousandSeparator = this.groupingSeparator;

		if (typeof useLocalizedFormat !== "undefined" && useLocalizedFormat === false) {
			thousandSeparator = ','; // neutral separator
		}
		thousandSeparator = Ext.String.trim(thousandSeparator);
		if (thousandSeparator.length === 0) {
			formattedValue = formattedValue.replace(/\s+/g, "");
		} else {
			while (formattedValue.indexOf(thousandSeparator) >= 0) {
				formattedValue = formattedValue.replace(thousandSeparator, "");
				formattedValue = Ext.String.trim(formattedValue);
			}
		}
		return formattedValue;
	}

});