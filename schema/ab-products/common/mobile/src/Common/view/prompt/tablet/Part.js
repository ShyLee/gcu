Ext.define('Common.view.prompt.tablet.Part', {
    extend: 'Common.view.prompt.tablet.Base',
    xtype: 'tabletPartPrompt',

    config: {
        items: [
            {
                xtype: 'container',
                html: '<div class="prompt-list-label"><h3>Part Code</h3>'
                        + '<div>Description</div></div>'
            }
        ],
        list: {
            store: 'partsStore',
            itemTpl: '<div class="prompt-list-hbox"><div style="width:30%;">{part_id}</div><div">{description}</div></div>'
        },
        titleBar: {
            docked: 'top',
            title: 'Parts',
            items: [
                {
                    xtype: 'searchfield',
                    align: 'right',
                    name: 'partSearch',
                    placeHolder: LocaleManager.getLocalizedString('Search Parts',
                            'Common.view.prompt.tablet.Part')
                }
            ]
        }
    }
});
