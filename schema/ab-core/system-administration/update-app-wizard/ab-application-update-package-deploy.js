var appUpdPackageDeployController = View.createController('appUpdPackageDeploy',{
	openerPanel:null,
	openerController:null,
	packageButton: null,
	deployType: null,
	jobId: null,
	progressPanelWrapper: null,

	afterInitialDataFetch: function(){
		this.reportProgressPanel.removeSorting();
		this.deployType = View.getView("parent").controllers.items[0].deployType;
		this.updateTab(this.deployType);
	},
	
	afterViewLoad: function(){
		this.openerPanel = View.getOpenerView().panels.get('appUpdWizTabs');
	},
	
	appUpdPackageDeploy_onPackageDeployFile: function(){

		this.progressPanelWrapper = new Ab.progress.ProgressPanel(this.reportProgressPanel, this.afterJobFinished.createDelegate(this));
		var deployType = View.getView("parent").controllers.items[0].deployType;

		if (!this.progressPanelWrapper.isJobStarted()) {
			
			switch(deployType){
				case 'production_server':
					AppUpdateWizardService.packageDeployment(true, {
				        callback: function(jobId) {
				        	appUpdPackageDeployController.afterStartJob(jobId);
				        },
				        errorHandler: function(m, e) {
				            Ab.view.View.showException(e);
				        }
				    });
					break;
				case 'staging_server':
					AppUpdateWizardService.packageExtensions({
				        callback: function(jobId) {
				        	appUpdPackageDeployController.afterStartJob(jobId);
				        },
				        errorHandler: function(m, e) {
				            Ab.view.View.showException(e);
				        }
				    });
					break;
				case 'workgroup':
					AppUpdateWizardService.packageDeploymentWorkgroup({
				        callback: function(jobId) {
				        	appUpdPackageDeployController.afterStartJob(jobId);
				        },
				        errorHandler: function(m, e) {
				            Ab.view.View.showException(e);
				        }
				    });
					break;
			}
		}else if (!this.progressPanelWrapper.isJobFinished()) {
            // if the job has not yet complete, then the user wants to stop the job
        	this.progressPanelWrapper.stopJob();
        }
	},
	
	afterStartJob: function(jobId){
		// notify the progress panel
        this.progressPanelWrapper.onJobStarted(jobId);
	},
	
	afterJobFinished: function(status) {
	
		if (status.jobStatusCode == 3){
	    	// load review tab
			this.openerPanel.selectTab('wizardTabs_7');
			this.openerPanel.setTabEnabled('wizardTabs_6', false);
			this.openerPanel.showTab('wizardTabs_7', true);
		}
	    // clear the progress panel status so that the job can be started again
	    this.progressPanelWrapper.clear();
    },
		
	appUpdPackageDeploy_onBack: function(){
		var deployType = View.getView("parent").controllers.items[0].deployType;
		if(deployType == "production_server"){
			this.openerPanel.selectTab('wizardTabs_4');
			this.openerPanel.setTabEnabled('wizardTabs_6', false);
			this.openerPanel.showTab('wizardTabs_4', true);
			this.openerPanel.hideTab('wizardTabs_5', true);
		} else{
			this.openerPanel.selectTab('wizardTabs_5');
			this.openerPanel.setTabEnabled('wizardTabs_6', false);
			this.openerPanel.showTab('wizardTabs_5', true);
		}
	},
	
	updateTab: function(deployType){
		var actionButton = this.appUpdPackageDeploy.actions.items[1];
		if(deployType == "staging_server"){
			$('first_tr_label').innerHTML = getMessage('first_tr_ext');
			$('enterpriseDeploy_label').innerHTML = getMessage('enterprise_deploy');

			//change button title
			actionButton.setTitle(getMessage('button_package_extension'));	
			
			//change panel title
			this.appUpdPackageDeploy.setTitle(getMessage('title_package_extension'));
			
		}else if (deployType == "workgroup" || deployType == "production_server"){
			// populate tr
			$('first_tr_label').innerHTML = getMessage('first_tr_deploy');

			//change button title
			actionButton.setTitle(getMessage('button_package_deploy'));	

			//change panel title
			this.appUpdPackageDeploy.setTitle(getMessage('title_package_deploy'));
			
			if (deployType == "production_server"){
				$('enterpriseDeploy_label').innerHTML = getMessage('enterprise_deploy');
			}
		}
	}
	
});
