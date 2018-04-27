Ext.define('Maintenance.view.tablet.ProblemResolution', {

	extend : 'Maintenance.view.ProblemResolution',

	xtype : 'tabletProblemResolutionPanel',

	config : {
		width : '60%',
		height : '70%',
		modal : true,
		hideOnMaskTap : true,
		hidden : true
	},

    initialize: function() {
        this.callParent(arguments);

        var titleBar = Ext.factory({
            title: 'Craftspersons Notes',
            docked: 'top'
        }, 'Ext.TitleBar');

        this.add(titleBar);
    }
});