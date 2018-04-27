Ext.define('Maintenance.view.ProblemResolution', {
	extend : 'Ext.Panel',

	xtype : 'problemResolutionPanel',

	config : {
		layout : 'fit',

		items : [
            {
                xtype : 'list',
                store : 'problemResolutionsStore',
                itemTpl : '<div>{pr_id}</div><div style="color:gray">{pr_description}</div>',
                flex : 1
            }
     ]
	}
});
