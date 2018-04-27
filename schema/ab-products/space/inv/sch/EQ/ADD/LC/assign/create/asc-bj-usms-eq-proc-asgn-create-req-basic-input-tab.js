var ascBjUsmsProcAsgnCreateReqBasicInputTabController = View.createController("ascBjUsmsProcAsgnCreateReqBasicInputTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    rmcatOrType: "",
    rmcat:"",
	
    afterInitialDataFetch: function(){
    
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        //set the selected value of activity_log.activity_type
        this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.setFieldValue('activity_log.activity_type', "SD -设备报增");
        this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.setFieldValue('activity_log.prob_type', this.tabs.requestType);
        var dateRequested = USMS_getCurrentDate();
        this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.setFieldValue("activity_log.date_required", dateRequested);
        
        this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.show(true);
        $("activity_log.add_eq_id").disabled = true;
    },
    

    
    onBack: function(){
        View.getWindow('parent').View.setTitle("设备分配-报增申请");
        var tabName = 'selectTab';
        var tab = this.tabs.findTab(tabName);
        tab.loadView();
        this.tabs.selectTab(tabName);
        
    },
    
    onSubmit: function(){
    	var addEqId=this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.getFieldValue('activity_log.add_eq_id');
    	if(!valueExistsNotEmpty(addEqId)){
    		View.alert("请选择报增单号");
    		return;
    	}
            var record = this.getRecord();
            //submit request
            var restriction = this.submitRequest(record);
            if (restriction) {
            	//将add_eq表的status的值改为1
            	var addEqDs=View.dataSources.get('ascBjUsmsProcAddEqDs');
            	var addEqId=this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.getFieldValue('activity_log.add_eq_id');
                var AddEqRes=new Ab.view.Restriction();
                AddEqRes.addClause('add_eq.add_eq_id',addEqId,'=');
                var addEqRecord=addEqDs.getRecord(AddEqRes);
                addEqRecord.setValue('add_eq.status','1');
                addEqDs.saveRecord(addEqRecord);
                
            	this.selectNextTab(restriction);
            }
      //  }
    },
   
    
    getRecord: function(){
        var record = {};
        var ds = this.ascBjUsmsProcAsgnCreateReqBasicInputTabFormDS;
        var panel = View.panels.get("ascBjUsmsProcAsgnCreateReqBasicInputTabForm1");
        for (var i = 0; i < ds.fieldDefs.items.length; i++) {
        
            var fieldId = ds.fieldDefs.items[i].id;
            if (panel.containsField(fieldId)) {
                record[fieldId] = panel.getFieldValue(fieldId);
            }
            else {
                record[fieldId] = this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.getFieldValue(fieldId);
            }
        }
        
        return record;
    },
    
    submitRequest: function(record){
        try {
            result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0, record);
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
        var nextTab = this.tabs.findTab(nextTabName);
        nextTab.loadView();
        this.tabs.selectTab(nextTabName);
    }
});

function selectAddEqId(){
//	var addEqDs=View.dataSources.get('ascBjUsmsProcAddEqDs');
//	var records=addEqDs.getRecord();
//	var restriction = addEqDs.restriction;
//	    restriction.addClause("add_eq.dv_id", 
	var dvId=View.user.employee.organization.divisionId;
	var sql="add_eq.dv_id ='"+dvId+"' and add_eq.count =(select count(*) from add_eq_list where add_eq_id =add_eq.add_eq_id)";
	 View.selectValue({
	        formId: 'ascBjUsmsProcAsgnCreateReqBasicInputTabForm1',
	        title: 'Select Add Equipment Id',
	        fieldNames: ['activity_log.add_eq_id'],
	        selectTableName: 'add_eq',
	        selectFieldNames: ['add_eq.add_eq_id'],
	        visibleFieldNames: ['add_eq.add_eq_id', 'add_eq.eq_name', 'add_eq.count', 'add_eq.price', 'add_eq.date_purchased'],
	        restriction: sql,
	       actionListener: 'afterSelectAddEqId'
	    });
//    var blId = $("abScZhuzhaiCardForm_sc_zzfcardBl_id").value;
//    var flId = $("abScZhuzhaiCardForm_sc_zzfcardFl_id").value;
//    
//    if (blId == '') {
//        View.showMessage(getMessage('请先选择输入建筑名称！'));
//        return;
//    }
//    if (flId == '') {
//        View.showMessage(getMessage('请先选择输入建筑楼层！'));
//        return;
//    }
//    
   
}

function afterSelectAddEqId(fieldName, selectedValue, previousValue){
    var grid = View.panels.get("addEqGrid");
    var addEqGrid = View.panels.get("addEqGrid");
//    var res=new  new AFM.view.Restriction();
//	    res.addClause("add_eq.add_eq_id",selectedValue,'=');
//	   addEqGrid.refresh(res);
	//var addEqDS = View.dataSources.get("ascBjUsmsProcAsgnCreateReqBasicInputTabFormAddEqDs");
//	var record=addEqDS.getRecord(res);
//	var budgetItemId=record.getValue("add_eq.budget_item_id");
	    
	var restriction = new AFM.view.Restriction();
	    restriction.addClause("add_eq.add_eq_id",selectedValue,'=');
	    addEqGrid.refresh(restriction);
//    if (fieldName != undefined && selectedValue != undefined) {
//        panel.setFieldValue("activity_log.project_gp_id", selectedValue);
//    }
//    
//    var projectGroup = fieldName;
}

function showAddEquipmentGrid(addEqId){
    var grid = View.panels.get("addEqGrid");
    var res=new  Ab.view.Restriction();
	    res.addClause("add_eq.add_eq_id",selectedValue);
	var addEqDS = View.dataSources.get("ascBjUsmsProcAsgnCreateReqBasicInputTabFormAddEqDs");
	var record=addEqDS.getRecord(res);
	var budgetItemId=record.getValue("add_eq.budget_item_id");
	
	var restriction = new AFM.view.Restriction();
	restriction.addClause("add_eq.add_eq_id",addEqId,'=');
	grid.refresh(restriction);
//    if (fieldName != undefined && selectedValue != undefined) {
//        panel.setFieldValue("activity_log.project_gp_id", selectedValue);
//    }
//    
//    var projectGroup = fieldName;
}