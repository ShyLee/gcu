Ab.namespace('progress');

/**
 * Wrapper for the grid panel that displays the progress bar.
 */
Ab.progress.ProgressPanel = Base.extend({
	
	// view panel that displays the progress report
	panel: '',
	
    // job ID
    jobId: '',
    
    // current job status
    status: null,
    
    // background task that refreshes the UI while the job is running
    progressTask: null,
    
    // task runner for that background task
    progressTaskRunner: null,
    
    // progress refresh interval in seconds
    progressRefreshInterval: 1,
    
    // Ab.paginate.ProgressReport instance
    progressReport: null,
    
    // custom application function to call when the job is finished
    callback: null,

    /**
     * Constructor.
     */
    constructor: function(panel, callback) {
	    this.panel = panel;
	    this.panel.sortEnabled = false;
	    
	    if (valueExists(callback)) {
	    	this.callback = callback;
	    }
    },
    
    /**
     * Called by the application code after the job has been started.
     */
    onJobStarted: function(jobId) {
    	// store the job ID
    	this.jobId = jobId;
        this.status = Workflow.getJobStatus(this.jobId);
        
        // create the progress bar based on the grid panel
        if (this.progressReport == null) {
            this.progressReport = new Ab.paginate.ProgressReport(this.panel, this.status, "6");
        }
        
        // start the background progress update task
        this.startProgressTask();
        
        // change the button title to Stop Job
        this.getJobButton().value = this.progressReport.PROGRESS_STOP_JOB;
    },
    
    /**
     * Starts the progress refresh background task using Ext.util.TaskRunner.
     */
    startProgressTask: function() {
    	var controller = this;
        this.progressTask = {
            run: function() {
        	    // get the job status and refresh the UI
                controller.status = Workflow.getJobStatus(controller.jobId);
                controller.progressReport.refresh(controller.status);
                
                // if the job has completed, stop the task
                if (controller.status.jobFinished) {
                    controller.progressTaskRunner.stop(controller.progressTask);

                    // if the callback is defined, call it
                    if (controller.callback) {
                    	controller.callback(controller.status);
                    }
                }
            },
            interval: 1000 * controller.progressRefreshInterval
        }
        this.progressTaskRunner = new Ext.util.TaskRunner();
        this.progressTaskRunner.start(this.progressTask);
    },
    
    /**
     * Stops the job and updates the UI.
     */
    stopJob: function() {
    	// stop the server job
        Workflow.stopJob(this.jobId);
        
        // stop the task runner
        this.progressTaskRunner.stop(this.progressTask);
        
        // get the result and update the progress bar
        var status = Workflow.getJobStatus(this.jobId);
        this.progressReport.refresh(status);

        // disable the Stop Job button
        this.getJobButton().disabled = true;
    },
    
    /**
     * Returns true if the job has been started.
     */
    isJobStarted: function() {
    	return valueExists(this.status);
    },
    
    /**
     * Returns true if the job has been finished.
     */
    isJobFinished: function() {
    	return valueExists(this.status) && this.status.jobFinished;
    },
    
    /**
     * Clears the last job status.
     */
    clear: function() {
    	this.jobId = null;
    	this.status = null;

        // change the button title to Start Job
        this.getJobButton().value = this.PROGRESS_START_JOB;
        
        // enable the Stop Job button
        this.getJobButton().disabled = false;
    },
    
    /**
     * Private: returns the Start Job / Stop Job button.
     */
    getJobButton: function() {
    	return $(this.panel.getParentElementId() + "_row0_progressButton");    
    },
    
	// ----------------------- constants -----------------------------------------------------------
	   
	 // @begin_translatable
	PROGRESS_START_JOB:  'Start Job'
	// @end_translatable
});
