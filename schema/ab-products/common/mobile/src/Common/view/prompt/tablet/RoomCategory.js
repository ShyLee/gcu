Ext.define('Common.view.prompt.tablet.RoomCategory', {
    extend : 'Common.view.prompt.tablet.Base',
    xtype : 'tabletRoomCategoryPrompt',

    config : {
        items: [
            {
                xtype: 'container',
                html: '<div class="prompt-list-label"><h3>Category</h3>' +
                      '<div>Description</div></div>'
            }
        ],
        list : {
            store : 'roomCategoriesStore',
            id : 'roomCategoriesPromptList',
            itemTpl : '<div class="prompt-list-hbox"><div style="width:30%;">{rm_cat}</div>' +
                     '<div">{description}</div>'
        },

        titleBar : {
            docked : 'top',
            title: 'Room Categories',
            items : [
                {
                    xtype : 'searchfield',
                    align : 'right',
                    name : 'roomCategorySearch',
                    placeHolder : LocaleManager.getLocalizedString('Search Room Category',
                                  'Common.view.prompt.tablet.RoomCategory')
                } ]
        }
    }
});