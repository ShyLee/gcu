/**
 * Custom data type that represents date only.
 * <p>
 * Uses JavaScript Date object to store the value.
 * <p>
 * The time part of the Date object is 00:00:00.
 * <p>
 * The constructor accepts a Date object or strings in the formats of YYYY-MM-dd, YYYY/MM/dd and YYYY-MM-dd
 * HH:mm:ss.nnn.
 * 
 * 
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 * 
 * 01.03.13 Added null value handling in the applyValue function. JM 01.07.13 Changed dateParse function to handle
 * strings in format YYYY-MM-dd HH:mm:ss.nnn. JM
 */
Ext.define('Common.type.Date', {
	extend : 'Common.type.CustomType',

	/**
	 * Called when the value property is set or modified.
	 * 
	 * @param newValue
	 * @param oldValue
	 * @return {Date}
	 * @throws {Error}
	 *             Throws an exception if the input value cannot be converted to a Common.type.Date type.
	 */
	applyValue : function(newValue, oldValue) {
		var dateValue = null;

		if (Ext.isDate(newValue)) {
			dateValue = this.removeTimeFromDate(newValue);
		} else if (Ext.isString(newValue)) {
			dateValue = this.parseDateString(newValue);
		} else if (newValue === null) {
			dateValue = null;
		} else {
			// The input cannot be parsed, throw an exception.
			throw new Error('The input value cannot be converted to a Common.type.Date type.');
		}

		if (dateValue !== null) {
			dateValue = this.removeTimeFromDate(dateValue);
		}

		return dateValue;
	},

	/**
	 * Returns a Date object created from the input date string. Returns null if the input string cannot be converted to
	 * a Date object.
	 * <p>
	 * 
	 * @private
	 * @param {String}
	 *            A string representing the date in YYYY-MM-dd or YYYY/MM/dd format
	 * 
	 * @throws {Error}
	 *             Throws an exception if the input value cannot be converted to a Common.type.Date type.
	 */

	parseDateString : function(dateString) {
		var parsedDate;
		// Some browsers do not correctly parse dates in the format of YYYY-MM-dd.
		// Replace the dashes with slashes before trying to parse the date string.
		if (this.dashesRegEx.test(dateString)) {
			dateString = dateString.replace(this.dashesRegEx, '/');
		}

		// Date format YYYY/mm/dd HH:mm:ss.nnn is not handled in Safari using Date.parse.
		parsedDate = Ext.Date.parse(dateString, 'Y/m/d h:i:s.u');
		if (Ext.isDefined(parsedDate)) {
			return parsedDate;
		}

		// Try to parse the date
		parsedDate = Date.parse(dateString);
		if (isNaN(parsedDate)) {
			// The input cannot be parsed, throw an exception.
			throw new Error('The input value cannot be converted to a Common.type.Date type.');
		} else {
			parsedDate = new Date(parsedDate);
		}

		return parsedDate;
	},

	/**
	 * Returns a Date object with the time portion of the Date set to 00:00:00
	 * <p>
	 * 
	 * @private
	 * @param {Date}
	 * 
	 */
	removeTimeFromDate : function(dateValue) {
		return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), 0, 0, 0, 0);
	}
});