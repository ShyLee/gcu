/**
 * View's controller
 */
var abEhsDefTrainingController = View.createController('abEhsDefTrainingCtrl',{
	savedCategoryId: null,
	
	recurringPatternCtrl : null,
	
	afterViewLoad:function(){
		this.recurringPatternCtrl = View.controllers.get("abRecurringPatternCtrl");
		
		this.abEhsDefTraining_treeCat.setTreeNodeConfigForLevel(0,           	
	            [{fieldName: 'ehs_training_cat.training_category_id'},                   
	             {fieldName: 'ehs_training_cat.description', length: 50}]);
	},
	
	afterInitialDataFetch: function(){
		this.recurringPatternCtrl.editRecurringRule.show(false);
	},
	
	/**
	 * Show the edit form, including the recurring part
	 */
	showEditForm: function(show, newRecord, cmdObject){
		this.abEhsDefTraining_form.show(show);
		this.recurringPatternCtrl.editRecurringRule.show(show);

		if (show) {
			this.abEhsDefTraining_form.refresh(cmdObject ? cmdObject.restriction : null, newRecord);
			this.initForm();
			
			if(this.abEhsDefTraining_form.getFieldValue('ehs_training.needs_refresh') == '1'){
				var recurringRule = this.abEhsDefTraining_form.getFieldValue("ehs_training.recurring_rule");
				this.recurringPatternCtrl.setRecurringPattern(recurringRule);
				this.abEhsDefTraining_form.enableField("ehs_training.date_recurrence_end", true);
			}else{
				//this.recurringPatternCtrl.pattern.enable(false);
				this.abEhsDefTraining_form.enableField("ehs_training.date_recurrence_end", false);
				
				this.recurringPatternCtrl.editRecurringRule.show(false);
			}
        }
	},
	
	abEhsDefTraining_form_afterRefresh: function(){
		this.recurringPatternCtrl.setRecurringPattern(this.abEhsDefTraining_form.getFieldValue("ehs_training.recurring_rule"));
	},
	
	abEhsDefTraining_form_beforeSave: function(){
		this.abEhsDefTraining_form.setFieldValue('ehs_training.recurring_rule', this.recurringPatternCtrl.getRecurringPattern());
		this.saveCategoryId();

		if(!this.checkNeedsRefresh())
			return false;
		
		return true;
	},
	
	/**
	 * Initialize the form with the category ID of the last clicked node in the tree 
	 */
	initForm: function(){
		var currentNode = this.abEhsDefTraining_treeCat.lastNodeClicked;
		if(currentNode){
			var categoryId = currentNode.data['ehs_training_cat.training_category_id'];
			if(!valueExistsNotEmpty(categoryId)){
				categoryId = currentNode.data['ehs_training.training_category_id'];
			}
			
			if(valueExistsNotEmpty(categoryId)){
				this.abEhsDefTraining_form.setFieldValue('ehs_training.training_category_id', categoryId);
			}
		}
	},
	
	/**
	 * Save the category ID of the current record in the form
	 */
	saveCategoryId: function(){
		this.savedCategoryId = this.abEhsDefTraining_form.getFieldValue('ehs_training.training_category_id');
	},
	
	/**
	 * Check if <Is Refresh Required?> is Yes and a recurrence has been chosen.
	 * If not, alert the user to choose a recurrence
	 */
	checkNeedsRefresh: function(){
		var needsRefresh = this.abEhsDefTraining_form.getFieldValue('ehs_training.needs_refresh');
		if(needsRefresh == "1"){
			//check that renewal frequency is described
			if(this.recurringPatternCtrl.pattern.getType() == "none"){
				View.showMessage(getMessage("selectRecurrence"));
				return false;
			}
			
			//check that one of the stop conditions is defined: Date End or End After[ ]Ocurrences or Once button selected
			/* PC not required after last changes to common code, default values of 5-10 years can be used if no stop condition is indicated
			if(!isRecurrenceEnd(this.abEhsDefTraining_form.getFieldValue("ehs_training.date_recurrence_end"), this.recurringPatternCtrl)){
				return false;
			}*/
		}
		
		return true;
	},
	
	/**
	 * Handle enabling and values for the Refresh fields and form
	 */
	onChangeNeedsRefresh: function(){
		var needsRefresh = this.abEhsDefTraining_form.getFieldValue('ehs_training.needs_refresh');
		if(needsRefresh == "1"){
			this.recurringPatternCtrl.editRecurringRule.show(true);
			
			this.recurringPatternCtrl.pattern.enable(true);
			this.abEhsDefTraining_form.enableField("ehs_training.date_recurrence_end", true);
		} else {
			this.recurringPatternCtrl.pattern.clear();
			//this.recurringPatternCtrl.pattern.enable(false);
			this.abEhsDefTraining_form.fields.get("ehs_training.date_recurrence_end").clear();
			this.abEhsDefTraining_form.enableField("ehs_training.date_recurrence_end", false);
			
			this.recurringPatternCtrl.editRecurringRule.show(false);
		}
	},
	
	/**
	 * Refreshes the tree and selects the saved category ID, if any
	 */
	refreshTreeAndSelect: function(){
		this.abEhsDefTraining_treeCat.refresh();
		
		var rootNode = this.abEhsDefTraining_treeCat.treeView.getRoot();
		if(valueExistsNotEmpty(this.savedCategoryId)){
			/* Search the node of the category id, to expand it */
	        for (var i = 0; i < rootNode.children.length; i++) {
	            var node = rootNode.children[i];
	            if (node.data['ehs_training_cat.training_category_id'] == this.savedCategoryId) {
	            	this.abEhsDefTraining_treeCat.expandNode(node);

	            	break;
	            }
	        }
		}
	}
})