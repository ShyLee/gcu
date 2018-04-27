Ext.define('Maintenance.view.phone.Main', {
	extend : 'Maintenance.view.Main',

	xtype : 'phoneMainview',

	isNavigationList : true,

	config : {
		title : 'Work Requests',
		editViewClass : 'Maintenance.view.WorkRequestEdit',

		toolBarButtons : [ {
			xtype : 'toolbarbutton',
			text : 'Apps',
			ui : 'iron',
			cls : 'x-button-back',
			action : 'backToAppLauncher',
			displayOn : 'all'
		}, {
			xtype : 'toolbarbutton',
			iconCls : 'refresh1',
			iconMask : true,
			action : 'syncWorkRequest',
			align : 'right',
			ui : 'iron',
			displayOn : 'all'
		} ]
	}
});