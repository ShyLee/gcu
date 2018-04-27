var editController = View.createController('editController',{
	wf_role_id:'AbSpaceRoomInventoryBAR-HouseService-checkDiffOfActualAndCalculateRent',
	//核查文件 
	importLocalFile: null,
	jobId: null,
	progressControl: null,
	//核查年月
	yearMonth: null,
	diffPanel:null,
	uploadPanel:null,
	afterViewLoad:function(){
		this.diffPanel=this.diffRecords;
		this.uploadPanel=this.selectionPanel;
	},
	afterInitialDataFetch:function(){
		var currentDate = ASBT_getCurrentDate_Client();
		var currentYearMonth=ASBT_getYearMonthOfDate(currentDate);
		$("yearMonth").value=currentYearMonth;
		$("time").value=currentDate;
	},
	selectionPanel_onHistory:function(){
		alert(1);
		var tabs =  View.panels.get('importFileTabs'); 
	    var nextTabName = 'checkhistoryPanel';
	    var tab = tabs.findTab(nextTabName);
        tab.loadView();
        tabs.selectTab(nextTabName);
	},
//	editDiff_onSave:function(){
//
//		this.editDiff.save();
//		this.editDiff.refresh();
//	},
	
	selectionPanel_onDownload:function(){
		var src=View.project.projectGraphicsFolder + '/model/HouseRentCheck.xls';
		window.open(src);
	},
	//导入文件
	selectionPanel_onImport: function(){
		var fileObj = $('inLocalFileBrow');
		if(fileObj.value == ""){
			View.showMessage('error', "请选择一个文件");
			return;
		}
		var yearMonthV = $("yearMonth").value;
		this.yearMonth = yearMonthV;
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
		Workflow.startJobWithUpload(this.wf_role_id, this.importLocalFile, this.afterDataTransferStarted, this,this.yearMonth, serverFileName, fileExt);
	},
	//显示不匹配的代扣房租记录
	showCheckedData:function(){
		var restriction = new Ab.view.Restriction(); 
		var month=this.yearMonth.substring(4);
		restriction.addClause("sc_zzfrent_details.month",month,"=");
		this.diffPanel.refresh(restriction);
		
		var ds = View.dataSources.get('sc_zzfrent_details_ds');
	    var records = ds.getRecords();
	    
	    if(records.toString()==""){
	    	alert("[本月,没有不匹配的代扣房租记录]");
	    	var tabs = View.panels.get('importFileTabs'); 
	    	tabs.selectTab('importFileTabs_selection');
	    	
	    }else{
	    	this.diffPanel.show(true);
	    }
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
 	showProgress: function() {
	    this.progressControl.setProgressAndRunTask(this.jobId);
		var restriction = View.getOpenerView().panels.get(this.panel_source).restriction;
		View.getOpenerView().panels.get(this.panel_source).refresh(restriction);
    },
    refreshHistoryPanel:function(){
		var restriction = new Ab.view.Restriction(); 
		var month=this.yearMonth.substring(4);
		restriction.addClause("sc_zzfrent_details.actual_payoff","sc_zzfrent_details.month_rent", "!="); 
		restriction.addClause("sc_zzfrent_details.month",month,"=");
		this.diffPanel.refresh(restriction);
		
		var ds = View.dataSources.get('sc_zzfrent_details_ds');
	    var records = ds.getRecords();
	    
	    if(records.toString()==""){
	    	View.alert("[本月,没有不匹配的代扣房租记录]");
	    	var tabs = View.panels.get('importFileTabs');
	    	tabs.selectTab('importFileTabs_selection');
	    	
	    }else{
	    	this.diffPanel.show(true);
	    }
    },
    refreshPanel:function(){
    	this.diffRecords.refresh();
    },
    xiuGai:function(){
        var cardGrid = View.panels.get( 'diffRecords');
        var selectedRowIndex = cardGrid.selectedRowIndex;
        var rows = cardGrid.rows[selectedRowIndex];
        var cardId = rows[ 'sc_zzfrent_details.card_id'];
      var restriction= new Ab.view.Restriction();
      restriction.addClause("sc_zzfrent_details.card_id" ,cardId,"=" );
      this.editDiff.refresh(restriction, false);
//    jQuery("#site_name"). val(siteName);
        this.editDiff.showInWindow({
                x:200,
            y:200,
            width:800,
            height:400
       });
    },
    //更新房租缴费截止日期
    reportProgressPanel_onUpdatePayLast:function(){
    	var yearmonth = document.getElementById("yearMonth").value;
    	
    	var year= yearmonth.substring(0,4);
    	var month = yearmonth.substring(4,6);
    	
    	var res2 = new Ab.view.Restriction();
    	res2.addClause("sc_zzfrent.year",year);
    	res2.addClause("sc_zzfrent.month",month,"=");
    	res2.addClause("sc_zzfrent.payement_to",'finance');
    	res2.addClause("sc_zzfrent.is_finish",'1');
    	var records2 = this.rentDs.getRecords(res2);
    	
    	if(records2.length==0){
    		View.alert("请确定"+month+"月记录已经封账，再完成本月缴费");
    		return;
    	}
    	
    	
    	var res1 = new Ab.view.Restriction();
    	res1.addClause("sc_zzfrent_details.year",year);
    	res1.addClause("sc_zzfrent_details.month",month,"<");
    	res1.addClause("sc_zzfrent_details.payement_to",'finance');
    	var records1 = this.rentDetDs.getRecords(res1);
    	
    	if(records1.length>0){
//    		View.alert("请确定"+month+"月之前的所有职工的【应缴房租】和【实缴房租】一致，再完成本月缴费");
//    		return;
    	}
    	
    	
    	
    	var res = new Ab.view.Restriction();
    	res.addClause("sc_zzfrent_details.year",year);
    	res.addClause("sc_zzfrent_details.month",month);
//    	res.addClause("sc_zzfrent_details.payement_to",'finance');
    	var records = this.rentDetDs.getRecords(res);
    	
    	if(records.length>0){
    		View.alert("请确定本月职工的【应缴房租】和【实缴房租】一致再完成本月缴费");
    		return;
    	}
    	
    	var result='';
    	
    	try {
            result = Workflow.callMethod('AbSpaceRoomInventoryBAR-ZZFHandler-updateDatePayLastFinance',yearmonth);
        }catch (e) {
            Workflow.handleError(e);
        }
        if (result.code == 'executed') {
            View.alert("【"+month+"月】财物代扣已核对完成！")
        }
        
    }

});