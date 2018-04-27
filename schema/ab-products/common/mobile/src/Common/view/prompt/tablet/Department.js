Ext.define('Common.view.prompt.tablet.Department', {
    extend: 'Common.view.prompt.tablet.Base',
    xtype: 'tabletDepartmentPrompt',

    config: {
        items: [
            {
                xtype: 'container',
                html: '<div class="prompt-list-label"><h3 style="width:40%;margin-left:10px">Department Code</h3>' +
                      '<div>Division Code</div></div>'
            }
        ],
        list: {
            store: 'departmentsStore',
            id: 'departmentPromptList',
            itemTpl:'<div class="prompt-list-hbox"><div style="width:40%;">{dp_id}</div>' +
                    '<div>{dv_id}</div></div>'
        },
        titleBar: {
            docked: 'top',
            title: 'Departments',
            items: [
                {
                    xtype: 'searchfield',
                    align: 'right',
                    name: 'departmentSearch',
                    placeHolder: LocaleManager.getLocalizedString('Search Departments',
                            'Common.view.prompt.tablet.Department')
                }
            ]
        }
    }
});