Ext.define('Maintenance.view.ProblemType', {

    extend: 'Ext.Panel',

    requires : [ 'Ext.dataview.NestedList', 'Maintenance.model.Problems' ],

    xtype : 'phoneProblemTypePanel',

    config : {
        layout : 'fit',

        items : [
            {
                xtype : 'nestedlist',
                title: LocaleManager.getLocalizedString('Problem Type'),
                store : {
                    type : 'tree',
                    id : 'NestedListStore',
                    model : 'Maintenance.model.Problems'
                },
                displayField : 'text'
            } ]
    },

    constructor : function (config, data) {
        this.callParent(arguments);
        var store = Ext.ComponentQuery.query('nestedlist')[0].getStore();
        store.setData(data);
    }

});