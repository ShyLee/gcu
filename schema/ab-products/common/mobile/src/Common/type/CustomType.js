/**
 * Abstract class that all custom types should inherit from.
 * <p>
 * Stores value in the value property.
 * <p>
 * The value property stores a JavaScript object of type Date, or number.
 * 
 * @author Jeff Martin
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.type.CustomType', {

	// TODO why CustomType knows about regex?
	dashesRegEx : /-/g,
	// TODO why CustomType knows about time?
	timeSeperatorRegex : /:/,

	config : {
		/**
		 * @cfg Contains the Date or Number object that represents the value of
		 *      the custom type.
		 */
		value : null
	},

	constructor : function(config) {
		this.initConfig(config);
	},

	/**
	 * @overrides Overrides the toString() function. Provides the string
	 *            representation of the custom type value
	 * @return {String}
	 */
	toString : function() {
		if (this.getValue()) {
			return this.getValue().toString();
		} else {
			return null;
		}
	},

	/**
	 * @overrides Overrides the valueOf() function. Provides the value of the
	 *            custom type
	 * @return {null}
	 */
	valueOf : function() {
		if (this.getValue()) {
			return this.getValue();
		} else {
			return null;
		}
	}
});