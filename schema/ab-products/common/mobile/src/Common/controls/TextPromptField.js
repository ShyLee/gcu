Ext.define('Common.controls.TextPromptField', {
	extend : 'Ext.field.TextArea',

	xtype : 'textpromptfield',

	requires : 'Common.controls.TextPromptInput',

	config : {
		readOnly : false,
		component : {
			xtype : 'textpromptinput'
		}
	},

	applyReadOnly : function(config) {
		if (config) {
			this.element.addCls('x-compose-readonly');
		} else {
			this.element.removeCls('x-compose-readonly');

		}
		this.setClearIcon(!config);
		this.getComponent().setReadOnly(config);
	},

	initialize : function() {
		this.element.addCls('x-textprompt-clearicon');
		this.callParent();
	}
});