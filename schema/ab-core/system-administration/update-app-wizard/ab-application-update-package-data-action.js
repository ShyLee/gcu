var packageDataController = View.createController('appUpdPackageData',{
	jobId: '',
	progressPanelWrapper:null,
	START_JOB:'Start Job',
	STOP_JOB:'Stop Job',
	progressControl: null,

	afterInitialDataFetch: function(){
		this.reportProgressPanel.removeSorting();
	},
	
	afterStartJob: function(jobId){
		// notify the progress panel
        this.progressPanelWrapper.onJobStarted(jobId);
	},
	afterJobFinished: function(status) {
	    // clear the progress panel status so that the job can be started again
	    this.progressPanelWrapper.clear();
    },

	reportProgressPanel_onProgressButton: function(row, action){
		View.confirm(getMessage('confirm_message'),function(button){
		if(button == 'yes'){
			packageDataController.startPackageData();
		}else{
			return;
			}
		});
	},
	
	startPackageData: function(){

		this.progressPanelWrapper = new Ab.progress.ProgressPanel(this.reportProgressPanel, this.afterJobFinished.createDelegate(this));
	
		if (!this.progressPanelWrapper.isJobStarted()) {
	
			AppUpdateWizardService.packageData({
				callback: function(jobId) {
					packageDataController.afterStartJob(jobId);
				},
				errorHandler: function(m, e) {
					Ab.view.View.showException(e);
				}
			});
			
		}else if (!this.progressPanelWrapper.isJobFinished()) {
            // if the job has not yet complete, then the user wants to stop the job
        	this.progressPanelWrapper.stopJob();
    	}
	}
});
