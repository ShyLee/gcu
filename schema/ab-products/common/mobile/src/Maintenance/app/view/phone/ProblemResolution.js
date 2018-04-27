Ext.define('Maintenance.view.phone.ProblemResolution', {
	extend : 'Maintenance.view.ProblemResolution',

	xtype : 'phoneProblemResolutionPanel',

	initialize : function() {
        this.callParent();
		var titleBar = Ext.factory({
			title : 'Craftspersons Notes',
			docked : 'top',
			items : [ {
				xtype : 'button',
				align : 'right',
				text : 'Done',
				action : 'cancelProblemResolution',
                ui: 'action'
			} ]
		}, 'Ext.TitleBar');

		this.add(titleBar);
	}
});