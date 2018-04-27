Ext.define('AssetAndEquipmentSurvey.controller.FloorPlan', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            mainView: 'main',
            floorPlanView: 'taskFloorPlanPanel',
            taskListView: 'taskListPanel'
        },
        control: {
            floorPlanView: {
                roomtap: 'onRoomTap'
            }
        }
    },

    onRoomTap: function(roomCodes) {
        // Display the task list for the rooms or the task form if
        // there is only one task
        var surveyTaskStore = Ext.getStore('surveyTasksStore'),
            codes = roomCodes.split(';'),
            mainView = this.getMainView(),
            taskListView = this.getTaskListView(),
            surveyId = taskListView.getSurveyId(),
            taskRecordCount = 0;

        surveyTaskStore.clearFilter();
        surveyTaskStore.setDisablePaging(true);
        surveyTaskStore.filter('survey_id', surveyId);
        surveyTaskStore.filter('bl_id', codes[0]);
        surveyTaskStore.filter('fl_id', codes[1]);
        surveyTaskStore.filter('rm_id', codes[2]);
        surveyTaskStore.load(function (records) {
            surveyTaskStore.setDisablePaging(false);
            if (records) {
                taskRecordCount = records.length;
            }
            if (taskRecordCount === 0) {
                Ext.Msg.alert('Survey Tasks','There are no Survey Tasks for the selected room.');
                return;
            }
            if (taskRecordCount === 1) {
                var taskView = Ext.create('AssetAndEquipmentSurvey.view.Task', {displayPreviousNextButtons:false});
                taskView.setRecord(records[0]);
                mainView.push(taskView);
            } else {
                var roomTaskList = Ext.create('AssetAndEquipmentSurvey.view.RoomTaskList');
                roomTaskList.setRoomCodes(roomCodes);
                mainView.push(roomTaskList);
            }
        });
    }
});