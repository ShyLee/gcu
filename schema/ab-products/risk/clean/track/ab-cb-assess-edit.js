var abCbAssesssSamplesHideForWorker = (View.taskInfo.taskId == 'Manage My Hazard Abatement Items' || View.taskInfo.taskId == 'Manage My Abatement Activity Items') ? true : false;
/**
 * Controller implementation.
 */
var abCbAssessEditCtrl = View.createController('abCbAssessEditCtrl', {
	//page task mode - from where is called
	taskMode: null,

	// selected project id
	projectId: null,
	
	// project prob_type
	projProbType: null,

	// main controller
	mainControllerId: null,
	
	// selected assessment 
	activityLogId: -100,
	
	// if is new record
	isNewRecord: true,
	
	//page mode if is called from survey item list
	pageMode: null,
	
	// calbackMethod
	callbackMethod: null,
	
	afterViewLoad: function(){
		// set some label bold 
		var elem = document.getElementById('abCbAssessAddEditForm_labelLocation_labelCell');
		if(elem){
			elem.style.fontWeight = 'bold';
		}
		var elem = document.getElementById('abCbAssessAddEditForm_labelSurvey_labelCell');
		if(elem){
			elem.style.fontWeight = 'bold';
		}
		var elem = document.getElementById('abCbAssessAddEditForm_labelHazard_labelCell');
		if(elem){
			elem.style.fontWeight = 'bold';
		}
		var elem = document.getElementById('abCbAssessAddEditForm_labelDates_labelCell');
		if(elem){
			elem.style.fontWeight = 'bold';
		}
		
	},
	
	afterInitialDataFetch: function(){
		
		// we must read variables from main page
		if(valueExists(this.view.parentTab)){
			if (valueExists(this.view.parentTab.taskMode)){
				this.taskMode = this.view.parentTab.taskMode;
			}
			if (valueExists(this.view.parentTab.mainControllerId)){
				this.mainControllerId = this.view.parentTab.mainControllerId;
			}
		}
		if(valueExists(this.mainControllerId) || valueExistsNotEmpty(this.pageMode)){
			// do some initializations here
			if(this.pageMode == "survey"){
				// we need to remove some actions
				this.abCbAssessAddEditForm.actions.get("saveAndNew").show(false);
			}else{
				var parentCtrl  = View.getView('parent').controllers.get(this.mainControllerId);
				this.projectId = parentCtrl.projectId;
				this.projProbType = parentCtrl.projProbType;
				this.activityLogId = parentCtrl.activityLogId;
			}
			this.isNewRecord = (this.activityLogId < 0);
			// refresh panels
			var restriction = new Ab.view.Restriction();
			restriction.addClause("activity_log.project_id", this.projectId, "=");

			if(this.isNewRecord){
				restriction.addClause('activity_log.prob_type', this.projProbType, '=');
			}else{
				restriction.addClause("activity_log.activity_log_id", this.activityLogId, "=");
			}
			this.abCbAssessAddEditForm.refresh(restriction, this.isNewRecord);
			
			// on Add New, initialize site and building from the project
			if(this.isNewRecord){
				initFormFromProject(this.projectId, this.abCbAssessAddEditForm);
			}
		}
	},
	
	/**
	 * initialize view based on task mode layout and if is a new assessment.
	 */
	setTaskModeLayout: function(taskMode, isNewRecord){
		switch(taskMode){
			case "assessor":
				{
					// field assessor
					// make some fields readOnly
					this.abCbAssessAddEditForm.enableField('activity_log.date_closed', false);
					this.abCbAssessAddEditForm.enableField('activity_log.assessed_by', false);
					this.abCbAssessAddEditForm.enableField('activity_log.assigned_to', false);
					this.abCbAssessAddEditForm.enableField('activity_log.hcm_abate_by', false);
					break;
				}
			case "worker":
				{
					// abatement worker
					// make some fields readOnly
					if(!isNewRecord){
						this.abCbAssessAddEditForm.enableField('activity_log.date_closed', false);
						this.abCbAssessAddEditForm.enableField('activity_log.assessed_by', false);
						this.abCbAssessAddEditForm.enableField('activity_log.assigned_to', false);
						this.abCbAssessAddEditForm.enableField('activity_log.hcm_abate_by', false);
						
						this.abCbAssessAddEditForm.enableField('activity_log.date_assessed', false);
						this.abCbAssessAddEditForm.enableField('activity_log.date_review', false);
						this.abCbAssessAddEditForm.enableField('activity_log.prob_type', false);
						
						this.abCbAssessAddEditForm.enableField('activity_log.date_required', false);
						this.abCbAssessAddEditForm.enableField('activity_log.date_started', false);
						this.abCbAssessAddEditForm.enableField('activity_log.date_verified', false);
						this.abCbAssessAddEditForm.enableField('activity_log.date_completed', false);
						this.abCbAssessAddEditForm.enableField('activity_log.cost_estimated', false);
						this.abCbAssessAddEditForm.enableField('activity_log.cost_actual', false);
						this.abCbAssessAddEditForm.enableField('activity_log.cost_est_cap', false);
						this.abCbAssessAddEditForm.enableField('activity_log.cost_act_cap', false);
						break;
					}
				}
			default:
			{
				// hazard manager
			}
		}
	},
	
	/**
	 * Initializes Abatement Worker field with the logged in user abatement worker, for a new assessment
	 */
	initAbatementWorker: function(){
		if(!this.isNewRecord || this.taskMode != "worker"){
			return;
		}
		
		// create restriction
		var projProbType = this.abCbAssessAddEditForm.getFieldValue('activity_log.prob_type');
		var restriction = getProbTypeRestriction("cb_accredit_person.prob_type", projProbType);
		restriction.addClause('cb_accredit_person.em_id', View.user.employee.id, '=');
		
	    var parameters = {
	            tableName: 'cb_accredit_person',
	            fieldNames: toJSON(['cb_accredit_person.person_id']),
	            restriction: toJSON(restriction)
	        };
	    
		try{
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if(result.code == "executed" && result.data.records.length > 0){
				var abatementWorker = result.data.records[0]['cb_accredit_person.person_id'];
				
				this.abCbAssessAddEditForm.setFieldValue("activity_log.hcm_abate_by", abatementWorker);
			}
		}catch (e){
			Workflow.handleError(e);
		}
	},
	
	abCbAssessAddEditForm_afterRefresh: function(){
		// set task mode layout
		this.setTaskModeLayout(this.taskMode, this.isNewRecord);
		this.initAbatementWorker();
		this.abCbAssessAddEditForm.setFieldTooltip("activity_log.cond_value", getMessage("tooltipScoreboardOnly"));
		this.abCbAssessAddEditForm.setFieldTooltip("activity_log.cond_priority", getMessage("tooltipScoreboardOnly"));
	},
		
	/**
	 * Assessment edit Save and New handler.
	 */
	abCbAssessAddEditForm_onSaveAndNew: function(){
		this.abCbAssessAddEditForm_onSave(true)
	},
	
	/**
	 * Assessment edit Save handler.
	 */
	abCbAssessAddEditForm_onSave: function(addNew){
		var controller = this;
		
		if(this.validateForm() && this.abCbAssessAddEditForm.save()){
			// need a break to let the save message be displayed
			setTimeout(function(){
			
				// if was new record we must update initial assessment id
				var activityLogId = controller.abCbAssessAddEditForm.getFieldValue("activity_log.activity_log_id");
				var assessmentId = controller.abCbAssessAddEditForm.getFieldValue("activity_log.assessment_id");
				// update assessment id if is new record
				var newSurveyKey = "";
				if(!valueExistsNotEmpty(assessmentId)){
					controller.abCbAssessAddEditForm.setFieldValue("activity_log.assessment_id", activityLogId);
					
					var ds = controller.abCbAssessAddEditForm.getDataSource();
					var record = new Ab.data.Record({
						'activity_log.activity_log_id': activityLogId,
						'activity_log.assessment_id': activityLogId
					}, false);
					
					record.setOldValue('activity_log.activity_log_id', activityLogId);
					record.setOldValue('activity_log.assessment_id', '');
					
					
					try{
						ds.saveRecord(record);
						controller.abCbAssessAddEditForm.setFieldValue("activity_log.assessment_id", activityLogId);
						newSurveyKey = activityLogId;
					}catch(e){
						Workflow.handlerError(e);
						return false;
					}
				}
				// if page mode is survey we must refresh parent list and exit
				if(controller.pageMode == "survey"){
	    			if (controller.callbackMethod && typeof(controller.callbackMethod) == "function"){
	    				controller.callbackMethod.call(controller, newSurveyKey);
	    			}
				}
				// if we must add new record
				var parentCtrl  = View.getView('parent').controllers.get(controller.mainControllerId);
				if(parentCtrl){
					// refresh main list
					controller.refreshMainList();
					
					if(valueExists(addNew) && addNew.constructor == Boolean && addNew){
						// refresh to new record
						controller.abCbAssessAddEditForm.refresh(new Ab.view.Restriction({
							'activity_log.project_id': controller.projectId, 
							'activity_log.prob_type': controller.projProbType}), true);
						// on Save and Add New, initialize site and building from the project
						initFormFromProject(controller.projectId, controller.abCbAssessAddEditForm);
						controller.activityLogId = -100;
						controller.isNewRecord = true;
						// enable tabs for new
						parentCtrl.enableTabsFor('new', 'abCbAssessEditTab_1');
					}else{
						controller.activityLogId = activityLogId;
						parentCtrl.activityLogId = controller.activityLogId;
						// get information
						parentCtrl.activityLogInfo.reset();
						
						var panel = controller.abCbAssessAddEditForm;
						for(prop in parentCtrl.activityLogInfo){
							if(prop != "reset"){
								var propValue  = panel.getFieldValue('activity_log.'+prop);
								var propTitle = panel.fields.get('activity_log.'+prop).fieldDef.title;
								parentCtrl.activityLogInfo[prop].value = propValue;
								parentCtrl.activityLogInfo[prop].label = propTitle;
							}
						}
						parentCtrl.assessmentRow = panel.getRecord().values;
						//enable tabs for edit
						parentCtrl.enableTabsFor('edit', 'abCbAssessEditTab_1');
					}
				}
			
			}, 3000);
		}
	},
	
	validateForm: function(){
		var form = this.abCbAssessAddEditForm;
		form.clearValidationResult();
		if(form){
			var site_id = form.getFieldValue("activity_log.site_id");
			var bl_id = form.getFieldValue("activity_log.bl_id");
			if(!validateSiteAndBldg(site_id, bl_id)){
				return false;
			}
			// check dated
			// date_completed <= date_verified <= date_closed
			if(!compareDates(form, 'activity_log.date_completed', 'activity_log.date_verified', 'msg_field_smaller_or_equal_than', "<=")){
				return false;
			}
			if(!compareDates(form, 'activity_log.date_verified', 'activity_log.date_closed', 'msg_field_smaller_or_equal_than', "<=")){
				return false;
			}
			if(!compareDates(form, 'activity_log.date_completed', 'activity_log.date_closed', 'msg_field_smaller_or_equal_than', "<=")){
				return false;
			}
		}
		return true;
	},
	
	/**
	 * Copy as new record.
	 */
	abCbAssessAddEditForm_onCopyAsNew: function(){
		if(this.abCbAssessAddEditForm.newRecord){
			View.showMessage(getMessage("error_copy_as_new"));
			return false;
		}
		if(!this.validateForm()){
			return false;
		}
		var record = this.abCbAssessAddEditForm.getRecord();
		// refresh to new record
		this.abCbAssessAddEditForm.refresh(new Ab.view.Restriction({'activity_log.project_id': this.projectId}), true);
		this.abCbAssessAddEditForm.fields.each(function(field){
			var fieldName = field.fieldDef.fullName;
			if(!field.fieldDef.isDocument && fieldName != "activity_log.assessment_id" && !field.fieldDef.primaryKey){
				var fieldValue = record.getValue(fieldName);
				if(field.fieldDef.isDate){
					fieldValue = record.getLocalizedValue(fieldName);
				}
				field.panel.setFieldValue(fieldName, fieldValue);
			}
		});
		// reset main variables for new record
		var parentCtrl  = View.getView('parent').controllers.get(this.mainControllerId);
		if(parentCtrl){
			parentCtrl.enableTabsFor('new', 'abCbAssessEditTab_1');
		}
		this.activityLogId = -100;
		this.isNewRecord = true;
	},
	
	/*
	 * Delete event handler.
	 */
	abCbAssessAddEditForm_onDelete: function(){
		if(!this.abCbAssessAddEditForm.newRecord){
			var pKey  =  this.abCbAssessAddEditForm.getFieldValue("activity_log.activity_log_id");
			var confirmMessage = getMessage('confirm_delete').replace('{0}', pKey);
			var controller = this;
			var ds = this.abCbAssessAddEditForm.getDataSource();
			View.confirm(confirmMessage, function(button) { 
			    if (button == 'yes') { 
			    	try{
			    		ds.deleteRecord(new Ab.data.Record({"activity_log.activity_log_id": pKey}, false));
			    		if(controller.pageMode == "survey"){
			    			if (controller.callbackMethod && typeof(controller.callbackMethod) == "function"){
			    				controller.callbackMethod.call();
			    				controller.abCbAssessAddEditForm_onCancel();
			    			}
			    		}else{
				    		controller.activityLogId = -100;
				    		controller.isNewRecord = true;
				    		controller.afterInitialDataFetch();
				    		controller.abCbAssessAddEditForm_onCancel();
			    		}
			    		controller.refreshMainList();
			    	}catch(e){
			    		Workflow.handleError(e);
			    		return false;
			    	}
			    } 
			});
			
		}
	},
	
	/*
	 * Cancel event handler
	 */
	abCbAssessAddEditForm_onCancel: function(){
		if(this.pageMode == "survey"){
			this.abCbSurveyListTabs.selectTab("abCbSurveyListTab_1");
			this.abCbSurveyListTabs.enableTab("abCbSurveyListTab_2", false)
		}else {
			var parentCtrl  = View.getView('parent').controllers.get(this.mainControllerId);
			if(parentCtrl){
				parentCtrl.enableTabsFor("initForProject", "abCbAssessEditTab_1");
			}
		}
	},
	
	refreshMainList: function(){
		var parentCtrl  = View.getView('parent').controllers.get(this.mainControllerId);
		if (parentCtrl) {
			var assessItemsTab = parentCtrl.abCbAssessItemsTabs.findTab('abCbAssessItemsTab_1');
			var assessList = assessItemsTab.getContentFrame().View.panels.get('abCbAssessAssessmentsList');
			if(assessList){
				assessList.refresh(assessList.restriction);
			}
		}
	}
});
