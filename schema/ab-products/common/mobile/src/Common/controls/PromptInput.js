/**
 * Adds an additional element to the Ext.field.Input. The element displays a disclosure arrow.
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.controls.PromptInput', {

	extend : 'Ext.field.Input',

	xtype : 'promptinput',

	// Override the Ext.field.Input#getTemplate function. Add an arrow element to the input field.
	// @private
	getTemplate : function() {
		var items = [ {
			reference : 'input',
			tag : this.tag
		}, {
			reference : 'clearIcon',
			cls : 'x-clear-icon'
		}, {
			reference : 'promptArrow',
			cls : 'x-arrow'
		} ];

		items.push({
			reference : 'mask',
			classList : [ this.config.maskCls ]
		});

		return items;
	}
});
