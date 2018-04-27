Ext.define('AssetAndEquipmentSurvey.view.RoomTaskList', {
    extend: 'Common.view.navigation.ListBase',

    xtype: 'roomTaskListPanel',

    config: {
        editViewClass: 'AssetAndEquipmentSurvey.view.Task',
        roomCodes: null,

        title: 'Tasks for Room',
        items: [
            {
                xtype: 'list',
                store: 'surveyTasksStore',
                itemId: 'taskList',
                flex: 1,
                itemTpl: new Ext.XTemplate(
                        '<div class="prompt-list-hbox"><h1 style="width:200px">{eq_id}</h1>' +
                        '<div style="color:gray">({bl_id}-{fl_id}-{rm_id})</div>' +
                        '<div style="margin-left:20px">{eq_std}</div></div>'),
                plugins: {
                    xclass: 'Ext.plugin.ListPaging',
                    autoPaging: false
                }
            }
        ]
    },

    applyRoomCodes: function (newRoomCodes) {
        var codes,
            titleText ='Tasks for Room {0}-{1}-{2}';
        if (newRoomCodes) {
            codes = newRoomCodes.split(';');
            this.setTitle(Ext.String.format(titleText, codes[0], codes[1], codes[2]));
        }
    }
});