Ext.define('AssetAndEquipmentSurvey.view.TaskList', {
    extend: 'Common.view.navigation.ListBase',

    xtype: 'taskListPanel',

    config: {
        title: 'Equipment Items',

        editViewClass: 'AssetAndEquipmentSurvey.view.Task',

        layout: 'vbox',

        surveyId: null,

        items: [
            {
                xtype: 'toolbar',
                itemId: 'taskTitleBar',
                items: [
                    {
                        xtype: 'searchfield',
                        docked: 'left'
                    },
                    {
                        xtype: 'selectfield',
                        name: 'sortfield',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        placeHolder: 'Sort by:',
                        docked: 'right'
                    }
                ]
            },
            {
                xtype: 'list',
                store: 'surveyTasksStore',
                itemId: 'taskList',
                flex: 1,
                itemTpl: new Ext.XTemplate(
                        '<div class="prompt-list-hbox"><h1 style="width:50%">{eq_id}</h1>' +
                        '<div style="color:gray">({bl_id}-{fl_id}-{rm_id})</div>' +
                        '<h3>{eq_std}</h3></div>'),
                plugins: {
                    xclass: 'Ext.plugin.ListPaging',
                    autoPaging: false
                }
            }
        ]
    },

    initialize: function() {
        this.callParent(arguments);

        var searchField = this.down('searchfield'),
            sortField = this.down('selectfield');

        if(Ext.os.is.Phone) {
            searchField.setWidth('44%');
            sortField.setDocked('left');
            sortField.setWidth('44%');
        }
    }
});