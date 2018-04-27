var abImportBasePayCtrl = View.createController('abImportBasePayCtrl',{
	wf_role_id: 'AbAssetManagement-EquipmentImport-equipmentBudgetTransferIn',
	importLocalFile: null,
	jobId: null,
	progressControl: null,

	afterInitialDataFetch:function(){

	},
	selectionPanel_onImport: function(){
		var fileObj = $('inLocalFileBrow');

		if(fileObj.value == ""){
			View.showMessage('error', "请选择一个文件");
			return;
		}
		this.importLocalFile = fileObj;
		var tabPanel = this.importFileTabs;
		tabPanel.selectTab('importFileTabs_progress');
		this.buildProgressReport();
	},
	buildProgressReport: function() {
	
		// use all default configObj parameters
		var configObj = new Ab.view.ConfigObject();
		configObj.setConfigParameter("showResultFile", false);
		this.progressControl = new Ab.progress.ProgressReport('reportProgressPanel', configObj);
		this.progressControl.build();
		this.progressControl.setButtonText("停止导入");
	    this.startTransfer();
	},
	startTransfer: function(){
		var filePath =  "";
		filePath = this.importLocalFile.value.toLowerCase();
		var	fileExt = filePath.substr(filePath.lastIndexOf('.') + 1);
		var serverFileName = null;
		try{
		Workflow.startJobWithUpload(this.wf_role_id, this.importLocalFile, this.afterDataTransferStarted, this, serverFileName, fileExt);
		}catch(e){
			var a =1;
		}
		var b =1;
	},
	afterDataTransferStarted: function(result) {
	    this.jobId = result.message;
	    if(this.jobId == null){
	    	this.jobId = "错误";
	    }
	    this.showProgress.defer(1000, this);
    },
 	showProgress: function() {
	    this.progressControl.setProgressAndRunTask(this.jobId);
		var restriction = View.getOpenerView().panels.get(this.panel_source).restriction;
		View.getOpenerView().panels.get(this.panel_source).refresh(restriction);
    },
    reportProgressPanel_onStartOver: function(){	
		document.getElementById('inLocalFileBrow').value = "";
		View.panels.items[3].setTabVisible('importFileTabs_progress', false);
		View.panels.items[3].selectTab('importFileTabs_selection');
    }
});