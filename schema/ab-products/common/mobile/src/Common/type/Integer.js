/**
 * Custom data type that represents integer.
 * <p>
 * Uses JavaScript number to store the value.
 * <p>
 * <p>
 * The constructor accepts a number or formatted number string.
 * 
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */

Ext.define('Common.type.Integer', {
	extend : 'Common.type.CustomType',

	/**
	 * Called when the value property is set or modified.
	 * 
	 * @param newValue
	 * @param oldValue
	 * @return {Integer}
	 * @throws {Error}
	 *             Throws an exception if the input value cannot be converted to a Common.type.Integer type.
	 */
	applyValue : function(newValue, oldValue) {
		var intValue;

		if (!Ext.isEmpty(newValue)) {
			if (Ext.isNumber(newValue)) {
				intValue = parseInt(newValue, 10);
			} else {
				intValue = parseInt(String(newValue).replace(Ext.data.Types.stripRe, ''), 10);
				if (isNaN(intValue)) {
					throw new Error('The input value cannot be converted to the Common.type.Integer type.');
				}
			}
		} else {
			// The input value is empty.
			intValue = null;
		}

		return intValue;
	}

});