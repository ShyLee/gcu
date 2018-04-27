Ext.define('Common.view.prompt.phone.Base', {
	extend : 'Common.view.prompt.PromptBase',

	xtype : 'phonePromptBase',

	config : {
		showAnimation : {
			type : 'slideIn',
			duration : 200,
			easing : 'ease-out',
			direction : 'left'
		},
		hideAnimation : {
			type : 'slideOut',
			duration : 200,
			direction : 'right',
			easing : 'ease-out'
		},

		list : {
			margin : 10
		},

		titleBar : {
			items : [ {
				xtype : 'button',
				text : LocaleManager.getLocalizedString('Done', 'Common.view.prompt.phone.Base'),
				align : 'right',
				itemId : 'cancelBtn',
                ui: 'action'
			} ]
		}

	},

	initialize : function() {
		this.callParent(arguments);
		var cancelButton = this.query('#cancelBtn')[0];
		cancelButton.on('tap', this.onCancel, this);

	},

	onCancel : function() {
		this.fireEvent('promptcancelled', this);
	}
});
