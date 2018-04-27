
View.createController('abScEditDvEmpAndStudentCountController', {
	
   openDvId:null,
   
   afterInitialDataFetch: function(){
		if (this.view.parameters){
        	this.openDvId = this.view.parameters['dvId'];
		
			if (this.openDvId) {
				var restriction = new Ab.view.Restriction();
				restriction.addClause("dv.dv_id",this.openDvId,"=");
				this.dv_detail.refresh(restriction);
	    	}
		}
    },
		
   dv_detail_onSave:function(){
        var panel = View.panels.get('dv_detail');
		AUSC_countEmpAndStudent(panel);
		panel.save();
		
		View.parameters.callback();

		// The .defer method used here is required for proper functionality with Firefox 2
		View.closeThisDialog.defer(100, View);
    }

});

function afterSelectEmployee(fieldName,selectedValue,previousValue){
	if (fieldName = "em.name"){
		var editForm = View.panels.get("dv_detail");
		editForm.setFieldValue("em.name", selectedValue);
	}
	 
}