var ascBjUsmsProcAsgnCreateReqBasicInputTabController = View.createController("ascBjUsmsProcAsgnCreateReqBasicInputTabController", {
	
    //main tab object , used here for store some globle varible
    tabs: null,
    rmcatOrType: "",
    rmcat:"",
	
    afterInitialDataFetch: function(){
    
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        //set the selected value of activity_log.activity_type
        this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.setFieldValue('activity_log.activity_type', "SERVICE DESK - 设备管理");
        this.ascBjUsmsProcAsgnCreateReqBasicInputTabDestricptionForm.setFieldValue('activity_log.prob_type', this.tabs.requestType);
        var dateRequested = USMS_getCurrentDate();
        this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.setFieldValue("activity_log.date_required", dateRequested);
        
        this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.show(true);
    },
    
	showRtrDip: function(rtr_dip_id){
		var res = new  Ab.view.Restriction();
		res.addClause("return_dispose.rtr_dip_id",rtr_dip_id);
		this.returnDisposePanel.refresh(res);
		
		var res2 = new  Ab.view.Restriction();
		res2.addClause("eq_change.rtr_dip_id",rtr_dip_id);
		this.eqChangePanel.refresh(res2);
	},
    
    onBack: function(){
        View.getWindow('parent').View.setTitle("设备管理-设备处置");
        var tabName = 'selectTab';
        var tab = this.tabs.findTab(tabName);
        tab.loadView();
        this.tabs.selectTab(tabName);
        
    },
    
    onSubmit: function(){
    	var rtr_dip_id=this.ascBjUsmsProcAsgnCreateReqBasicInputTabForm1.getFieldValue('activity_log.rtr_dip_id');
    	if(!valueExistsNotEmpty(rtr_dip_id)){
    		View.alert("请选择处置单号");
    		return;
    	}
            var record = this.getRecord();
            //submit request
           var restriction = this.submitRequest(record);
            if (restriction) {
            	//将add_eq表的status的值改为1
            	var dispose_DS=View.dataSources.get('dispose_DS');

                var dispose_Res=new Ab.view.Restriction();
                dispose_Res.addClause('return_dispose.rtr_dip_id',rtr_dip_id,'=');
                var dispose_Record=dispose_DS.getRecord(dispose_Res);
                dispose_Record.setValue('return_dispose.audit_status','1');
                dispose_DS.saveRecord(dispose_Record);
            	this.selectNextTab(restriction);
            }

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
function afterSelectRtrDipId(fieldName, selectedValue, previousValue){
	ascBjUsmsProcAsgnCreateReqBasicInputTabController.showRtrDip(selectedValue);
}