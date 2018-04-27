Ext.define('Maintenance.view.phone.ProblemType', {
    extend: 'Maintenance.view.ProblemType',

    xtype : 'phoneProblemTypePanel',

    initialize: function () {
        // Add Cancel button to the title bar
        var nestedList = this.query('nestedlist'),
            button = Ext.factory({
                ui: 'iron',
                text: 'Cancel',
                align: 'right',
                action: 'cancelProblemType'

            }, 'Ext.Button');

        if (nestedList) {
            nestedList[0].getToolbar().add(button);
        }

        this.callParent();
    }

});