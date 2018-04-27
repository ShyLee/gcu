Ext.define('Common.view.prompt.tablet.RoomStandard', {
    extend : 'Common.view.prompt.tablet.Base',
    xtype : 'tabletRoomStandardPrompt',

    config : {
        items: [
            {
                xtype: 'container',
                html: '<div class="prompt-list-label"><h3>Room Standard</h3>' +
                      '<div>Description</div></div>'
            }
        ],
        list : {
            store : 'roomStandardsStore',
            id : 'roomStandardsPromptList',
            itemTpl : '<div class="prompt-list-hbox"><div style="width:30%;">{rm_std}</div>' +
                      '<div>{description}</div>'
        },

        titleBar : {
            docked : 'top',
            title: 'Room Standards',
            items : [
                {
                    xtype : 'searchfield',
                    align : 'right',
                    name : 'roomStandardsSearch',
                    placeHolder : LocaleManager.getLocalizedString('Search Room Standards',
                                  'Common.view.prompt.tablet.RoomStandard')
                } ]
        }
    }
});