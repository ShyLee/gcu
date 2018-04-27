var packageExtController = View.createController('appUpdPackageExt',{
	jobId: '',
	progressPanelWrapper:null,
	
	packageExtRuleID: 'AbSystemAdministration-AppUpWizService-packageExtensions',
	
	afterInitialDataFetch: function(){
		this.reportProgressPanel.removeSorting();
	},

	afterJobStart: function(jobId){
		this.progressPanelWrapper.onJobStarted(jobId);	
	},
	
	afterJobFinished: function(status) {
	    // clear the progress panel status so that the job can be started again
	    this.progressPanelWrapper.clear();
    },

	reportProgressPanel_onProgressButton: function(row, action){
		View.confirm(getMessage('confirm_message'),function(button){
		if(button == 'yes'){
			packageExtController.startPackageData();
		}else{
			return;
			}
		});
	},
	
	startPackageData: function(){

		this.progressPanelWrapper = new Ab.progress.ProgressPanel(this.reportProgressPanel, this.afterJobFinished.createDelegate(this));
	
		if (!this.progressPanelWrapper.isJobStarted()) {
	
			AppUpdateWizardService.packageExtensions({
				callback: function(jobId) {
					packageExtController.afterJobStart(jobId);
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
	