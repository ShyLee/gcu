Ext.define('SpaceBook.view.RoomList', {
    extend: 'Ext.dataview.List',

    xtype: 'roomsurveylist',

    config: {
        store: 'roomSurveyStore',
        emptyText: ['<div style="text-align:center;padding:20px;margin:20px;color:dodgerblue">',
                    'There are no Survey Items for the selected floor.<br>',
                    'Select Add to Survey to generate Survey Items for this floor ',
                    'and add them to the current survey.</div>'].join(''),
        itemTpl: '{bl_id} {fl_id} {rm_id} {rm_std}',
        plugins : {
            xclass : 'Ext.plugin.ListPaging',
            autoPaging : false
        }
    }
});