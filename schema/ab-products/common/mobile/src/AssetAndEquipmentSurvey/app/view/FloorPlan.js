Ext.define('AssetAndEquipmentSurvey.view.FloorPlan', {
    extend: 'Common.controls.DrawingControl',

    requires: ['Common.control.PanButton',
               'Common.control.ZoomButton'],

    xtype: 'taskFloorPlanPanel',

    config: {
       surveyId: null,
       title: 'Floor Plan',
       items: [
           {
               xtype: 'container',
               html: '<div style="margin:8px 0px 2px 60px;color:gray;font-size:0.8em;text-align: center">' +
                     'Select a highlighted room to list all tasks in that room, or to jump to that task if there is only one.</div>'
           },
           {
               xtype : 'container',
               itemId : 'taskFloorPlan',
               html : '<div id="taskFloorPlanSvgDiv" height="100%" width="100%"></div>'
           }
       ]
    },

    // TODO: Move loadDrawing to a controller
    loadDrawing : function(blId, flId) {

        var me = this,
            taskFloorDrawings = Ext.getStore('taskFloorDrawings');

        taskFloorDrawings.clearFilter();
        taskFloorDrawings.filter('bl_id', blId);
        taskFloorDrawings.filter('fl_id', flId);
        taskFloorDrawings.load(function (records) {
            if (records && records.length > 0) {
                var drawingData = records[0].data.svg_data;
                me.processSvg(me, 'taskFloorPlanSvgDiv', drawingData, [ {
                    'assetType' : 'rm',
                    'handler' : me.onClickRoom
                } ]);
            }
        });
    },

    onClickRoom : function(locationCodes) {
        // Get a reference to this view. It would be better if we could get
        // the event handler called with the view scope.
        var floorPlanPanel = Ext.ComponentQuery.query('taskFloorPlanPanel')[0];
        floorPlanPanel.fireEvent('roomtap', locationCodes, floorPlanPanel);
    },

    applyRecord: function (newRecord, oldRecord) {
        var data;

        if (newRecord) {
            data = newRecord.getData();
            this.loadDrawing(data.bl_id, data.fl_id);
        }
        this.callParent(arguments);
    }
});