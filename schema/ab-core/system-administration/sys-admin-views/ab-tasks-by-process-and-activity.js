/**
 * Controller for the View Tasks by Process and Activity view.
 */
var tasksProcessActivityController = View.createController('tasksProcessActivity', {
    
    // ----------------------- auto-wired event listeners -----------------------------------------
    
    /**
     * Handlers bottom selection panel row Delete button click event.
     */
    bottomSelectionPanel_delete_onClick: function(row, action) {
        var controller = this;
        var activityId = row.record['afm_processes.activity_id'];
        var processId = row.record['afm_processes.process_id'];
        var message = String.format(getMessage('ConfirmRemoveProcess'), processId);

        // ask user to confirm
        View.confirm(message, function(button) {
            if (button == 'yes') {
                try {
                    controller.removeProcess(activityId, processId);
                    controller.bottomSelectionPanel.refresh();
                } catch (e) {
                    var message = String.format(
                        getMessage('ErrorRemoveProcess'), processId);
                    View.showMessage('error', message, e.message, e.data);
                }
            } 
        });
    },
    
     /**
     * Handlers details panel row Delete button click event.
     */
    detailsPanel_deleteTask_onClick: function(row, action) {
        var controller = this;
        var activityId = row.record['afm_ptasks.activity_id'];
        var processId = row.record['afm_ptasks.process_id'];
        var taskId = row.record['afm_ptasks.task_id'];
        var message = String.format(getMessage('ConfirmRemoveTask'), processId, taskId);

        // ask user to confirm
        View.confirm(message, function(button) {
            if (button == 'yes') {
                try {
                    controller.removeTask(activityId, processId, taskId);
                    controller.detailsPanel.refresh();
                } catch (e) {
                    var message = String.format(
                        getMessage('ErrorRemoveTask'), processId, taskId);
                    View.showMessage('error', message, e.message, e.data);
                }
            } 
        });
    },
    
    // ----------------------- business logic methods: no UI code beyond this point ---------------
    
    /**
     * Removes specified process.
     */
    removeProcess: function(activityId, processId) {
       var record = new Ab.data.Record({
            'afm_processes.activity_id': activityId,
            'afm_processes.process_id': processId
        }, true);
        this.abViewdefReportDrilldownTwoLevel_ds_1.deleteRecord(record);
    },
    
     /**
     * Removes specified task.
     */
    removeTask: function(activityId, processId, taskId) {
        var record = new Ab.data.Record({
            'afm_ptasks.task_id': taskId,
            'afm_ptasks.activity_id': activityId,
            'afm_ptasks.process_id': processId
        }, true);
        this.abViewdefReportDrilldownTwoLevel_ds_2.deleteRecord(record);
    }
});
