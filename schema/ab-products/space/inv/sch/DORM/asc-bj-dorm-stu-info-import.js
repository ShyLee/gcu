
var importStudentController=View.createController('importStudentController',{
	wf_role_id:'AbSpaceRoomInventoryBAR-ImportStudentService-importData',
	importLocalFile: null,
	jobId: null,
	progressControl: null,
	year:null,
	xueyuan:null,
	zhuanye:null,
	uploadPanel:null,
	afterViewLoad:function(){
		this.uploadPanel=this.selectionPanel;
	},
	afterInitialDataFetch:function(){
	
	},
	//导入文件
	selectionPanel_onImport: function(){
		var fileObj = $('inLocalFileBrow');

		/*var yearValue =$('inLocalYear');
		if(yearValue.value==""){
			View.showMessage('error',"请输入年份");
			return;
		}*/
		if(fileObj.value == ""){
			View.showMessage('error', "请选择一个文件");
			return;
		}
		this.importLocalFile=fileObj;
		var tabPanel = this.importFileTabs;
		tabPanel.selectTab('importFileTabs_progress');
		this.buildProgressReport();
	},
    selectionPanel_onClose: function() {
        if (this.onClose) {
            this.onClose(this);
        }
        View.closeThisDialog();
    },
	reportProgressPanel_onClose: function() {
        if (this.onClose) {
            this.onClose(this);
        }
        View.closeThisDialog();
    },
    reportProgressPanel_onShow: function() {
    	this.tabs = View.getControlsByType(self, 'tabs')[0]; 
    	var stuInYear  =$('inLocalYear');
    	this.tabs.stuInYear = stuInYear.value;
    	var nextTabName = 'importFailTab';
    	this.tabs.selectTab(nextTabName,null,false,true,false);

    },
	buildProgressReport: function() {
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
		var list =Workflow.startJobWithUpload(this.wf_role_id, this.importLocalFile, this.afterDataTransferStarted, this, serverFileName, fileExt);
	},
	//调用WFR后的回调函数
	afterDataTransferStarted: function(result) {
	    this.jobId = result.message;
	    if(this.jobId == null){
	    	this.jobId = "错误";
	    }
	    this.showProgress.defer(500, this);
	    window.setTimeout(this.showCheckedData(),500);   
	},
	reportProgressPanel_onStartOver: function(){	
		//document.getElementById('inLocalFileBrow').value = "";
		//View.panels.items[3].setTabVisible('importFileTabs_progress', false);
		//View.panels.items[3].selectTab('importFileTabs_selection');
    	var tabPanel = this.importFileTabs;
		tabPanel.selectTab('importFileTabs_selection');
    },
 	showProgress: function() {
	    this.progressControl.setProgressAndRunTask(this.jobId);
		var restriction = View.getOpenerView().panels.get(this.panel_source).restriction;
		View.getOpenerView().panels.get(this.panel_source).refresh(restriction);
    }
});