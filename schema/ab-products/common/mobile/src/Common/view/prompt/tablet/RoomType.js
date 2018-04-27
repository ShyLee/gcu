Ext.define('Common.view.prompt.tablet.RoomType', {
    extend : 'Common.view.prompt.tablet.Base',
    xtype : 'tabletRoomTypePrompt',

    config : {
        items: [
            {
                xtype: 'container',
                html: '<div class="prompt-list-label"><h3>Room Category</h3>' +
                      '<h3>Room Type</h3>' +
                      '<div>Description</div></div>'
            }
        ],
        list : {
            store : 'roomTypesStore',
            id : 'roomTypesPromptList',
            itemTpl : '<div class="prompt-list-hbox"><div style="width:30%;">{rm_cat}</div>' +
                      '<div style="width:30%">{rm_type}</div>' +
                      '<div>{description}</div>'
        },

        titleBar : {
            docked : 'top',
            title: 'Room Types',
            items : [
                {
                    xtype : 'searchfield',
                    align : 'right',
                    name : 'roomTypeSearch',
                    placeHolder : LocaleManager
                            .getLocalizedString('Search Room Type', 'Common.view.prompt.tablet.RoomType')
                } ]
        }
    }
});