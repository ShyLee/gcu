var abGbFpDataS3OffSiteSrv_ctrl = View.createController('abGbFpDataS3OffSiteSrv_ctrl', {


	tabScope3_ctrl: View.getOpenerView().controllers.get('abGbFpDataS3_ctrl'),
	
	afterViewLoad: function(){
		this.setFieldsStyle();
	},
	
	setFieldsStyle: function(){
		this.abGbFpDataS3OffSiteSrv_methodology.getFieldLabelElement("field_CO2Emissions").style.fontWeight = "bold";
		this.abGbFpDataS3OffSiteSrv_methodology.getFieldLabelElement("field_NonCO2Emissions").style.fontWeight = "bold";
		this.abGbFpDataS3OffSiteSrv_methodology.getFieldLabelElement("gb_fp_s3_serv.kg_co2").style.fontWeight = "bold";
		this.abGbFpDataS3OffSiteSrv_methodology.getFieldLabelElement("gb_fp_s3_serv.emissions").style.fontWeight = "bold";
	
		for (var i = 1; i <= 2; i++) {
			var fld = document.getElementById("ShowabGbFpDataS3OffSiteSrv_methodology_field_empty_" + i);
			fld.style.borderTopStyle = "solid";
			fld.style.borderTopWidth = "thin";
		}
	},
    
    afterInitialDataFetch: function(){
    
        customizeUnitField(this.abGbFpDataS3OffSiteSrv_form, "gb_fp_s3_serv.units", "ELECTRICITY CONSUMPTION");
        
    },

	abGbFpDataS3OffSiteSrv_grid_onAddNew: function(){
		this.abGbFpDataS3OffSiteSrv_form.refresh(this.abGbFpDataS3OffSiteSrv_grid.restriction, true);
	},

	abGbFpDataS3OffSiteSrv_form_onSaveAndAddNew: function(){
		if(this.abGbFpDataS3OffSiteSrv_form_onSave())
			this.abGbFpDataS3OffSiteSrv_grid_onAddNew();
	},

	/**
     * Listener for 'save' action from 'abGbFpDataS3OffSiteSrv_form' panel
     */
	abGbFpDataS3OffSiteSrv_form_onSave: function(){
		this.abGbFpDataS3OffSiteSrv_form.fields.get("gb_fp_s3_serv.consumption").clear();
		
        if (!this.abGbFpDataS3OffSiteSrv_form.canSave())
        	return false;
        
        try {
            if (!convertUserEntry(this.abGbFpDataS3OffSiteSrv_form, "gb_fp_s3_serv.consumption_entry", "gb_fp_s3_serv.consumption", "gb_fp_s3_serv.units", "gb_fp_s3_serv.units_type")) {
                return false;
            }
           
            this.abGbFpDataS3OffSiteSrv_form.save();
            
            var bl_id = this.abGbFpDataS3OffSiteSrv_form.getFieldValue("gb_fp_s3_serv.bl_id");
            var calc_year = parseInt(this.abGbFpDataS3OffSiteSrv_form.getFieldValue("gb_fp_s3_serv.calc_year"));
            var scenario_id = this.abGbFpDataS3OffSiteSrv_form.getFieldValue("gb_fp_s3_serv.scenario_id");
            var source_id = parseInt(this.abGbFpDataS3OffSiteSrv_form.getFieldValue("gb_fp_s3_serv.source_id"));
			
            Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3OffSiteServers",bl_id, calc_year, scenario_id, source_id);
            
            this.abGbFpDataS3OffSiteSrv_grid.refresh();
        } 
        catch (e) {
            Workflow.handleError(e);
            return false;
        }
		
        return true;
	},
	
	/**
     * Listener for 'delete' action from 'abGbFpDataS3OffSiteSrv_form' panel
     */
	abGbFpDataS3OffSiteSrv_form_onDelete: function(){

		this.tabScope3_ctrl.dataController.onDeleteSource(this.abGbFpDataS3OffSiteSrv_form ,this.abGbFpDataS3OffSiteSrv_grid);
		
	}
	
});


/**
 * 'onclick' event listener for 'Methodology' row button.
 * 
 * @param {Object} row
 */
function onClickMethodology(row){
	
	try {
    
        var bl_id = row["gb_fp_s3_serv.bl_id"];
        var calc_year = parseInt(row["gb_fp_s3_serv.calc_year"]);
        var scenario_id = row["gb_fp_s3_serv.scenario_id"];
        var source_id = parseInt(row["gb_fp_s3_serv.source_id"]);
        
        var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3OffSiteServers",bl_id, calc_year, scenario_id, source_id);
        
        var dialogConfig = {
            closeButton: true
        };
        
        var methPanel = abGbFpDataS3OffSiteSrv_ctrl.abGbFpDataS3OffSiteSrv_methodology;
        
        methPanel.showInWindow(dialogConfig);
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gb_fp_s3_serv.source_id', source_id);
		
		methPanel.refresh(restriction);
		
        //set virtual fields
		if(result.data['message']){
			showInformationInForm(methPanel,result.data['message']);
		}
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_serv.emiss_fact', 'emiss_fact');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_serv.emiss_kgCO2', 'emiss_kgCO2');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_serv.CH4_emiss_fact', 'CH4_emiss_fact');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_serv.CH4_emiss_kg', 'CH4_emiss_kg');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_serv.CH4_gwp_fact', 'CH4_gwp_fact');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_serv.CH4_emiss_kgCO2', 'CH4_emiss_kgCO2');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_serv.N2O_emiss_fact', 'N2O_emiss_fact');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_serv.N2O_emiss_kg', 'N2O_emiss_kg');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_serv.N2O_gwp_fact', 'N2O_gwp_fact');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_serv.N2O_emiss_kgCO2', 'N2O_emiss_kgCO2');
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_serv.emiss_kgCO2_1000', 'emiss_kgCO2', true);
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_serv.CH4_emiss_kgCO2_1000', 'CH4_emiss_kgCO2', true);
		setVirtualFieldValue(result.data, methPanel, 'gb_fp_s3_serv.N2O_emiss_kgCO2_1000', 'N2O_emiss_kgCO2', true);
		
    } 
    catch (e) {
        Workflow.handleError(e);
    }
}


