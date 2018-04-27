Ext.define('Maintenance.view.ProblemDescription', {
    extend: 'Ext.Panel',

    xtype: 'problemDescriptionPanel',

    config: {
        layout: 'fit',
        items: [
            {
                xtype: 'list',
                store: 'problemDescriptionsStore',
                itemTpl: '<div>{pd_id}</div><div style="color:gray">{pd_description}</div>',
                flex: 1
            }
        ]
    }
});
