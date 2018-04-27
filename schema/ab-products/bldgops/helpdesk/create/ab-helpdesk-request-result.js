
var resultController = View.createController("helpDeskDocsController",{
	afterInitialDataFetch: function() {
		this.inherit();
	},
	
	requestPanel_afterRefresh: function(){
		if(top.window.location.parameters["redlining"]){
			//disable Create New button when creating request from redlining view
			this.requestPanel.enableAction("new",false);
		}
		
		var record = this.requestPanel.getRecord();
		
		this.locationPanel.setRecord(record);
		this.equipmentPanel.setRecord(record);
		this.problemPanel.setRecord(record);
		this.documentsPanel.setRecord(record);
		
		this.locationPanel.show(true);
		this.equipmentPanel.show(true);
		this.problemPanel.show(true);
		this.documentsPanel.show(true);
		
		
		var act_type = this.problemPanel.getFieldValue("activity_log.activity_type");
		ABHDC_checkHiddenFields(act_type,this.equipmentPanel,this.locationPanel,this.documentsPanel,this.priorityPanel);
		
		ABHDC_hideEmptyDocumentPanel("activity_log",this.documentsPanel);
		
		var quest = new Ab.questionnaire.Quest(this.problemPanel.getFieldValue("activity_log.activity_type"), 'problemPanel', true);
		quest.showQuestions();
		
		ABHDC_showPriorityLevel("activity_log","activity_log_id","priority",this.problemPanel,"activity_log.priority");
		ABHDC_getStepInformation("activity_log","activity_log_id",this.requestPanel.getFieldValue("activity_log.activity_log_id"),this.historyPanel,"history",true);
	
		top.window.location.parameters["activity_log_id"] = 0;	
		top.window.location.parameters["questionnaire"] = null; 
		top.window.location.parameters["documents"] = null;
		top.window.location.parameters["locatie"] = null;
		top.window.location.parameters["equipment"] = null;
		top.window.location.parameters["required"] = null;
		top.window.location.parameters["prob_type"] = null;
		
	},
	
	historyPanel_afterRefresh: function(){
		ABHDC_reloadHistoryPanel(this.historyPanel);
    }
});


function createNew(){
	top.window.location.parameters["activity_log_id"] = 0;
	top.window.location.parameters["activity_type"] = null;
	//refresh the parent url.
	window.parent.location.href = window.parent.location.href;
}
