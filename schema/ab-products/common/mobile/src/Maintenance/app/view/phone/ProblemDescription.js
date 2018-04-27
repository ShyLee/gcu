Ext.define('Maintenance.view.phone.ProblemDescription', {
    extend: 'Maintenance.view.ProblemDescription',

    xtype: 'phoneProblemDescriptionPanel',

    initialize: function () {
        var titleBar = Ext.factory({
            title: 'Problem Description',
            docked: 'top',
            items: [
                {
                    xtype: 'button',
                    align: 'right',
                    text: 'Done',
                    action: 'cancelProblemDescription',
                    ui: 'action'
                }
            ]
        }, 'Ext.TitleBar');

        this.add(titleBar);
    }
});