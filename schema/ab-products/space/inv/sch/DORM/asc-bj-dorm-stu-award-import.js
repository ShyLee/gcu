var importDispStudentController=View.createController('importDispStudentController',{
	//wf_role_id:'AbSpaceRoomInventoryBAR-DispStudentHandler-importNewData',
	//wf_role_id:'AbSpaceRoomInventoryBAR-DispStudentHandler-importNewLightData',
	importLocalFile: null,
	jobId: null,
	radioButtonType:"other",
	progressControl: null,
	uploadPanel:null,
	afterViewLoad:function(){
		this.uploadPanel=this.selectionPanel;
	},
	selectionPanel_onImport:function(){
		var fileObj = $('inLocalFileBrow');
		if(fileObj.value == ""){
			View.showMessage('error', "请选择一个文件");
			return;
		}
		this.importLocalFile=fileObj;
		var tabPanel = this.importFileTabs;
		tabPanel.selectTab('importFileTabs_progress');
		this.buildProgressReport();
		
	},
	selectionPanel_onLast: function() {
		var tabPanel = this.importFileTabs;
		tabPanel.selectTab('importTypeTabs_selection');
    },
    selectionPanel_onClose: function() {
        if (this.onClose) {
            this.onClose(this);
        }
        View.closeThisDialog();
    },
    selectionTypePanel_onTypeImport:function(){
    	this.radioButtonType = getSelectedRadioButton("light");
    	if(this.radioButtonType=="lightOnline"){
    		//importFileTabs_selection.refresh();
    		this.selectionPanel.setTitle("[不熄灯]类型导入");
    	}else if(this.radioButtonType=="otherType"){
    		//importFileTabs_selection.refresh();
    		this.selectionPanel.setTitle("[其他]类型导入");
    	}
    	var tabPanel = this.importFileTabs;
		tabPanel.selectTab('importFileTabs_selection');
		var a;
    },
	reportProgressPanel_onClose: function() {
        if (this.onClose) {
            this.onClose(this);
        }
        View.closeThisDialog();
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
		if(this.radioButtonType=="lightOnline"){
			var wf_role_id = "AbSpaceRoomInventoryBAR-DispStudentHandler-importNewLightData";
		}else if(this.radioButtonType=="otherType"){
			var wf_role_id = "AbSpaceRoomInventoryBAR-DispStudentHandler-importNewData";
		}
		var list =Workflow.startJobWithUpload(wf_role_id, this.importLocalFile, this.afterDataTransferStarted, this,serverFileName, fileExt);
	},
	afterDataTransferStarted: function(result) {
	    this.jobId = result.message;
	    if(this.jobId == null){
	    	this.jobId = "错误";
	    }
	    this.showProgress.defer(500, this);
	    window.setTimeout(this.showCheckedData(),500);   
	},
 	showProgress: function() {
	    this.progressControl.setProgressAndRunTask(this.jobId);
		var restriction = View.getOpenerView().panels.get(this.panel_source).restriction;
		View.getOpenerView().panels.get(this.panel_source).refresh(restriction);
    },
    reportProgressPanel_onStartOver: function(){	
		//document.getElementById('inLocalFileBrow').value = "";
		//View.panels.items[3].setTabVisible('importFileTabs_progress', false);
		//View.panels.items[3].selectTab('importFileTabs_selection');
    	var tabPanel = this.importFileTabs;
		tabPanel.selectTab('importTypeTabs_selection');
    }
});

function getSelectedRadioButton(name){
    var radioButtons = document.getElementsByName(name);
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked == 1) {
            return radioButtons[i].value;
        }
    }
    return "";
}