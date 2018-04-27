/**
 * Provides a localizable number field.
 * <p>
 * Localized decimal separator is provided by the Common.util.Format.formatNumber function.
 * <p>
 * It extends Ext.field.Text and not Ext.field.Number because HTML5 number field is not localizable. The HTML5 number
 * field only allows '.' as the decimal separator.
 * 
 * @author Jeff Martin
 */
Ext.define('Common.controls.NumberField', {
	extend : 'Ext.field.Text',
	requires : [ 'Common.util.Format' ],

	xtype : 'formattednumberfield',

	config : {
        /**
         * @cfg component Displays the numberic keyboard
         */
        component: {
            pattern : '[0-9]*'
        },

		/**
		 * @cfg decimals Sets the number of displayed decimal spaces.
		 * @accessor
		 */
		decimals : 2
	},

	constructor : function(config) {
		this.callParent(arguments);
		this.initConfig(config);
	},

	/**
	 * Overrides the Ext.field.Text updateValue function. Applies number formatting before displaying the value.
	 * 
	 * @param newValue
	 * @param oldValue
	 */
	updateValue : function(newValue, oldValue) {
		newValue = Common.util.Format.formatNumber(newValue, this.getDecimals());
		this.callParent([ newValue, oldValue ]);
	},

	/**
	 * Overrides the Ext.field.Text getValue function. Parses the value before applying it to the model
	 * 
	 * @return {String} The value in neutral number format
	 */
	getValue : function() {
		var value = this.getComponent().getValue();
		return Common.util.Format.parseNumber(value);
	}
});
