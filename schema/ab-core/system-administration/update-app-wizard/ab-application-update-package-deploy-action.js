var packageDeployController =View.createController('appUpdPackageDeployment',{
	jobId: '',
	progressPanelWrapper:null,
	progressControl: null,
	
	afterInitialDataFetch: function(){
		this.reportProgressPanel.removeSorting();
	},

	afterJobFinished: function(status) {
	    //View.showMessage(getMessage('package_complete_message'));
	    
	    // clear the progress panel status so that the job can be started again
	    this.progressPanelWrapper.clear();
    },

	reportProgressPanel_onProgressButton: function(row, action){
		View.confirm(getMessage('confirm_message'),function(button){
		if(button == 'yes'){
			//var resultData = Workflow.callMethod(packageDeployController.checkFilesRuleID, 'mysite-data.war');
			//var resultExt = Workflow.callMethod(packageDeployController.checkFilesRuleID, 'mysite-extensions.war');
			//var resultArch = Workflow.callMethod(packageDeployController.checkFilesRuleID, 'archibus.war');
			
			AppUpdateWizardService.isFileExists('archibus.war', {
		        callback: function(fileExists) {
		        	packageDeployController.checkArchibusWarFile(fileExists);
		        },
		        errorHandler: function(m, e) {
		            Ab.view.View.showException(e);
		        }
		    });
		}else{
			return;
			}
		});
	},
	
	checkArchibusWarFile:function(fileExists){
		if (!fileExists){
			View.showMessage(getMessage('arch_file_missing_message'));
			return;
		}
		this.startPackageData();
	},
	
	startPackageData: function(){
		this.progressPanelWrapper = new Ab.progress.ProgressPanel(this.reportProgressPanel, this.afterJobFinished.createDelegate(this));
	
		if (!this.progressPanelWrapper.isJobStarted()) {
	
			AppUpdateWizardService.packageDeployment(false, {
		        callback: function(jobId) {
		        	packageDeployController.afterStartJob(jobId);
		        },
		        errorHandler: function(m, e) {
		            Ab.view.View.showException(e);
		        }
		    });

		}else if (!this.progressPanelWrapper.isJobFinished()) {
            // if the job has not yet complete, then the user wants to stop the job
        	this.progressPanelWrapper.stopJob();
    	}
	},
	
	afterStartJob:function(jobId){
		// notify the progress panel
        this.progressPanelWrapper.onJobStarted(jobId);
	}
});
