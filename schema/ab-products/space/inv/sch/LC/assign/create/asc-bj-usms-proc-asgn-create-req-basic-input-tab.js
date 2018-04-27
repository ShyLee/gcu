var asgnCreateReqBasicInputTabController = View.createController("AsgnCreateBasicInputTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    rmcatOrType: "",
    rmcat:"",
    activityLogId:"",
    
    afterInitialDataFetch: function(){
       this.onStart();
    },
	onStart:function(){
		
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
		this.activityLogId=this.tabs.activityLogId;
		
		if(this.tabs.editType=="edit"){
			var restriction=new Ab.view.Restriction;
	    	restriction.addClause("activity_log.activity_log_id",this.activityLogId, "=");
			this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.refresh(restriction);
			this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.refresh(restriction);
		}else{
			this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.refresh([],true);
			//set the selected value of activity_log.activity_type
			this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.setFieldValue('activity_log.activity_type', this.tabs.activityTypeValue);
			this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.setFieldValue('activity_log.prob_type', this.tabs.probTypeValue);
			var dateRequested = USMS_getCurrentDate();
			var dvId=this.view.user.employee.organization.divisionId;
			var emId=this.view.user.name;
			var dvName=ASC_GetDvName(dvId);
			var emName=ASC_GetEmName(emId);
			this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.refresh([],true);
			this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.setFieldValue("activity_log.date_required", dateRequested);
			this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.setFieldValue("activity_log.created_name", emName);
			this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.setFieldValue("dv.dv_name", dvName);
			this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.setFieldValue("activity_log.prob_type",this.tabs.probTypeValue);
			this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.setFieldValue("activity_log.activity_type",this.tabs.activityTypeValue);
		}
	},
    
    onBack: function(){
        View.getWindow('parent').View.setTitle("房屋分配-申请");
        var tabName = 'selectTab';
        var tab = this.tabs.findTab(tabName);
        tab.show(true);
        tab.loadView();
        this.tabs.selectTab(tabName,[],false,true,false);
    },
    
    onSubmit: function(){
        //If all inputs are validate, create service request and show Attachment panel
        if (!this.checkInputFields()) {
            //get request record
            var record = this.getRecord();
            //submit request
            var restriction = this.submitRequest(record);
            if (restriction) {
                this.selectNextTab(restriction);
            }
        }
    },
    checkInputFields: function(){
        var isOK = true;
        
        this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.clearValidationResult();
        if(this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.canSave() && this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.validateFields()){
        	isOK = false;
        }
        return isOK;
    },
    getRecord: function(){
        var record = {};
        var ds = this.ascBjUsmsProcAsgnCreateReqBasicInputTabFormDS;
        var panel = this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1;
        for (var i = 0; i < ds.fieldDefs.items.length; i++) {
        
            var fieldId = ds.fieldDefs.items[i].id;
            var mainTableName=ds.mainTableName;
            var tableName=fieldId.substr(0,fieldId.indexOf('.'));
            if(mainTableName==tableName){
            	if (panel.containsField(fieldId)) {
            		record[fieldId] = panel.getFieldValue(fieldId);
            	}
            	else {
            		record[fieldId] = this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.getFieldValue(fieldId);
            	}
            }
        }
        return record;
    },
    submitRequest: function(record){
        try {
        	if(this.activityLogId!=""){
        		result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', this.activityLogId, record);
        	}else{
        		result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0, record);
        	}
            if (result.code == 'executed') {
                //get activity_log_id from result and create restriction 
                var restriction = new Ab.view.Restriction();
                restriction.addClause('activity_log.activity_log_id', eval('(' + result.jsonExpression + ')').activity_log_id, '=');
                return restriction;
            }
            else {
                return null;
            }
        } 
        catch (e) {
            Workflow.handleError(e);
            return null;
        }
    },
    selectNextTab: function(restriction){
        //select next tab and reload the tab view
        this.tabs.restriction = restriction;
        var nextTabName = 'attachTab';
		this.tabs.findTab(nextTabName).show(true);
		this.tabs.selectTab(nextTabName,restriction,false,true,false);
    }
});

function afterSelectRmType(fieldName, selectedValue, previousValue){
	var panel = View.panels.get("ascBjUsmsProcAsgnCreateReqBasicInputTabForm1");
	panel.setFieldValue(fieldName,selectedValue);
}
