var abGbFpDataS3ContOwnVeh_ctrl = View.createController('abGbFpDataS3ContOwnVeh_ctrl', {


	tabScope3_ctrl: View.getOpenerView().controllers.get('abGbFpDataS3_ctrl'),
   	
	afterInitialDataFetch: function(){
    
        customizeUnitField(this.abGbFpDataS3ContOwnVeh_form, "gb_fp_s1_s3_mobile.units", "DISTANCE-MILES");
        
    },
    
	abGbFpDataS3ContOwnVeh_grid_onAddNew: function(){
		this.abGbFpDataS3ContOwnVeh_form.refresh(this.abGbFpDataS3ContOwnVeh_grid.restriction, true);
	},
    
	abGbFpDataS3ContOwnVeh_form_onSaveAndAddNew: function(){
		if(this.abGbFpDataS3ContOwnVeh_form_onSave())
			this.abGbFpDataS3ContOwnVeh_grid_onAddNew();
	},

	/**
     * Listener for 'save' action from 'abGbFpDataS3ContOwnVeh_form' panel
     */
	abGbFpDataS3ContOwnVeh_form_onSave: function(){
		this.abGbFpDataS3ContOwnVeh_form.fields.get("gb_fp_s1_s3_mobile.distance").clear();
		
        if (!this.abGbFpDataS3ContOwnVeh_form.canSave() || !validateVehicle(this.abGbFpDataS3ContOwnVeh_form,'Road'))
        	return false;
        
        
        try {
            if (!convertUserEntry(this.abGbFpDataS3ContOwnVeh_form, "gb_fp_s1_s3_mobile.distance_entry", "gb_fp_s1_s3_mobile.distance", "gb_fp_s1_s3_mobile.units", "gb_fp_s1_s3_mobile.units_type")) {
                return false;
            }
           
            this.abGbFpDataS3ContOwnVeh_form.save();
            
            var bl_id = this.abGbFpDataS3ContOwnVeh_form.getFieldValue("gb_fp_s1_s3_mobile.bl_id");
            var calc_year = parseInt(this.abGbFpDataS3ContOwnVeh_form.getFieldValue("gb_fp_s1_s3_mobile.calc_year"));
            var scenario_id = this.abGbFpDataS3ContOwnVeh_form.getFieldValue("gb_fp_s1_s3_mobile.scenario_id");
			var scope_cat = this.abGbFpDataS3ContOwnVeh_form.getFieldValue("gb_fp_s1_s3_mobile.scope_cat");
            var source_id = parseInt(this.abGbFpDataS3ContOwnVeh_form.getFieldValue("gb_fp_s1_s3_mobile.source_id"));
			
            
            Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope1Scope3Mobile",bl_id, calc_year, scenario_id, source_id, scope_cat);
            
            this.abGbFpDataS3ContOwnVeh_grid.refresh();
        } 
        catch (e) {
            Workflow.handleError(e);
            return false;
        }
            
        return true;
	},
	
	/**
     * Listener for 'delete' action from 'abGbFpDataS3ContOwnVeh_form' panel
     */
	abGbFpDataS3ContOwnVeh_form_onDelete: function(){

		this.tabScope3_ctrl.dataController.onDeleteSource(this.abGbFpDataS3ContOwnVeh_form ,this.abGbFpDataS3ContOwnVeh_grid);
		
	}
	
});

