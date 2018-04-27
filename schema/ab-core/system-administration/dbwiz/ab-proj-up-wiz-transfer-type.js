var transferTypeController = View.createController('transferType_ctrl', {
	wizardController:null,
	afmTblsFilePath:null,
	afmTableTypesFileName:'afm_tbls_table_types.csv',
	
	afterInitialDataFetch:function(){
		this.wizardController = View.controllers.items[0];
		this.afmTblsFilePath = '/schema/ab-core/system-administration/dbwiz/'+this.afmTableTypesFileName;
		showOption();
	},
	
	updProjTransferType_onNext:function(){
		
		if(!this.isTablesTypesDefined()){
			var message = getMessage("confirmUpdateAfmTbls").replace('{path}', View.contextPath + this.afmTblsFilePath);
			View.confirm(message, function(button) {
			if (button == 'yes') {
				transferTypeController.checkExistsFile(transferTypeController.afmTblsFilePath);
			}else{
				goToNextTab(transferTypeController.wizardController.updProjWizTabs);
			}
		});
		}else{
			goToNextTab(this.wizardController.updProjWizTabs);
		}
	},
	
	afterCallJob:function(jobId){
		View.openJobProgressBar(getMessage('updateTableTypes'), jobId, '', function(status) {
			goToNextTab(transferTypeController.wizardController.updProjWizTabs);
		});
	},
	
	isTablesTypesDefined: function(){
		var isDefined = this.isTableTypesDefined_ds.getRecord().values['afm_tbls.is_defined'];
		if(!valueExistsNotEmpty(isDefined)){
			// for older DB.
			isDefined = this.isTableTypesDefined_ds.getRecord().records[0].values['afm_tbls.is_defined'];
		}
		return (isDefined == 1) ? true : false;
	},
	
	checkExistsFile: function(fileName){
			try {
				ProjectUpdateWizardService.fileExists(fileName,
										{
								callback: function(isFileExist) {
								transferTypeController.afterGetFileExist(isFileExist);
								},
								errorHandler: function(m, e) {
									View.showException(e);
								}
			});
			}catch (e) {
				Workflow.handleError(e);
			}
	},
	
	afterGetFileExist: function(isFileExist){
		if(isFileExist){
			try {
				ProjectUpdateWizardService.startUpdateTableTypesJob({
					callback: function(job_id) {
						transferTypeController.afterCallJob(job_id);
					},
					errorHandler: function(m, e) {
						View.showException(e);
					}
				});
			}catch (e) {
				Workflow.handleError(e);
			}
		}else{
			View.showMessage(this.afmTblsFilePath + ' file is missing');
		}
	}
});

function updateTransferTypeHelpLink(){
	if(transferTypeController.wizardController.transferOut){
		transferTypeController.updProjTransferType.actions.items[1].command.commands[0].file = getMessage('helpLinkTransferOut');
	}else if(transferTypeController.wizardController.transferIn){
		transferTypeController.updProjTransferType.actions.items[1].command.commands[0].file = getMessage('helpLinkTransferIn');
	}else{
		transferTypeController.updProjTransferType.actions.items[1].command.commands[0].file = getMessage('helpLinkPerformCompare');
	}
}

function checkTransferOut(){
	transferTypeController.wizardController.transferOut = true;
	transferTypeController.wizardController.transferIn = false;
	transferTypeController.wizardController.compare = false;
	showOption();
	//change panel title if visible
	setTabTitle('transferPanelTitle');
	hideMergeTab();
	hideCompareTab();
	updateTransferTypeHelpLink();
}
function checkTransferIn(){
	transferTypeController.wizardController.transferIn = true;
	transferTypeController.wizardController.transferOut = false;
	transferTypeController.wizardController.compare = false;
	showOption();
	//change panel title if visible
	setTabTitle('transferPanelTitle');
	hideCompareTab();
	updateTransferTypeHelpLink();
}
function checkCompare(){
	transferTypeController.wizardController.compare = true;
	transferTypeController.wizardController.transferOut = false;
	transferTypeController.wizardController.transferIn = false;
	showOption();
	//change panel title if visible
	setTabTitle('comparePanelTitle');
	hideMergeTab();
	showCompareTab();
	updateTransferTypeHelpLink();
}
function includeDelete(){
	if(document.getElementById("delete").checked){
		if(transferTypeController.wizardController.transferOut){
			transferTypeController.wizardController.deleteBeforeTransferOut = true;
		}else{
			transferTypeController.wizardController.deleteAfterTransferIn = true;
		}
	} else {
		if(transferTypeController.wizardController.transferOut){
			transferTypeController.wizardController.deleteBeforeTransferOut = false;
		}else{
			transferTypeController.wizardController.deleteAfterTransferIn = false;
		}
	}
}

function showOption(){
	var headTitle = document.getElementById("howToPerformTransfer_span");
	var deleteOption = document.getElementById("deleteOption_span");
	var checkB = document.getElementById("delete"); 

	if(transferTypeController.wizardController.transferOut || transferTypeController.wizardController.transferIn){
		// show head title
		$('howToPerformTransfer_span').innerHTML = getMessage('howToPerformTransfer');
		checkB.style.display = "";
		
		if(transferTypeController.wizardController.transferOut){
			// show transfer out option
			checkB.checked = true;
			$('deleteOption_span').innerHTML = getMessage('transferOutOption');
		}else{
			// show transfer in option
			checkB.checked = false;
			$('deleteOption_span').innerHTML = getMessage('transferInOption');
		}
	} else{
		// hide all
		$('howToPerformTransfer_span').innerHTML = '';
		$('deleteOption_span').innerHTML = '';
		checkB.style.display = "none";
	}
}
