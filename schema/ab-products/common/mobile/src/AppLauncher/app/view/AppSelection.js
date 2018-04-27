Ext.define('AppLauncher.view.AppSelection', {
	extend : 'Ext.Container',

    xtype: 'appSelectionPanel',

	config : {

		layout : {
			type : 'vbox',
			align : 'center',
			pack : 'center'
		},

		cls : 'panelBackground',

		scrollable : {
			direction : 'vertical',
			directionLock : true
		},

		items : [ {
			xtype : 'titlebar',
			docked : 'top',
			title : Common.lang.LocaleManager.getLocalizedString('ARCHIBUS Mobile Apps'),
			items : [ {
				xtype : 'button',
				align : 'right',
				iconCls : 'settings',
				iconMask : true,
				action : 'displayPreferences'
			} ]

		}, {
			xtype : 'toolbar',
			docked : 'bottom'
		} ]
	}

// Contents of this view are generated dynamically using the
// AppLauncher.ui.IconView class

});