var ascSchDefSchoolInfoController = View.createController('ascSchDefSchoolInfoController', {
	init:function(){
		var restriction={'sc_school.sch_id':1};
		this.abScDefSchForm.refresh(restriction);
	},
	afterInitialDataFetch:function(){
		this.init();
		var image_file = this.abScDefSchForm.getFieldValue("sc_school.photo1").toLowerCase();
		if (valueExistsNotEmpty(image_file)) {
			this.abScDefSchForm.showImageDoc('image_field', 'sc_school.sch_id', 'sc_school.photo1');
    	}else {
    		this.abScDefSchForm.fields.get('image_field').dom.src = null;
    		this.abScDefSchForm.fields.get('image_field').dom.alt = '';
    	}
	},
	abScDefSchForm_onSave:function(){
		var record=this.abScDefSchForm.getRecord();
		record.setValue("sc_school.sch_id",1);
		this.abScDefSchoolDS.saveRecord(record);
        var result={"message":"成功保存记录","detailedMessage":"成功保存记录"}
		this.abScDefSchForm.displayValidationResult(result);
	},
	abScDefSchForm_onTest:function(){
        var result;
        try {
            result = Workflow.callMethod('AbSpaceRoomInventoryBAR-RMBHandler2-test');
        } 
        catch (e) {
            Workflow.handleError(e);
        }
	}
});



