var abGbFpDataS3OutAct_ctrl = View.createController('abGbFpDataS3OutAct_ctrl', {


	tabScope3_ctrl: View.getOpenerView().controllers.get('abGbFpDataS3_ctrl'),

	afterViewLoad:function(){
		this.setFieldsStyle();
	},
	
	setFieldsStyle: function(){
		this.abGbFpDataS3OutAct_methodology.getFieldLabelElement("field_CO2Emissions").style.fontWeight = "bold";
	},
      
	abGbFpDataS3OutAct_grid_onAddNew: function(){
		this.abGbFpDataS3OutAct_form.refresh(this.abGbFpDataS3OutAct_grid.restriction, true);
	},
	
	abGbFpDataS3OutAct_form_onSaveAndAddNew: function(){
		if(this.abGbFpDataS3OutAct_form_onSave())
			this.abGbFpDataS3OutAct_grid_onAddNew();
	},

	/**
     * Listener for 'save' action from 'abGbFpDataS3OutAct_form' panel
     */
    abGbFpDataS3OutAct_form_onSave: function(){
    
        if (!this.abGbFpDataS3OutAct_form.canSave())
        	return false;
        
		try {
			this.abGbFpDataS3OutAct_form.save();
			
			var bl_id = this.abGbFpDataS3OutAct_form.getFieldValue("gb_fp_s3_outs.bl_id");
			var calc_year = parseInt(this.abGbFpDataS3OutAct_form.getFieldValue("gb_fp_s3_outs.calc_year"));
			var scenario_id = this.abGbFpDataS3OutAct_form.getFieldValue("gb_fp_s3_outs.scenario_id");
			var source_id = parseInt(this.abGbFpDataS3OutAct_form.getFieldValue("gb_fp_s3_outs.source_id"));
			
			
			Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3Outsourced", bl_id, calc_year, scenario_id, source_id);
			
			this.abGbFpDataS3OutAct_grid.refresh();
		}catch(e){
			Workflow.handleError(e);
			return false;
		}
        
        return true;
    },
	
	/**
     * Listener for 'delete' action from 'abGbFpDataS3OutAct_form' panel
     */
	abGbFpDataS3OutAct_form_onDelete: function(){

		this.tabScope3_ctrl.dataController.onDeleteSource(this.abGbFpDataS3OutAct_form ,this.abGbFpDataS3OutAct_grid);
		
	}
	
});


/**
 * 'onclick' event listener for 'Methodology' row button.
 * 
 * @param {Object} row
 */
function onClickMethodology(row){
	
	try {
    
        var bl_id = row["gb_fp_s3_outs.bl_id"];
        var calc_year = parseInt(row["gb_fp_s3_outs.calc_year"]);
        var scenario_id = row["gb_fp_s3_outs.scenario_id"];
        var source_id = parseInt(row["gb_fp_s3_outs.source_id"]);
        
        var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3Outsourced",bl_id, calc_year, scenario_id, source_id);
        
        var dialogConfig = {
            closeButton: true
        };
        
        var methPanel = abGbFpDataS3OutAct_ctrl.abGbFpDataS3OutAct_methodology;
        
        methPanel.showInWindow(dialogConfig);
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gb_fp_s3_outs.source_id', source_id);
		
		methPanel.refresh(restriction);
        
        //set virtual fields
		if(result.data['message']){
			showInformationInForm(methPanel,result.data['message']);
		}
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_outs.kWh_copy', 'kWh_copy');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_outs.energy_consumption', 'energy_consumption');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_outs.emiss_fact', 'emiss_fact');
		
    } 
    catch (e) {
        Workflow.handleError(e);
    }
}


