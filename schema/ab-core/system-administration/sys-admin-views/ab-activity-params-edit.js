
View.createController('activityParamsEdit', {
	afterInitialDataFetch: function(){
        this.onClick(true);
    },
    onClick: function(afterShow){
        if (this.abAfmActivityParams_topPanel.rows.length == 0) {
            this.abAfmActivityParams_bottomPanel.show(false);
            this.abAfmActivityParams_detailsPanel.show(false);
            return;
        }
        else {
            var panel = this.abAfmActivityParams_topPanel;
            var selectedIndex = -1;
            if (afterShow) {
                selectedIndex = 0;
            }
            else {
                selectedIndex = panel.selectedRowIndex;
            }
            
            var id = panel.rows[selectedIndex]["afm_activities.activity_id"];
            var restriction = new Ab.view.Restriction();
            restriction.addClause("afm_activity_params.activity_id", id, "=");
            this.abAfmActivityParams_bottomPanel.refresh(restriction, false);
        }
    },
	abAfmActivityParams_topPanel_onAbAfmActivityParams_reload: function() {
		try {
			Workflow.callMethod('AbSystemAdministration-ConfigHandlers-reloadActivityParameters');
			View.showMessage(getMessage('activityParametersReloaded'));
		} catch (e) {
			Workflow.handleError(e);
		}
	},

	abAfmActivityParams_detailsPanel_afterRefresh: function() {
	    var param_id = this.abAfmActivityParams_detailsPanel.getFieldValue("afm_activity_params.param_id");

	    var selectObj = document.getElementById("vf_param_value_memo");
	    if (param_id == "DataChangeEventTablesToLog") {
	        if(selectObj.parentNode.parentNode){
		    	this.abAfmActivityParams_detailsPanel.showField("afm_activity_params.param_value", false);
	        	selectObj.parentNode.parentNode.style.display = '';
	        	selectObj.value = this.abAfmActivityParams_detailsPanel.getFieldValue("afm_activity_params.param_value");
	        }
	    } else {
	        if (selectObj.parentNode.parentNode) {
	        	selectObj.parentNode.parentNode.style.display = 'none'; 
	        }
	        this.abAfmActivityParams_detailsPanel.showField("afm_activity_params.param_value", true);
	    }
	},
	
	abAfmActivityParams_detailsPanel_beforeSave: function() {
		var selectObj = document.getElementById("vf_param_value_memo");
		if (selectObj.parentNode.parentNode.style.display == "") {
			var value = selectObj.value;
			this.abAfmActivityParams_detailsPanel.setFieldValue("afm_activity_params.param_value", value);
		}
	}
});

