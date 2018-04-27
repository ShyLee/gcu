Ext.define('Maintenance.view.tablet.ProblemDescription', {
    extend: 'Maintenance.view.ProblemDescription',

    xtype: 'tabletProblemDescriptionPanel',

    config: {
        width : '60%',
        height : '70%',
        modal : true,
        hideOnMaskTap : true,
        hidden : true
    },

    initialize: function() {
        this.callParent(arguments);

        var titleBar = Ext.factory({
            title: 'Problem Description',
            docked: 'top'
        }, 'Ext.TitleBar');

        this.add(titleBar);
    }

});