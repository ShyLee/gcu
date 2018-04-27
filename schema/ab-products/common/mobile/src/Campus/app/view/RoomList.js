Ext.define('Campus.view.RoomList', {
    extend: 'Ext.dataview.List',

    xtype: 'roomsurveylist',

    config: {
        store: 'roomSurveyStore',
        emptyText: '<div style="text-align:center;padding:20px;margin:20px;color:dodgerblue">No Room Survey records for the selected Floor.<br>Select Survey or Add to Survey to retrieve the Survey records.</div>',
        itemTpl: '{bl_id} {fl_id} {rm_id} {rm_std}',
        plugins : {
            xclass : 'Ext.plugin.ListPaging',
            autoPaging : false
        }
    }


});