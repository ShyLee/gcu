/**
 * @author Kevenxi
 */
var addResourceReservContentController = View.createController("addResourceReservContentController", {
   	hasAddOnResizeEvent: false,
     /**
     * a global parameters for holding varibale and values.
     */
    globalParameters: null,
    globalTimeline: 0,
    globalGrid: 0,
    arrTimeline: new Array(),
    timeName: new Array(),
    ResourceNatures: null,
    ResourceNaturesEnumlist: null, //kb#3028194: Added for showing localization values of enum list of field resource nature 
    ResourceInfo: null,
    /**
     * is click the Add button or the Edit button
     */
    isAdd: false,
    /**
     * the current resource
     */
    currentResource: null,
    /**
     * the resourceReservation of current editing
     */
    paramEventObj: null,
    /**
     * the paramEvent (Edit) index in the ResourcesReservation Array
     */
    paramEventIndex: -1,
    /**
     * the reources_nature index in the ResourceNatures Array
     */
    currentTabIndex: -1,
    /**
     * the index of the timeline where we'll add additional timezones information
     */
    currentTimelineIndex: -1,
	currentTimeline: null,
    /**
     *
     */
    eventToEdit: null,
    newEvent: null,
    existtimelinetz: false,
    timemarkstz: null,
    cancelledTimelineEvents: null,
    UniqueResourceNum: null,
    NonUniqueResourceNum: null,
    LastQuantity: 0,
    mainTabs: null,
    refreshCount: 0,
    
    afterInitialDataFetch: function(){
    	if (!valueExists(this.globalParameters)) {
			this.initParameters();
		}
		this.onStart();
		this.refreshCount++;
    },
    
	initParameters: function() {
	    this.resourceTimelineTabs.addEventListener('afterTabChange', this.onResourceTimelineTabChange.createDelegate(this));
        this.mainTabs = View.getControl('', 'createEditResevationTabs');
        this.globalParameters = View.getOpenerView().controllers.get(0);
	},
	
    /**
     *
     */
    selectResourceConsolePanel_afterRefresh: function(){
		if(this.refreshCount > 0) {
			this.onStart();		
		}
    },
    
    /**
     *
     */
    onStart: function(){
        this.selectResourceConsolePanel.actions.get("clear").enable(true);
        
		//Translate recurring option panel  
        ABRV_RPRES_initializeRecurringPanel('resource_recurring_panel', false);
        
		//Select additional timezone should be empty and disabled
        this.select_timezone.showHeader(false);
		this.select_timezone.show(true, false);
        this.select_timezone.setFieldValue('afm_timezones.timezone_id', '');
        this.select_timezone.enableField("afm_timezones.timezone_id", false);
		
        //Boolean indicating if selected timezone times are showed must be set to false
        this.existtimelinetz = false;
        
        this.hideAllResourceTimelineTab();
        
       
		this.getReservationInfo();
		//set the enable of next button
		this.existResources();
    },
    
    /**
     * convert form the method setUser(result)
     * @param {Object} result
     */
    getReservationInfo: function(){
        
        //Get the default console values for the user(case of New reservation
        var user = ABRV_getUserInfo();
        
        this.globalParameters.user = user;
        var objectsToSave = [user];
        var jsonExpression = toJSON(objectsToSave);
        
		var res_id = '';
		var jsonUser = jsonExpression;

		try{
			var results = Workflow.callMethod("AbWorkplaceReservations-room-getReservationInfo", res_id, jsonUser);
			this.setReservationInfo(results)
		}catch(e){
			Workflow.handleError(e);
		}
        
        if (valueExists(this.globalParameters.roomReservation)) {
            if (valueExists(this.globalParameters.roomReservation.rmres_id)) {
                if (this.globalParameters.roomReservation.rmres_id != "") {
                    this.lockFieldConsole();
                    this.selectResourceConsolePanel.actions.get("clear").enable(false);
                }
            }
        }
        
        if (valueExists(this.globalParameters.resourcesReservations)) {
            if (this.globalParameters.resourcesReservations.length > 0) {
                if (valueExists(this.globalParameters.resourcesReservations[0].rsres_id)
						&& this.globalParameters.resourcesReservations[0].rsres_id != "") {
                    this.lockFieldConsole();
                    this.selectResourceConsolePanel.actions.get("clear").enable(false);
                }
            }
        }
    },
	
    /**
     *
     * @param {Object} result
     */
    setReservationInfo: function(result){
		if (result.code != 'executed') {
            View.showMessage(result.message);
			return;
        }
        
	    if (result.message != "OK") {
			View.showMessage(result.message);
    		return;
	    }
        
		var GeneralInfo = eval("(" + result.jsonExpression + ")");
        var existGroupDESK_MANAGER = false;
		
        var groups = this.globalParameters.user.groups;
		for (var i = 0; i < groups.length; i++) {
            if (groups[i] == "RESERVATION SERVICE DESK" 
					|| groups[i] == "RESERVATION MANAGER" 
					|| groups[i] == "%") {
				existGroupDESK_MANAGER = true;
			}
        }
                
        if (existGroupDESK_MANAGER) {
            GeneralInfo.reservation.user_requested_by = "";
            GeneralInfo.reservation.user_requested_for = "";
            GeneralInfo.reservation.phone = "";
            GeneralInfo.reservation.email = "";
            GeneralInfo.reservation.dv_id = "";
            GeneralInfo.reservation.dp_id = "";
        }
		
        if (!valueExists(this.globalParameters.reservation)) {
            this.globalParameters.reservation = GeneralInfo.reservation;
            this.globalParameters.roomReservation = GeneralInfo.roomReservation;
            this.globalParameters.resourcesReservations = GeneralInfo.resourcesReservations;
            this.updateConsole();
	    } else {
			if (!valueExists(this.globalParameters.resourcesReservations)) {
				this.globalParameters.resourcesReservations = GeneralInfo.resourcesReservations;
				
				this.actionsPanel.actions.get("btnNext").enable(false);
				this.actionsPanel.actions.get("btnCancel").enable(false);
				
			} else {
				if (this.globalParameters.resourcesReservations.length > 0) 
					if (this.globalParameters.resourcesReservations[0].rsres_id != null &&
					this.globalParameters.resourcesReservations[0].rsres_id != "") {
						this.actionsPanel.actions.get("btnNext").enable(true);
						this.actionsPanel.actions.get("btnCancel").enable(true);
					}
			}
			
			this.updateConsole();
			this.selectResourceConsolePanel_onShowResources();
        }
    },
	
	
    /**
     * Updates console fields from the reservation JS object
     */
    updateConsole: function(){
        var reservation = this.globalParameters.reservation;
        this.selectResourceConsolePanel.setInputValue('bl.ctry_id', reservation.ctry_id);
        this.selectResourceConsolePanel.setInputValue('bl.site_id', reservation.site_id);
        this.selectResourceConsolePanel.setInputValue('reserve_rs.bl_id', reservation.bl_id);
        this.selectResourceConsolePanel.setInputValue('reserve.date_start', reservation.date_start[0]);
        this.selectResourceConsolePanel.setInputValue('reserve.time_start', reservation.time_start);
        this.selectResourceConsolePanel.setInputValue('reserve.time_end', reservation.time_end);
        
        //this.selectResourceConsolePanel.setInputValue('resources.resource_std', '');
        if (valueExists(reservation.resource_std)) {
            $('resources.resource_std').value = reservation.resource_std;
        }
		
		//see function in the file ab-rr-content-add-recurring-panel.js
		ABRV_RP_updateConsoleForRecurring("resource_recurring_panel", reservation);
    },
	
    /**
     * Lock console fields
     */
    lockFieldConsole: function(){
        this.selectResourceConsolePanel.enableField("bl.ctry_id", false);
        this.selectResourceConsolePanel.enableField("bl.site_id", false);
        this.selectResourceConsolePanel.enableField("reserve_rs.bl_id", false);
        this.selectResourceConsolePanel.enableField("reserve.date_start", false);
        this.selectResourceConsolePanel.enableField("reserve.time_start", false);
        this.selectResourceConsolePanel.enableField("reserve.time_end", false);
        this.selectResourceConsolePanel.enableField("reserve.date_start", false);
        this.selectResourceConsolePanel.enableField("reserve.res_type", false);
        
		$("resources.resource_std").disabled = true;
        $("onSelectResource_std").disabled = true;
		
	    if (this.globalParameters.reservation.res_type == "recurring") {
            this.resource_recurring_panel.enableField("reserve.date_end", false);
        }
    },
    /**
     * called when changing the tab of resource timeline
     * @param {Object} tabPanel
     * @param {Object} selectedTabName
     * @param {Object} newTabName
     */
    onResourceTimelineTabChange: function(tabPanel, selectedTabName, newTabName){
        if (newTabName) {
            var curTabIndex = newTabName.substr(12, 1);
            var layname = newTabName.substr(3);
        }
        else {
            var curTabIndex = selectedTabName.substr(12, 1);
            var layname = selectedTabName.substr(3);
        }
        showActiveLayer(layname);
        selectTablist(curTabIndex);
        buildNonUniqueResourcesList(curTabIndex);
        this.existResources();
        
    },
    
    /**
     * This function is called when clicking in the Search button
     */
    selectResourceConsolePanel_onShowResources: function(){
        if (this.testSearchStep()) {
            var consolePanel = this.selectResourceConsolePanel;
            if (ABRV_isMinnor(consolePanel.getFieldValue('reserve.time_start'), consolePanel.getFieldValue('reserve.time_end'))) {
                //Select additional timezone should be empty and disabled	
                this.select_timezone.setFieldValue('afm_timezones.timezone_id', '');
                this.select_timezone.enableField('afm_timezones.timezone_id', false);
                
                //Boolean indicating if selected timezone times are showed must be set to false
                this.existtimelinetz = false;
                this.removeSelectedNonUniqueResources();
				this.showResources("true");
				
				// KB#3025626
				// roll back for geting resolution from Core Team
				// this.showScrollBars();
            } else {
                View.showMessage(getMessage("selectTimeError"));
            }
        }
    },
    /**
     * This function is called when clicking in the Show Alternative button
     */
    selectResourceConsolePanel_onShowAlternatives: function(){
        if (this.testSearchStep()) {
            //Boolean indicating if selected timezone times are showed must be set to false
            this.existtimelinetz = false;
            
            this.removeSelectedNonUniqueResources();
            this.showResources("false");
			
			// KB#3025626
			// roll back for geting resolution from Core Team
			// this.showScrollBars();
        }
    },
	
	/**
	 * show the scroll bars, vertical bar and horizon bar as default
	 */
	showScrollBars: function() {
		//=================================
		var panel = View.getControl('', "viewContent");
		panel.frame.dom.style.height = 795;
		panel.frame.dom.style.width = 965;
		
		if(!this.hasAddOnResizeEvent) {
			this.hasAddOnResizeEvent = true;
			window.attachEvent("onresize", new function(){
				panel.frame.dom.style.height = 795;
				panel.frame.dom.style.width = 965;
			});
		}
	},
	
    /**
     * This function is called when clicking in the Clear button
     */
    selectResourceConsolePanel_onClear: function(){
        //Clear all the console field values	
        this.selectResourceConsolePanel.setFieldValue("bl.ctry_id", "");
        this.selectResourceConsolePanel.setFieldValue("bl.site_id", "", "");
        this.selectResourceConsolePanel.setFieldValue("reserve_rs.bl_id", "", "");
        this.selectResourceConsolePanel.setFieldValue("reserve.date_start", "", "");
        this.selectResourceConsolePanel.setFieldValue("reserve.time_start", "", "");
        this.selectResourceConsolePanel.setFieldValue("reserve.time_end", "", "");
        $("resources.resource_std").value = "";
        this.actionsPanel.actions.get("btnNext").enable(false);
        this.actionsPanel.actions.get("btnCancel").enable(false);
        showActiveLayer("");
        //writeLayer("tabsList", "", "");
        writeLayer("buildNonUniqueResourcesList", "", "");
        writeLayer('selectedNonUniqueResourcesList', '', "");
        //buildOnlyTitle();
        //added by keven begin 002
        this.hideAllResourceTimelineTab();
        //added by keven end 002
        if (this.globalParameters.reservation.res_id == "") {
            this.selectResourceConsolePanel.setFieldValue("reserve.res_type", "regular");
            //$("reserve.res_type").value = "regular";//guo added
            clearAndHideRecurringPanel();
        }
        this.cancelledTimelineEvents = null;//add by guo 2008-06-20
        //Select additional timezone should be empty and disabled	
        this.select_timezone.setFieldValue('afm_timezones.timezone_id', '');
        this.select_timezone.enableField("afm_timezones.timezone_id", false);
        //$('afm_timezones.timezone_id').disabled = true;
        //$('afm_timezones.timezone_id').nextSibling.disabled = true;
        
        //Boolean indicating if selected timezone times are showed must be set to false
        this.existtimelinetz = false;
    },
    /**
     * Check all mandatory fields are fill
     */
    testSearchStep: function(){
        var consolePanel = this.selectResourceConsolePanel;
        var ctry_id = consolePanel.getFieldValue("bl.ctry_id");
        var site_id = consolePanel.getFieldValue("bl.site_id");
        var bl_id = consolePanel.getFieldValue("reserve_rs.bl_id");
        var date_start = consolePanel.getFieldValue("reserve.date_start");
        
        if (ctry_id == "" || site_id == "" || bl_id == "" || date_start == "") {
			View.showMessage(getMessage("warningMessage"));
		
            if (ctry_id == "") {
				consolePanel.getFieldElement("bl.ctry_id").focus();
			} else if (site_id == "") {
				consolePanel.getFieldElement("bl.site_id").focus();
			} else if (bl_id == "") {
				consolePanel.getFieldElement("reserve_rs.bl_id").focus();
			} else {
				consolePanel.getFieldElement("reserve.date_start").focus();
			}
			
            return false;
        }
        var isOk = true; //guo added start
        if (consolePanel.getFieldValue("reserve.res_type") == "recurring") {
			var date_start = this.selectResourceConsolePanel.getFieldValue("reserve.date_start");
    		var date_end = this.resource_recurring_panel.getFieldValue("reserve.date_end");
            isOk = ABRV_RP_checkRecurringPanel(date_start, date_end);
        }
		
        return isOk;
    },
    
    /**
     *
     */
    removeSelectedNonUniqueResources: function(){
        if (!valueExists(this.globalParameters.resourcesReservations)) {
            return;
        }
        
        if (this.globalParameters.resourcesReservations.length > 0) {
            var resourcesReservations = this.globalParameters.resourcesReservations;
            var tempResourcesReservations = new Array();
            
            for (var i = 0; i < resourcesReservations.length; i++) {
                if (resourcesReservations[i].rsres_id) {
                    var event = new Object();
                    event.date_start = resourcesReservations[i].date_start;
                    event.resource_id = resourcesReservations[i].resource_id;
                    event.starttime = resourcesReservations[i].starttime;
                    event.endtime = resourcesReservations[i].endtime;
                    event.quantity = resourcesReservations[i].quantity;
                    event.comments = resourcesReservations[i].comments;
                    event.status = resourcesReservations[i].status;
                    event.editable = resourcesReservations[i].editable;
                    event.removable = resourcesReservations[i].removable;
                    event.rsres_id = resourcesReservations[i].rsres_id;
                    tempResourcesReservations.push(event);
                }
            }
            
            this.globalParameters.resourcesReservations.length = 0;
            for (var j = 0; j < tempResourcesReservations.length; j++) {
                this.globalParameters.resourcesReservations[j] = tempResourcesReservations[j];
            }
        }
        
    },
    /**
     * this method displays the form, considering the user constraints
     * @param {Object} availableForTimeframeOnly -- a flag indicating if time constraints from the console
     * 												should be considered ot not
     */
    showResources: function(availableForTimeframeOnly){
        this.globalTimeline = 0;
        var user = this.globalParameters.user;
        var reservation = this.globalParameters.reservation;
        var roomReservation = this.globalParameters.roomReservation;
        var resourcesReservations = this.globalParameters.resourcesReservations;
        var consolePanel = this.selectResourceConsolePanel;
        var bl_id = consolePanel.getFieldValue("reserve_rs.bl_id");
        var time_start = consolePanel.getFieldValue("reserve.time_start");
        var time_end = consolePanel.getFieldValue("reserve.time_end");
		var date_start = consolePanel.getFieldValue("reserve.date_start");
        var curDate = new Date();
        var hoursNow = curDate.getHours();
        var minsNow = 0;
        
        //Clear All Timeline
        if (this.ResourceNatures != null) {
            for (var i = 0; i < this.ResourceNatures.length; i++) {
                if (this.arrTimeline[i] != null) {
					this.arrTimeline[i].clearRowBlocks();
					this.arrTimeline[i].CheckedRows = [];
				}
            }
        }
        writeLayer("buildNonUniqueResourcesList", "", "");
        writeLayer('selectedNonUniqueResourcesList', '', "");
        
        //Update the reservation object with the console values
        reservation.res_type = consolePanel.getFieldValue("reserve.res_type");
        //Guo added 2008-08-04
        reservation.date_start = [];
        reservation.date_start[0] = date_start;
        reservation.recurring_rule = "";
        if (reservation.res_type == 'recurring') {
			var isOk = ABRV_RPRES_setRecurringOptions("resource_recurring_panel", date_start, reservation);
            if (isOk == false) {
                return;
            }
        }
        
        //Guo changed 2008-08-19 to solve KB3018895
        reservation.resource_std = $("resources.resource_std").value;
        reservation.ctry_id = consolePanel.getFieldValue("bl.ctry_id");
        reservation.site_id = consolePanel.getFieldValue("bl.site_id");
        
        if (bl_id == "") 
            reservation.bl_id = null;
        else 
            reservation.bl_id = bl_id;
        
        
		reservation.time_start = time_start;
        reservation.time_end = time_end;
        
        //Read all available resources (taking into account the availableForTimeframeOnly flag)
        //Read all reservations for the available unique and limited resources
        var objectsToSave = [user, reservation, roomReservation, resourcesReservations];
        var jsonExpression = toJSON(objectsToSave);
       
        var reservation = jsonExpression; 
        var AvailableForTimeframeOnly = availableForTimeframeOnly;
        
		try{
			var results = Workflow.callMethod('AbWorkplaceReservations-resource-readAvailableResources', reservation, AvailableForTimeframeOnly);
			this.afterReadAvailable(results)
		}catch(e){
			Workflow.handleError(e);
		}
    },
    /**
     *
     * @param {Object} result
     */
    afterReadAvailable: function(result){
        //Before show resource list, calculate the numbers of resources for each kind of ResourceNatures. Added by ZY.
		if(!this.countResourceForNatures(result)){
			return;	
		}
    
	    if(!this.afterReadAvailableResources(result)){
			return;	
		}
        
		if(!this.afterReadAvailableNonUniqueResources(result)){
			return;	
		}
		
        this.existResources();
    },
    
    /**
     * Count numbers of resources for each kind of Resource Natures
     * @param {Object} result
     */
    countResourceForNatures: function(result){
		if (result.code != "executed") {
        	View.showMessage(result.message);
			return false;
    	}
		
	    var ResourceInfo = eval("(" + result.jsonExpression + ")");
	    
	    var nonUniqueResources = eval("(" + ResourceInfo.NonUniqueResources + ")");
	    var uniqueResources = eval("(" + ResourceInfo.UniqueResources + ")");
	    var resourceNatures = ResourceInfo.ResourceNatures;
	    var uniqueResourceNum = new Array();
	    var nonUniqueResourceNum = new Array();
	    
	    for (var i = 0; i < resourceNatures.length; i++) {
	        var un_count = 0;
	        for (var j = 0; j < uniqueResources.length; j++) 
	            if (uniqueResources[j].resource_nature == resourceNatures[i]) 
	                un_count++;
	        
	        var non_count = 0;
	        for (var j = 0; j < nonUniqueResources.length; j++) 
	            if (nonUniqueResources[j].resource_nature == resourceNatures[i]) 
	                non_count++;
	        
	        uniqueResourceNum[i] = un_count;
	        nonUniqueResourceNum[i] = non_count;
	    }
	    
	    this.UniqueResourceNum = uniqueResourceNum;
	    this.NonUniqueResourceNum = nonUniqueResourceNum;
        
		return true;		 
    },
    
    /**
     * Load WFR results
     * @param {Object} result
     */
    afterReadAvailableResources: function(result){
		if (result.code != "executed") {
        	View.showMessage(result.message);
			return false;
    	}
		
	    var ResourceInfo = eval("(" + result.jsonExpression + ")");
	    
	    this.globalParameters.resourcesReservations = eval("(" + ResourceInfo.ResourceReservations + ")");//Keven added
	    this.globalParameters.resourcesReservations.NonUniqueResources = ResourceInfo.NonUniqueResources;
	    this.globalParameters.resourcesReservations.UniqueResources = ResourceInfo.UniqueResources;
	    this.globalParameters.resourcesReservations.ConcurrentResourceReservations = ResourceInfo.ConcurrentResourceReservations;
	    
	    this.ResourceNatures = ResourceInfo.ResourceNatures;
	    this.ResourceNaturesEnumlist = ResourceInfo.ResourceNaturesEnumlist;//kb#3028194: Added for showing localization values of enum list of field resource nature 
	    
	    if (ResourceInfo.UniqueResources == "[]" && ResourceInfo.NonUniqueResources == "[]") {
	        View.showMessage(getMessage("emptyResult"));
	        showActiveLayer("");
	        //writeLayer("tabsList", "", "");
	        writeLayer("buildNonUniqueResourcesList", "", "");
	        writeLayer('selectedNonUniqueResourcesList', '', "");
	        //PC commented to avoid a javascript error in the new build
	        //document.getElementById("btnCancel").disabled = false;
	    } else {
	        var i;
	        this.showResourceTimelineTab();
	        
	        //Update timeline for each found nature
	        this.globalTimeline = 0;
	        for (i = 0; i < this.ResourceNatures.length; i++) {
	            this.timeName[i] = "timeline-" + i;
	
	            this.updateTimeline(this.ResourceNatures[i], this.timeName[i]);
				
	            this.globalTimeline++;
	        }
	        
	        //Select the first tab
	        this.resourceTimelineTabs.selectTab("tabtimeline-0");
	        //selectTablist(0, "tabtimeline-0");
	        //Display the first timeline
	        showActiveLayer("timeline-0");
	        //$("tabsList").style.visibility = "visible";
	    }
		
		return true;
    },
	
    /**
     * Load WFR results
     * @param {Object} result
     */
    afterReadAvailableNonUniqueResources: function(result){
        var i = 0;
        if (result.code != "executed") {
        	View.showMessage(result.message);
			return false;
    	}
		
        ResourceInfo = eval("(" + result.jsonExpression + ")");
        this.globalParameters.resourcesReservations = eval("(" + ResourceInfo.ResourceReservations + ")");//Keven added
        this.globalParameters.resourcesReservations.NonUniqueResources = ResourceInfo.NonUniqueResources;
        this.globalParameters.resourcesReservations.UniqueResources = ResourceInfo.UniqueResources;
        this.globalParameters.resourcesReservations.ConcurrentResourceReservations = ResourceInfo.ConcurrentResourceReservations;
        
        this.ResourceNatures = ResourceInfo.ResourceNatures;
        this.LastQuantity = 0; //global variable, added by keven
        this.globalGrid = 0;
        
		buildNonUniqueResourcesList("0");
        
		return true;
    },
    /**
     * This function is called when user click the Show
     */
    resource_recurring_panel_onShowOrHide: function(){
		var visible = this.resource_recurring_panel.visible;
		this.showHideRecurringPanel(!visible);
    },
    /**
     * show or hide recurring panel
     * @param {boolean} onlyHide
     */
    showHideRecurringPanel: function(visible){
        if (this.selectResourceConsolePanel.getFieldValue("reserve.res_type") == "recurring") {
           ABRV_showHidePanel("resource_recurring_panel", visible, false);
		}
        
		this.resource_recurring_panel.actions.get("showOrHide").forceDisable(false);
       
		for (i = 0; i < this.arrTimeline.length; i++) {
            if (this.arrTimeline[i] != null) {
                this.arrTimeline[i].refreshRowBlocks();
            }
        }
        
    },
    /**
     * show timeline tabs by ResourceNatures 
     */
    showResourceTimelineTab: function(){
        for (var i = 0; i < this.ResourceNatures.length; i++) {
            this.resourceTimelineTabs.showTab("tabtimeline-" + i);
            var tab = this.resourceTimelineTabs.findTab("tabtimeline-" + i);
            
            /////////////////////////////////////
            tab.setTitle(this.ResourceNaturesEnumlist[i]);//kb#3028194: change code to set tab's title by localization value of resource nature 
            
            if (this.UniqueResourceNum[i] == 0) {
                tab.parentPanel.tabHeight = 30;
            } else {
                tab.parentPanel.tabHeight = 151;
            }
        }
    },

    /**
     * hide all tabs which show fix resource time line
     */
    hideAllResourceTimelineTab: function(){
        for (var i = 0; i < 10; i++) {
            this.resourceTimelineTabs.hideTab("tabtimeline-" + i);
        }
    },
	
    /**
     * enable the next button
     */
    existResources: function(){
        if ((this.existNonUniqueResources()) || (this.existLimitedAndUnlimitedResources())) {
            this.actionsPanel.actions.get("btnNext").enable(true);
        }
        else {
            this.actionsPanel.actions.get("btnNext").enable(false);
        }
    },
    /**
     * Test if the Next and Cancel buttons must be enabled or disabled
     */
    existNonUniqueResources: function(){
        for (var i = 0; i < this.arrTimeline.length; i++) {
            if (this.arrTimeline[i] != null) {
                if (this.arrTimeline[i].model.events != "") {
                    for (var j = 0; j < this.arrTimeline[i].model.events.length; j++) {
                        if (this.arrTimeline[i].model.events[j].canEdit) {
                            return true;
                        }
                    }
                } // End if (arrTimeline[i].model.events!="") {
            }// End if (arrTimeline[i]!=null){
        } // End for
        return false;
    },
    
    /**
     * Test if the Next and Cancel buttons must be enabled or disabled
     */
    existLimitedAndUnlimitedResources: function(){
        var resourceReservation = this.globalParameters.resourcesReservations;
        
        if (resourceReservation.length > 0) {
            for (var i = 0; i < resourceReservation.length; i++) {
                if (resourceReservation[i].quantity > 0) {
                    if (ABRV_isMinnor(ABRV_convert24H(resourceReservation[i].starttime), ABRV_convert24H(resourceReservation[i].endtime))) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    
    
    /**
     * Check if the resource exists in the resources array
     * @param {Object} resId
     */
    inResourceReservation: function(resId){
        for (var i = 0; i < this.globalParameters.resourcesReservations.length; i++) {
            if (this.globalParameters.resourcesReservations[i].resource_id == resId) 
                return true;
        }
        return false;
    },
    /**
     * Get the index of the resource reservation array according the resId
     * @param {Object} resId -- identifier of the resource reservation
     */
    getResourcesReservationID: function(resId){
        for (var i = 0; i < this.globalParameters.resourcesReservations.length; i++) {
            if (this.globalParameters.resourcesReservations[i].resource_id == resId) 
                return i;
        }
        return 0;
    },
    
    /**
     * edit resourcesReservations Array when adding or editing
     *
     * called in ab-rr-edit-nonUnique-resource-reservation.js
     * @param {string} starttime :'09:00'
     * @param {string} endtime   :'11:00'
     * @param {int} quantity   : 5
     * @param {string} comments : 'try'
     * @param (boolean} isAdd   : true,false
     * @param {int} itemindex    : 0
     */
    editResourcesReservationsArray: function(starttime, endtime, quantity, comments, isAdd, itemindex, resource_id){
        var resourcesReservations = this.globalParameters.resourcesReservations;
        if (this.isAdd) {
            var newResourceReservation = new Object();
            var reservation = this.globalParameters.reservation;
            newResourceReservation.date_start = reservation.date_start[0];
            newResourceReservation.resource_id = resource_id;
            newResourceReservation.starttime = starttime;
            newResourceReservation.endtime = endtime;
            newResourceReservation.quantity = quantity;
            newResourceReservation.comments = comments;
            newResourceReservation.status = null;
            newResourceReservation.editable = true;
            newResourceReservation.removable = true;
            newResourceReservation.rsres_id = null;
            resourcesReservations[resourcesReservations.length] = newResourceReservation;
        }
        else {
            resourcesReservations[itemindex].starttime = starttime;
            resourcesReservations[itemindex].endtime = endtime;
            resourcesReservations[itemindex].quantity = quantity;
            resourcesReservations[itemindex].comments = comments;
        }
    },
    
    /**
     * Added by keven
     * @param {Object} resId
     */
    getResource: function(resId){
        var resource = null;
        var NonUniqueResources = eval("(" + this.globalParameters.resourcesReservations.NonUniqueResources + ")");
        var UniqueResources = eval("(" + this.globalParameters.resourcesReservations.UniqueResources + ")");
        for (var i = 0; i < NonUniqueResources.length; i++) {
            if (NonUniqueResources[i].resources_id == resId) {
                resource = NonUniqueResources[i];
                return resource;
            }
        }
        for (var i = 0; i < UniqueResources.length; i++) {
            if (UniqueResources[i].resourceId == resId) {
                resource = UniqueResources[i];
                return resource;
            }
        }
        return resource;
    },
    
    /**
     * get the index of CurrentTab in the ResourceNatures Array
     * Return the index
     * @param {Object} resourceNature
     */
    getCurTabIndexofResourceNatures: function(resourceNature){
        for (var i = 0; i < this.ResourceNatures.length; i++) {
            if (this.ResourceNatures[i] == resourceNature) {
                return i;
            }
        }
        return -1;
    },
    
    /**
     * check the time and quantity input value
     * @param {Object} curEvent --- an event from the ResourceReservations array
     * @param {Object} paramResource_id --- the selected resource_id
     * @param {Object} paramStart --- the editform.time_start
     * @param {Object} paramEnd --- the editform.time_end
     * @param {Object} paramQuantity --- if the input is available ,return true;
     */
    checkAvailability: function(curEvent, paramResource_id, paramStart, paramEnd, paramQuantity){
        var reservation = this.globalParameters.reservation;
        var NonUniqueResources = eval("(" + this.globalParameters.resourcesReservations.NonUniqueResources + ")");
        
        //Get resource from id
        var resource;
        for (var i = 0; i < NonUniqueResources.length; i++) {
            if (NonUniqueResources[i].resources_id == paramResource_id) {
                resource = NonUniqueResources[i];
                break;
            }
        }
        
        var paramStart1 = desendMinutes(paramStart, resource.resources_pre_block);
        var paramEnd1 = addMinutes(paramEnd, resource.resources_post_block);
        
        //The reservation should start after dayStart and before dayEnd
        var errMessage = "";
        if ((ABRV_isMinnor(ABRV_convert24H(paramStart1), ABRV_convert24H(resource.resources_date_start))) || (ABRV_isMinnor(ABRV_convert24H(resource.resources_day_end), ABRV_convert24H(paramEnd1)))) {
            var actual_day_start = addMinutes(resource.resources_date_start, resource.resources_pre_block);
            var actual_day_end = desendMinutes(resource.resources_day_end, resource.resources_post_block);
            errMessage = getMessage('timeSelectedOutOfResourceAvailableScope');
            //PC KB 3039305 The error message should display times in HH:MM format instead of in HH:MM:ss.mmm
            errMessage = errMessage.replace("{0}", ABRV_formatTime(actual_day_start));
            errMessage = errMessage.replace("{1}", ABRV_formatTime(actual_day_end));
            View.showMessage(errMessage);
            return false;
        }
        
        //In case of a reservation-room-resource the reservation should be in that room timeslot
        var roomReservation = this.globalParameters.roomReservation;
        var isReservationRoomResource = ((roomReservation) && (roomReservation.rmres_id));
        if (isReservationRoomResource) {
            if ((ABRV_isMinnor(ABRV_convert24H(paramStart), ABRV_convert24H(roomReservation.time_start))) || (ABRV_isMinnor(ABRV_convert24H(roomReservation.time_end), ABRV_convert24H(paramEnd)))) {
                errMessage = getMessage('timeSelectedOutOfRoomAvailableScope');
                errMessage = errMessage.replace("{0}", roomReservation.time_start);
                errMessage = errMessage.replace("{1}", roomReservation.time_end);
                View.showMessage(errMessage);
                return false;
            }
        }
        //For unlimited resources, availability is OK
        if (resource.resources_type == 'Unlimited') {
            return true;
        }
        //For limited ones calculate availability. Start with quantity of resource.
        var Available = resource.quantity;
        
        // Check for all events in the requested timeslot if there are other events in the timeslot of that event and total the 
        // use of limited resources. Now max the use of limited resources per event to find the real use within the 
        // requested timeslot of the user.
        var counter = 0;
        var resourcesReservations = this.globalParameters.resourcesReservations;
        var tempResourcesReservationsArray = new Array();
        for (var i = 0; i < resourcesReservations.length; i++) {
            if ((resourcesReservations[i].resource_id == paramResource_id) &&
            (resourcesReservations[i].status != 'Cancelled')) {
                tempResourcesReservationsArray[counter] = new Object();
                tempResourcesReservationsArray[counter].resource_id = resourcesReservations[i].resource_id;
                tempResourcesReservationsArray[counter].rsres_id = resourcesReservations[i].rsres_id;
                tempResourcesReservationsArray[counter].starttime = resourcesReservations[i].starttime;
                tempResourcesReservationsArray[counter].endtime = resourcesReservations[i].endtime;
                tempResourcesReservationsArray[counter].quantity = resourcesReservations[i].quantity;
                tempResourcesReservationsArray[counter].comments = resourcesReservations[i].comments;
                counter++;
            }
        }
        var concurrentResourceReservations = eval("(" + this.globalParameters.resourcesReservations.ConcurrentResourceReservations + ")");
        for (var i = 0; i < concurrentResourceReservations.length; i++) {
            if (concurrentResourceReservations[i].resource_id == paramResource_id) {
                tempResourcesReservationsArray[counter] = new Object();
                tempResourcesReservationsArray[counter].resource_id = concurrentResourceReservations[i].resource_id;
                tempResourcesReservationsArray[counter].rsres_id = concurrentResourceReservations[i].rs_res_id;
                tempResourcesReservationsArray[counter].starttime = concurrentResourceReservations[i].time_start;
                tempResourcesReservationsArray[counter].endtime = concurrentResourceReservations[i].time_end;
                tempResourcesReservationsArray[counter].quantity = concurrentResourceReservations[i].quantity;
                tempResourcesReservationsArray[counter].comments = concurrentResourceReservations[i].comments;
                counter++;
            }
        }
        
        
        var curMaxAtStart = 0;
        var curMaxAtEnd = 0;
        var checkStartTime;
        var checkEndTime;
        var event; // an element of the resourcesReservations+ConcurrentResourceReservations Array
        var event2; // an element of the resourcesReservations+ConcurrentResourceReservations Array
        var maxFound = 0;
        for (var i = 0; i < tempResourcesReservationsArray.length; i++) {
            event = tempResourcesReservationsArray[i];
            if (isEquals(event, curEvent)) 
                continue; //next loop
            var checkStart = false;
            var checkEnd = false;
            curMaxAtStart = 0;
            curMaxAtEnd = 0;
            
            var eventStart = desendMinutes(event.starttime, resource.resources_pre_block);
            var eventEnd = addMinutes(event.endtime, resource.resources_post_block);
            if ((!ABRV_isMinnor(eventStart, paramStart1)) &&
            (ABRV_isMinnor(eventStart, paramEnd1))) {
                checkStart = true;
                checkStartTime = eventStart;
                curMaxAtStart = event.quantity;
            }
            else 
                if (ABRV_isMinnor(paramStart1, eventEnd) &&
                !ABRV_isMinnor(paramEnd1, eventEnd)) {
                    checkEnd = true;
                    checkEndTime = eventEnd;
                    curMaxAtEnd = event.quantity;
                }
                else {
                    continue; //next loop
                }
            
            for (var j = 0; j < tempResourcesReservationsArray.length; j++) {
                event2 = tempResourcesReservationsArray[j];
                if ((curMaxAtStart > Available) || (curMaxAtEnd > Available)) 
                    break;//exit this loop
                var eventStart2 = desendMinutes(event2.starttime, resource.resources_pre_block);
                var eventEnd2 = addMinutes(event2.endtime, resource.resources_post_block);
                if ((!isEquals(event2, curEvent)) && (!isEquals(event2, event))) {
                    if ((checkStart && (!ABRV_isMinnor(checkStartTime, eventStart2))) &&
                    (ABRV_isMinnor(checkStartTime, eventEnd2))) {
                        curMaxAtStart = parseInt(curMaxAtStart) + parseInt(event2.quantity);
                    }
                    else 
                        if (checkEnd && ABRV_isMinnor(eventStart2, checkEndTime) &&
                        (!ABRV_isMinnor(eventEnd2, checkEndTime))) {
                            curMaxAtEnd = parseInt(curMaxAtEnd) + parseInt(event2.quantity);
                        }
                }
            }//end for2
            maxFound = Math.max(maxFound, curMaxAtStart);
            maxFound = Math.max(maxFound, curMaxAtEnd);
            if (maxFound >= Available) 
                break; //exit this loop 
        }//end for 1
        // If the resource still available, check if it's also at paramStart-resource.pre_block and 
        // paramEnd-resource.post_block
        if ((maxFound < Available) && (Available - maxFound >= paramQuantity)) {
            curMaxAtStart = 0;
            curMaxAtEnd = 0;
            for (var i = 0; i < tempResourcesReservationsArray.length; i++) {
                event = tempResourcesReservationsArray[i];
                if (isEquals(event, curEvent)) 
                    continue; //next loop
                if ((curMaxAtStart > Available) || (curMaxAtEnd > Available)) 
                    break; // exit this loop
                var eventStart = desendMinutes(event.starttime, resource.resources_pre_block);
                var eventEnd = addMinutes(event.endtime, resource.resources_post_block);
                if ((!ABRV_isMinnor(paramStart1, eventStart)) &&
                ABRV_isMinnor(paramStart1, eventEnd)) {
                    curMaxAtStart = parseInt(curMaxAtStart) + parseInt(event.quantity);
                }
                else 
                    if (ABRV_isMinnor(eventStart, paramEnd1) &&
                    (!ABRV_isMinnor(eventEnd, paramEnd1))) {
                        curMaxAtEnd = parseInt(curMaxAtEnd) + parseInt(event.quantity);
                    }
            } //end for
            maxFound = Math.max(maxFound, curMaxAtStart);
            maxFound = Math.max(maxFound, curMaxAtEnd);
        }
        Available = Math.max(0, Available - maxFound);
        if (Available < paramQuantity) {
            //only [available] of the requested [paramQuantity] resources is available
            errMessage = getMessage('quantitySelectedOutOfScope');
            errMessage = errMessage.replace("{0}", paramQuantity);
            errMessage = errMessage.replace("{1}", Available);
            View.showMessage(errMessage);
            return false;
        }
        return true;
    },
    
    /**
     * load the record to the noUniqueDetail panel
     */
    loadNonUniqueDetailPanel: function(){
        this.nonUniqueDetailPanel.show(true);
        
        // In case of a reservation-room-resource the reservation should be in that room timeslot
        var isReservationRoomResource = ((this.globalParameters.roomReservation) && (this.globalParameters.roomReservation.rmres_id));
        var reservation = this.globalParameters.reservation;
        var Quantity;
        //edit 
        //Guo changed 2009-09-05 to solve KB3019528
        if (this.currentResource) {
            this.nonUniqueDetailPanel.setInputValue("reserve_rs.resource_id", this.currentResource.resources_id);
            this.nonUniqueDetailPanel.setInputValue("resources.day_start", this.currentResource.resources_date_start);
            this.nonUniqueDetailPanel.setInputValue("resources.day_end", this.currentResource.resources_day_end);
        }
        if (this.isAdd == false) {
            if (this.paramEventObj != null) {
                this.nonUniqueDetailPanel.setInputValue("reserve_rs.time_start", this.paramEventObj.starttime);
                this.nonUniqueDetailPanel.setInputValue("reserve_rs.time_end", this.paramEventObj.endtime);
                this.nonUniqueDetailPanel.setInputValue("reserve_rs.quantity", this.paramEventObj.quantity);
                this.nonUniqueDetailPanel.setInputValue("reserve_rs.comments", this.paramEventObj.comments);
            }
        }
        else {
            if (isReservationRoomResource) {
                if (this.currentResource.default_calculation == 0) {
                    Quantity = 1;
                }
                else {
                    //Guo added 2008-09-15 to solve KB3015235
                    Quantity = Math.round(reservation.group_size / this.currentResource.default_calculation);
                }
            }
            else {
                Quantity = this.LastQuantity;
            }
            this.nonUniqueDetailPanel.setInputValue("reserve_rs.time_start", reservation.time_start);
            this.nonUniqueDetailPanel.setInputValue("reserve_rs.time_end", reservation.time_end);
            this.nonUniqueDetailPanel.setInputValue("reserve_rs.quantity", "" + Quantity);
            this.nonUniqueDetailPanel.setInputValue("reserve_rs.comments", "");
        }

        this.nonUniqueDetailPanel.enableField('reserve_rs.resource_id', false);
        this.nonUniqueDetailPanel.enableField('resources.day_start', false);
        this.nonUniqueDetailPanel.enableField('resources.day_end', false);
    },
    
    /**
     *event handler of the button save in nonUniqueDetail panel
     */
    nonUniqueDetailPanel_onSave: function(){
        var returnValue;
        var sTemp = this.nonUniqueDetailPanel.getFieldValue('reserve_rs.time_start');
        var time_start = sTemp.substring(0, 5);
        sTemp = this.nonUniqueDetailPanel.getFieldValue('reserve_rs.time_end');
        var time_end = sTemp.substring(0, 5);
        var quantity = this.nonUniqueDetailPanel.getFieldValue('reserve_rs.quantity');
        var comments = this.nonUniqueDetailPanel.getFieldValue('reserve_rs.comments');
        var reservation = this.globalParameters.reservation;
        
        if (!checkInputs(time_start, time_end, quantity)) {
            return;
        }
		
        
		if (reservation.res_type == 'recurring') {
			returnValue = this.checkAvailabilityRecurring(this.currentResource.resources_id, time_start, time_end, quantity);
		} else {
			if (this.isAdd) {
				returnValue = this.checkAvailability(null, this.currentResource.resources_id, time_start, time_end, quantity);
			} else {
				returnValue = this.checkAvailability(this.paramEventObj, this.currentResource.resources_id, time_start, time_end, quantity);
			}
		}

		//If returnValue = False,Present Edit pop-up again
		if (returnValue) {
			if (this.isAdd) {
				this.LastQuantity = parseInt(quantity);
			}
			//write the values to resourcesReservatrions array	
			this.editResourcesReservationsArray(time_start, time_end, quantity, comments, this.isAdd, this.paramEventIndex, this.currentResource.resources_id);
			//Redisplay second list
			buildNonUniqueResourceReservationList(this.currentTabIndex);

			this.nonUniqueDetailPanel.show(false);
			//KB 3019285: Make 'Next' and 'Cancel' button enabled when add a NonUnique resource reservation.
			this.actionsPanel.actions.get("btnNext").enable(true);
			this.actionsPanel.actions.get("btnCancel").enable(true);
		}
    },
    
    /**
     * event handler of the button Cancel in nonUniqueDetail panel
     */
    nonUniqueDetailPanel_onCancel: function(){
        this.nonUniqueDetailPanel.show(false);
    },
    
    /**
     * This function is called when the res_type is recurring
     * KB# 3018839 Modified by Keven 2008-08-04
     * @param {Object} paramResource_id
     * @param {Object} paramStart
     * @param {Object} paramEnd
     * @param {Object} paramQuantity
     */
    checkAvailabilityRecurring: function(paramResource_id, paramStart, paramEnd, paramQuantity){
        //Get resource from id
        var NonUniqueResources = eval("(" + this.globalParameters.resourcesReservations.NonUniqueResources + ")");
        var resource;
        for (var i = 0; i < NonUniqueResources.length; i++) {
            if (NonUniqueResources[i].resources_id == paramResource_id) {
                resource = NonUniqueResources[i];
                break;
            }
        }
        // The reservation should start after dayStart and before dayEnd
        var paramStart1 = desendMinutes(paramStart, resource.resources_pre_block);
        var paramEnd1 = addMinutes(paramEnd, resource.resources_post_block);
        
        //The reservation should start after dayStart and before dayEnd
        var errMessage = "";
        if ((ABRV_isMinnor(ABRV_convert24H(paramStart1), ABRV_convert24H(resource.resources_date_start))) || (ABRV_isMinnor(ABRV_convert24H(resource.resources_day_end), ABRV_convert24H(paramEnd1)))) {
            var actual_day_start = addMinutes(resource.resources_date_start, resource.resources_pre_block);
            var actual_day_end = desendMinutes(resource.resources_day_end, resource.resources_post_block);
            errMessage = getMessage('timeSelectedOutOfResourceAvailableScope');
            //PC KB 3039305 The error message should display times in HH:MM format instead of in HH:MM:ss.mmm
            errMessage = errMessage.replace("{0}", ABRV_formatTime(actual_day_start));
            errMessage = errMessage.replace("{1}", ABRV_formatTime(actual_day_end));
            View.showMessage(errMessage);
            return false;
        }
        // In case of a reservation-room-resource the reservation should be in that room timeslot
        var roomReservation = this.globalParameters.roomReservation;
        var isReservationRoomResource = ((roomReservation) && (roomReservation.rmres_id));
        if (isReservationRoomResource) {
            if ((ABRV_isMinnor(ABRV_convert24H(paramStart), ABRV_convert24H(roomReservation.time_start))) || (ABRV_isMinnor(ABRV_convert24H(roomReservation.time_end), ABRV_convert24H(paramEnd)))) {
                errMessage = getMessage('timeSelectedOutOfRoomAvailableScope');
                errMessage = errMessage.replace("{0}", roomReservation.time_start);
                errMessage = errMessage.replace("{1}", roomReservation.time_end);
                View.showMessage(errMessage);
                return false;
            }
        }
        //For unlimited resources, availability is OK
        if (resource.resources_type == 'Unlimited') {
            return true;
        }
        // For limited ones check that is not greater than the maximum quantity
        if (paramQuantity > resource.quantity) {
            //only [available] of the requested [paramQuantity] resources is available
            errMessage = getMessage('quantitySelectedOutOfScope');
            errMessage = errMessage.replace("{0}", paramQuantity);
            errMessage = errMessage.replace("{1}", resource.quantity);
            View.showMessage(errMessage);
            return false;
        }
        return true;
    },
    
    // -------------------------------------------------------------------------------------------------
    // -------------------------------  TIMELINE  --  METHODS  -- BEGIN -----------------------------------------
    // -------------------------------------------------------------------------------------------------
    
    /**
     * To build an array containing all the unique resource data for a specific nature and
     * build an array containing all the concurrent resource data for a specific nature
     * @param {Object} currentTabName
     * @param {Object} timeline
     */
    updateTimeline: function(currentTabName, timeline){
        var filterUniqueResources = eval("(" + this.globalParameters.resourcesReservations.UniqueResources + ")");
        var processedFilterUniqueResources = new Array();
        var tmpUniqueResources;
        var i;
        var count = 0;
        
        for (i = 0; i < filterUniqueResources.length; i++) {
            tmpUniqueResources = filterUniqueResources[i];
            if (tmpUniqueResources.resource_nature == currentTabName) {
                processedFilterUniqueResources[count] = tmpUniqueResources;
                count++;
            }
        }
        
        var jsonExpression = toJSON(processedFilterUniqueResources);
        var filterConcurrentResourceReservations = eval("(" + this.globalParameters.resourcesReservations.ConcurrentResourceReservations + ")");
        var processedFilterConcurrentResourceReservations = new Array();
        var tmpConcurrentResourceReservations;
        count = 0;
        
        for (i = 0; i < filterConcurrentResourceReservations.length; i++) {
            tmpConcurrentResourceReservations = filterConcurrentResourceReservations[i];
            if (tmpConcurrentResourceReservations.resource_nature == currentTabName) {
                processedFilterConcurrentResourceReservations[count] = tmpConcurrentResourceReservations;
                count++;
            }
        }
        
        var jsonExpressionCRR = toJSON(processedFilterConcurrentResourceReservations);
        var filterEditableResourceReservations = this.globalParameters.resourcesReservations;
        var jsonExpressionER = toJSON(filterEditableResourceReservations);

		var objUniqueResources = jsonExpression;
		var objConcurrentResourceReservations = jsonExpressionCRR;
		var objEditableResourceReservation = jsonExpressionER;
        
		try{
			var results = Workflow.callMethod("AbWorkplaceReservations-resource-loadTimeline", objUniqueResources, objConcurrentResourceReservations, objEditableResourceReservation);
			this.afterLoadTimeline(results);
		}catch(e){
			Workflow.handleError(e);
		}
    },
    
    /**
     * Load WFR results
     * @param {Object} result
     */
    afterLoadTimeline: function(result){
        var filterConcurrentResourceReservations = eval("(" + this.globalParameters.resourcesReservations.ConcurrentResourceReservations + ")");
        var filterUniqueResources = eval("(" + this.globalParameters.resourcesReservations.UniqueResources + ")");
        
        if (result.code == "executed") {
            if (result.message == "OK") {
                
				if (!valueExists(this.arrTimeline[this.globalTimeline])) {
					this.arrTimeline[this.globalTimeline] = new Ab.timeline.TimelineController(this.timeName[this.globalTimeline], true);
					this.arrTimeline[this.globalTimeline].addOnClickEvent(this.timeline_onClickEvent.createDelegate(this));
					this.arrTimeline[this.globalTimeline].addOnCreateEvent(this.timeline_onTimelineDragNew.createDelegate(this));
					this.arrTimeline[this.globalTimeline].addOnChangeEvent(this.timeline_onChangeEvent.createDelegate(this));
					this.arrTimeline[this.globalTimeline].addColumn('selectResource', '', 'checkbox', this.timeline_onTimelineCheckBox.createDelegate(this));//Guo added
					this.arrTimeline[this.globalTimeline].addColumn('resourceId', getMessage('titleResource'), 'text');
					this.arrTimeline[this.globalTimeline].addColumn('info', "", 'image', this.viewResourcesDetails.createDelegate(this), getMessage('info'), 'ab-rr-info.gif');
					this.arrTimeline[this.globalTimeline].addColumn('resources_approval', "", 'image', null, getMessage('approval'), 'ab-rr-approval.gif');
					//Add custom tooltip handler, to include room_id,etc.
					this.arrTimeline[this.globalTimeline].addOnShowTimeslotTooltip(this.timeline_onShowTimeslotTooltip.createDelegate(this));
				} 
				
				this.arrTimeline[this.globalTimeline].clearRowBlocks();
				
				// BEGIN: it is for show timeline events only
                var timelineDTO = eval("(" + result.jsonExpression + ")");
                //Split events array in two arrays, one contains current edited events; another contains concurrent events that could not be changed. By ZY 2008-05-27.
                var editedEvents = new Array();
                var concurrentEvents = new Array();
                var ecount = 0, ccount = 0;
                for (var i = 0; i < timelineDTO.events.length; i++) {
                    var event = timelineDTO.events[i];
                    //Modified for KB 3018920. By ZY 2008-07-31.
                    if (event.isConcurrent) {
                        concurrentEvents[ccount] = event;
                        ccount++;
                    }
                    else {
                        editedEvents[ecount] = event;
                        ecount++;
                    }
                }
                //Firstly, load concurrent events in timeline. Added by zy 2008-05-27.
                timelineDTO.events = concurrentEvents;
                this.arrTimeline[this.globalTimeline].loadTimelineModel(timelineDTO);
                //Secondly, create events for edited unique resource reservations in timeline based on edited events array. Added by zy 2008-05-27.
                for (var j = 0; j < editedEvents.length; j++) 
                    this.arrTimeline[this.globalTimeline].model.addEvent(this.createExistedTimelineEvent(editedEvents[j], this.arrTimeline[this.globalTimeline].model));
                
                this.globalParameters.timelineData = this.arrTimeline[this.globalTimeline].getTimeline();
                
                //Drag & drop isn't allowed in the recurrent reserve
                //guo added
                if (this.globalParameters.reservation.res_type == 'recurring') {
                    this.arrTimeline[this.globalTimeline].isEditable = false;
                }
                else {
                    this.arrTimeline[this.globalTimeline].isEditable = true;
                }
            }
            else { //Timeline not matching the criteria
                View.showMessage(result.message);
            }
        }
        else {
            View.showMessage(result.message);
        }
    },
    
    
    /**
     * Create a new TimeLine Event to show in timeline control for edited resourceReservation. Added by ZY 2008-05-20.
     * @param {Object} editedEvent
     * @param {Object} parentTimeline
     */
    createExistedTimelineEvent: function(editedEvent, parentTimeline){
        var newEvent = new Ab.timeline.Event(editedEvent.eventId, editedEvent.resourceRow, editedEvent.columnStart, editedEvent.columnEnd, true, parentTimeline);
        newEvent.comments = editedEvent.comments;
        
        //Guo added 2008-07-23  related to KB3018883
        var time_start = newEvent.timeline.getColumnDateTime(newEvent.getStart());
        var time_end = newEvent.timeline.getColumnDateTime(newEvent.getEnd() + 1);
        newEvent.dateTimeStart = time_start;
        newEvent.dateTimeEnd = time_end;
        //Added for KB 3018920. By ZY 2008-07-31.
        newEvent.canEdit = editedEvent.canEdit;
        newEvent.canDelete = editedEvent.canDelete;
        
        return newEvent;
    },
    
    /**
     *
     * @param {Object} event
     */
    timeline_onTimelineDragNew: function(event){
        var time_start = event.timeline.getColumnDateTime(event.getStart());
        var time_end = event.timeline.getColumnDateTime(event.getEnd() + 1);
        if (!outOfRoomReservationsTimeScope(time_start, time_end)) {
            event.dateTimeStart = time_start;
            event.dateTimeEnd = time_end;
            event.comments = "";
            //Added for KB 3018920. By ZY 2008-08-05.
            event.canDelete = true;
           	
			this.actionsPanel.actions.get("btnNext").enable(true);
			this.actionsPanel.actions.get("btnCancel").enable(true);
            
			return true;
        }
        else {
            //Guo added 2008-09-04 to solve KB3019491
            event.clearTimeslots();
            View.showMessage(getMessage('errorOutOfRoomTimeScope'));
            return false;
        }
    },
    
    /**
     *
     * @param {Object} event
     * @param {Object} startColumn
     * @param {Object} endColumn
     */
    timeline_onChangeEvent: function(event, startColumn, endColumn){
        var time_start = event.timeline.getColumnDateTime(startColumn);
        var time_end = event.timeline.getColumnDateTime(endColumn + 1);
        if (!outOfRoomReservationsTimeScope(time_start, time_end)) {
            event.dateTimeStart = time_start;
            event.dateTimeEnd = time_end;
			
			this.actionsPanel.actions.get("btnNext").enable(true);
			this.actionsPanel.actions.get("btnCancel").enable(true);
				
            return true;
        }
        else {
            View.showMessage(getMessage('errorOutOfRoomTimeScope'));
            //Guo added 2008-07-23 	 related to KB3018883
            var timeline = event.timeline;
            var minorSegments = timeline.minorToMajorRatio;
            var timelineStartTime = timeline.getTimemark(0).getDateTime();
            var MaxTimemarksColumn = timeline.getColumnNumber();
            var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, event.dateTimeStart, MaxTimemarksColumn);
            var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, event.dateTimeEnd, MaxTimemarksColumn);
            timeline.modifyEvent(event, columnStart, columnEnd - 1);
            
            var oldRows = event.getRow();
            //event.timeline.removeEvent(event);
            for (i = 0; i < this.arrTimeline.length; i++) {
                if (this.arrTimeline[i] != null) 
                    if (this.arrTimeline[i].model.id == event.timeline.id) 
                        this.arrTimeline[i].refreshTimelineRow(oldRows);
            }
            //add by Guo 2008-07-04			
            // var checkBox = getTimelineCellContent(window.tabs.currentTimeLine.grid.controlId, oldRows, 0);
            // if(checkBox.checked){
            // 	 checkBox.checked = false;
            // }
            
            return false;
        }
    },
    
    /**
     *
     * @param {Object} e
     * @param {Object} event
     */
    timeline_onClickEvent: function(e, event){
        //Modified for KB 3018920. By ZY 2008-07-31.
        if (event.canEdit || event.canDelete) {
            this.addReservationDetails(e, event);
        }
        else {
            //PC Changed 28/05/2007 to solve KB item 3015481
            //Create a restriction and open the room reservation details dialog
            var restriction = {
                'reserve_rs.rsres_id': event.eventId
            };
            View.openDialog("ab-rr-reserve-resource-details.axvw", restriction);
        }
    },
    
    /**
     *
     * @param {Object} e
     * @param {Object} event
     */
    addReservationDetails: function(e, event){
        this.eventToEdit = event;
        View.openDialog('ab-rr-reserve-resource-adddetails.axvw');
    },
    /**
     * called by the timeline to display custom tooltip for current timeslot
     * @param {Object} timeslot
     */
    timeline_onShowTimeslotTooltip: function(timeslot){
        if (timeslot && timeslot.resource) {
            var labeltz = '';
            //If already have a row in the timeline showing the selected timezone time, add to the tooltip the time in this timezone
            if (this.existtimelinetz == true) {
                var timezone = this.select_timezone.getFieldValue('afm_timezones.timezone_id');
                labeltz = '<tr><td class="value">' + timezone + ': ' + this.timemarkstz[timeslot.getColumn()].dateTimeLabel + '</td></tr>';
            }
            return {
                text: '<tr><td>' + timeslot.resource.getResourceId() + '</td></tr>' + labeltz,
                override: false, // true to override default tooltip text, false to append
                cancel: false // true to cancel the tooltip display for this timeslot 
            }
        }
        else {
            return "";
        }
    },
    /**
     * Called when the user clicks on the Select check box button of the timeline.
     * Guo added
     * @param {Object} e
     * @param {Object} resource
     */
    timeline_onTimelineCheckBox: function(e, resource){
        var isChecked = e.grid.cells[e.row][0].firstChild.checked;
        
		// First, when an unchecked row is checked (can only occur when row.editable = True)
        if (isChecked) {
            var consolePanel = this.selectResourceConsolePanel;
            var timeStart = consolePanel.getFieldValue("reserve.time_start");
            var timeEnd = consolePanel.getFieldValue("reserve.time_end");
            var res_type = consolePanel.getFieldValue("reserve.res_type");
            // Console time values should be entered and time_end should be greater than time_start
            if (timeStart == "" || timeEnd == "") {
				 e.grid.cells[e.row][0].firstChild.checked = false;	
                View.showMessage(getMessage("timeConsoleError"));
                return;
            }
            else {
                // Check availability of new timeslot and warn user if a conflict occurred.
                // In case of a recurring reservation conflicts are resolved later.
                // We accept all user input here.
                var timeline = this.currentTimeLine.getTimeline();
                var minorSegments = timeline.minorToMajorRatio;
                var timelineStartTime = timeline.getTimemark(0).getDateTime();
                var MaxTimemarksColumn = timeline.getColumnNumber();
                var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, timeStart, MaxTimemarksColumn);
                var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, timeEnd, MaxTimemarksColumn);
                if (ABRV_isMinnor(timeStart, timeEnd)) {
                    var uniqueResources = eval("(" + this.globalParameters.resourcesReservations.UniqueResources + ")");
                    for (var recourceCounts = 0; recourceCounts < uniqueResources.length; recourceCounts++) {
                        if (uniqueResources[recourceCounts].resourceId == e.resourceId) {
                            var resourceStartTime = String(uniqueResources[recourceCounts].resources_date_start);
                            var resourceEndTime = String(uniqueResources[recourceCounts].resources_day_end);
                            //Kb# 3019117 Added by Keven 2008-08-12
                            var arrStartTime = resourceStartTime.split(" ");
                            var arrEndTime = resourceEndTime.split(" ");
                            resourceStartTime = arrStartTime[arrStartTime.length - 1];
                            resourceEndTime = arrEndTime[arrEndTime.length - 1];
                            
                            var preBlockTimeslots = uniqueResources[recourceCounts].preBlockTimeslots;
                            var postBlockTimeslots = uniqueResources[recourceCounts].postBlockTimeslots;
                            if (ABRV_isMinnor(timeStart, resourceStartTime) || ABRV_isMinnor(resourceEndTime, timeEnd)) {
                               
							    e.grid.cells[e.row][0].firstChild.checked = false;
                               
                                View.showMessage(getMessage("timeSelectedNotAvailable"));
                                return;
                            }
                            break;
                        }
                    }
                    // In case of a reservation-room-resource the reservation should be in that room timeslot
                    if (valueExists(this.globalParameters.roomReservation) && this.globalParameters.roomReservation.rmres_id != "") {
                        if (ABRV_isMinnor(timeStart, this.globalParameters.roomReservation.time_start) || ABRV_isMinnor(this.globalParameters.roomReservation.time_end, timeEnd)) {
                            View.showMessage(getMessage("onlyAvailableInRoomReservevation"));
                            return;
                        }
                    }
                    // Check availability of the timeslots and warn user if conflict occurred
                    var eventTimeslotsAvailable = timeline.allTimeslotsAvailable(e.row, columnStart - e.getPreBlockTimeslots(), columnEnd + e.getPostBlockTimeslots() - 1, (res_type == "recurring"));
                    if (eventTimeslotsAvailable) {
                        // create new event and add it to the timeline
                        this.newEvent = new Ab.timeline.Event(null, e.row, columnStart, columnEnd - 1, true, timeline);
                        timeline.addEvent(this.newEvent);
                        
                        var time_start = this.newEvent.timeline.getColumnDateTime(this.newEvent.getStart());
                        var time_end = this.newEvent.timeline.getColumnDateTime(this.newEvent.getEnd() + 1);
                        
                        this.newEvent.canEdit = true;
                        this.newEvent.canDelete = true;
                        this.newEvent.dateTimeStart = time_start;
                        this.newEvent.dateTimeEnd = time_end;
                        this.newEvent.comments = "";
                        var row = this.newEvent.getRow();
                        this.currentTimeLine.refreshTimelineRow(row);
                        if (!valueExists(this.currentTimeLine.CheckedRows)) {
                            this.currentTimeLine.CheckedRows = [];
                        }
                        this.currentTimeLine.CheckedRows.push(row);
                       	this.actionsPanel.actions.get("btnNext").enable(true);
						this.actionsPanel.actions.get("btnCancel").enable(true);
                        return;
                    }
                    else {
                        e.grid.cells[e.row][0].firstChild.checked = false;
                        View.showMessage(getMessage("timeSelectedNotAvailable"));
                        return;
                    }
                }
                else {
                    e.grid.cells[e.row][0].firstChild.checked = false;
                    View.showMessage(getMessage("selectTimeError"));
                }
            }
        }
        else {
            // When checkbox is unchecked, all reservations of the unchecked resource will be removed.
            // Can only occur when removable is true
            if (confirm(getMessage("isRemoveAll"))) {
                var newEvents = this.currentTimeLine.getPendingEvents();
                for (var i = 0; i < newEvents.length; i++) {
                    if (newEvents[i].resource.resourceId == e.resourceId && newEvents[i].resource.removable) {
                        if (newEvents[i].eventId != null) {
                            //If corresponds to an existing reservation, set it to Cancelled
                            for (var i = 0; i < this.globalParameters.resourcesReservations.length; i++) {
                                if (newEvents[i].eventId == this.globalParameters.resourcesReservations[i].rsres_id) {
                                    this.globalParameters.resourcesReservations[i].status = 'Cancelled';
                                }
                            }
                        }
                        this.currentTimeLine.removeEvent(newEvents[i]);
                    }
                }
                if (valueExists(this.currentTimeLine.CheckedRows)) {
                    for (var j = 0; j < this.currentTimeLine.CheckedRows.length; j++) {
                        if (this.currentTimeLine.CheckedRows[j] == e.row) {
                            this.currentTimeLine.CheckedRows.splice(j, 1);
                        }
                    }
                }
                
                //Guo added 2008-08-26
                this.existResources();
            }
            else {
                e.grid.cells[e.row][0].firstChild.checked = false;
            }
        }
    },
    /**
     *
     * @param {Object} e
     * @param {Object} resource
     */
    viewResourcesDetails: function(e){
        //PC Changed 28/05/2007 to solve KB item 3015481
        //Create a restriction and open the room reservation details dialog
        var restriction = {
            'resources.resource_id': e.resourceId
        };
        View.openDialog("ab-rr-resource-details.axvw", restriction);
    },
    /**
     * Returns child element of specified timeline cell. (Guo added)
     * @param {Object} timelineId -- Timeline DIV ID attribute in AXVW.
     * @param {Object} row-- 0-based data row index (header rows are not included).
     * @param {Object} column-- 0-based column index.
     */
    getTimelineCellContent: function(timelineId, row, column){
        var div = $(timelineId);
        var table = div.getElementsByTagName("table")[0];
        var tbody = table.getElementsByTagName("tbody")[0];
        var tr = tbody.childNodes[row];
        var td = tr.childNodes[column];
        
        return td.firstChild;
    }
    
    
    // -------------------------------------------------------------------------------------------------
    // ------------------------  END  --  TIMELINE  --  METHODS  ---------------------------------------
    // -------------------------------------------------------------------------------------------------

})


/**
 * Select the first timeline
 * @param {Object} x -- number of tab
 * @param {Object} currentTab -- current number of tab
 */
function selectTablist(x){
      
    //If current select tab contains no UniqueResource, make the height of display area to 0. Added by ZY.
    if (addResourceReservContentController.UniqueResourceNum[x] == 0) {
        document.getElementById('resourceTimeline-' + x).style.height = '30';
    }
    
    addResourceReservContentController.currentTimelineIndex = x;
    addResourceReservContentController.currentTimeLine = addResourceReservContentController.arrTimeline[x];//guo added
}

/**
 * Create the non unique resources list, in the Limited and Unlimited Resources Seccion
 * @param {Object} ID
 */
function buildNonUniqueResourcesList(ID){
    //If there are not NonUniqueResource, show none. Added by ZY.
    if ((addResourceReservContentController.NonUniqueResourceNum == null) || (addResourceReservContentController.NonUniqueResourceNum == '') || (addResourceReservContentController.NonUniqueResourceNum[parseInt(ID)] == 0)) {
        writeLayer('buildNonUniqueResourcesList', '', '');
        return;
    }
    
    var NonUniqueResources = eval("(" + addResourceReservContentController.globalParameters.resourcesReservations.NonUniqueResources + ")");
    var reservation = addResourceReservContentController.globalParameters.reservation;
    //Added info on the Unlimited resources
    var onclick;
    var onadd;
    var info_icon_path;
    var appr_icon_path;
    var isApprovalRequired;
    var layerText = "";
	
	layerText += '<form name="formName">';
    layerText += '<table class="panelReport" width="1%" border="0"><tbody><tr>';
    layerText += '<th>' + getMessage("titleResource") + '</th>';
    layerText += '<th></th><th></th>';
    layerText += '<th>' + getMessage("titleAvQuantity") + '</th>';
    layerText += '<th>&nbsp;</th></tr>';
    
    for (var i = 0; i < NonUniqueResources.length; i++) {
        if (NonUniqueResources[i].resource_nature == addResourceReservContentController.ResourceNatures[ID]) {
        
            isApprovalRequired = NonUniqueResources[i].resources_approval;
            layerText += '<tr class="dataRow">';
            ///archibus/schema/ab-products/workplace/reservations/view/
            info_icon_path = "ab-rr-info.gif";
            appr_icon_path = "ab-rr-approval.gif";
            onclick = 'onclick="viewUnlimitedResourcesDetails(\'' + NonUniqueResources[i].resources_id + '\')"';
            onadd = 'onclick="onAddNonUniqueResourceReservation(\'' + NonUniqueResources[i].resources_id + '\')"';
            //layerTextNKS  
            //Guo changed 2008-08-06 to solve KB3018800          
            layerText += '<td width="40"><input name="resources_id' + i + '" type="text" size="32" value="' + NonUniqueResources[i].resources_id + '" readonly="true" style="border-width:0"></td>';
            layerText += '<td><img alt="' + getMessage('info') + '" ' + onclick + '" src="' + info_icon_path + '"></img></td>';
            if (isApprovalRequired == 1) {
                layerText += '<td><img alt="' + getMessage('approval') + '" src="' + appr_icon_path + '"></img></td>';
            }
            else {
                layerText += '<td></td>';
            }
            //KB 3019302: for Unlimited resource, show null quantity.
            if (NonUniqueResources[i].resources_type == "Unlimited") {
                layerText += '<td></td>';
            }
            else {
                //Guo changed 2008-08-06 to solve KB3018800        
                layerText += '<td><input name="qty' + i + '" type="text" style="border-width:0" size="2" value="' + NonUniqueResources[i].resources_quantity + '" readonly="true" ></td>';
                
            }
            layerText += '<td><input type="button" value="' + getMessage('add') + '" ' + onadd + '"></td>';
            layerText += '</tr>';
        }
    }
    layerText += '</tbody></table></form>';
    writeLayer('buildNonUniqueResourcesList', '', layerText);
    
	View.panels.get("buildNonUniqueResourcesListPanel").show(true);
	
    buildNonUniqueResourceReservationList(ID);
}

/**
 * added by keven
 * @param {Object} ID
 */
function buildNonUniqueResourceReservationList(ID){
    var resource; //Resource Object
    var resource_type; //Limited/Unlimited/Unique
    var resource_nature;
    //Edit/Remove button onclick event
    var onEdit;
    var onRemove;
    
    var resourcesReservations = addResourceReservContentController.globalParameters.resourcesReservations;
    
   	var layerText = "";
	
    layerText += '<form name="formNameSelection">';
    layerText += '<table class="panelReport" width="1%" border="0"><tbody><tr>';
    layerText += '<th>' + getMessage("titleResource") + '</th>';
    layerText += '<th>' + getMessage("titleFrom") + '</th>';
    layerText += '<th>' + getMessage("titleUntil") + '</th>';
    layerText += '<th>' + getMessage("titleResQuantity") + '</th>';
    layerText += '<th>' + getMessage("titleResourceReserveID") + '</th>';
    layerText += '<th>&nbsp;</th><th>&nbsp;</th></tr>';
    
    for (var i = 0; i < resourcesReservations.length; i++) {
        var event = resourcesReservations[i];
        resource = addResourceReservContentController.getResource(event.resource_id);
		
        resource_type = resource.resources_type;
        resource_nature = resource.resource_nature;
        if (((resource_type == 'Limited') || (resource_type == 'Unlimited')) && (resource_nature == addResourceReservContentController.ResourceNatures[ID]) && (event.status != 'Cancelled')) {
            layerText += '<tr class="dataRow">';
            onEdit = 'onclick="onEditNonUniqueResourceReservation(\'' + i + '\')"';
            onRemove = 'onclick="onRemoveNonUniqueResourceReservation(\'' + i + '\')"';
            //layerTextNKS 
            var rsres_id = (event.rsres_id == null) ? "" : event.rsres_id;
            var time_start = ABRV_convert12H(event.starttime);
            var time_end = ABRV_convert12H(event.endtime);
            //Guo changed 2008-08-06 to solve KB3018800        
            layerText += '<td><input name="resources_id' + i + '" type="text" size="32" style="border-width:0" value="' + event.resource_id + '" readonly="true"></td>';
            layerText += '<td><input id="start' + i + '" name="start' + i + '" type="text" size="10" style="border-width:0" value="' + time_start + '" readonly="true"></td>';
            layerText += '<td><input id="end' + i + '" name="end' + i + '" type="text" size="10" style="border-width:0" value="' + time_end + '" readonly="true"></td>';
            layerText += '<td><input name="resqty' + i + '" type="text" size="2" style="border-width:0" value="' + event.quantity + '" readonly="true" ></td>';
            layerText += '<td><input name="reserve_id' + i + '" type="text" size="32"  style="border-width:0" value="' + rsres_id + '" readonly="true"></td>';
            if (event.editable) {
                layerText += '<td><input type="button" value="' + getMessage('edit') + '" ' + onEdit + '"></td>';
            }
            else {
                layerText += '<td><input disabled type="button" value="' + getMessage('edit') + '"></td>';
            }
            if (event.removable) {
                layerText += '<td><input type="button" value="' + getMessage('remove') + '" ' + onRemove + '"></td>';
            }
            else {
                layerText += '<td><input disabled type="button" value="' + getMessage('remove') + '"></td>';
            }
            
            layerText += '</tr>';
        }
    }
    layerText += '</tbody></table></form>';
    writeLayer('selectedNonUniqueResourcesList', '', layerText);
	
	View.panels.get("selectedNonUniqueResourcesListPanel").show(true);
}

/**
 * added by keven
 * @param {Object} resource_id
 */
function onAddNonUniqueResourceReservation(resource_id){
    //Guo changed 2008-08-06 to solve KB3018800
    addResourceReservContentController.currentResource = addResourceReservContentController.getResource(resource_id);
    var resource_nature = addResourceReservContentController.currentResource.resource_nature;
    addResourceReservContentController.currentTabIndex = addResourceReservContentController.getCurTabIndexofResourceNatures(resource_nature);
    addResourceReservContentController.paramEventObj = null;
    addResourceReservContentController.paramEventIndex = -1;
    addResourceReservContentController.isAdd = true;
    
    //Kb# 3018810 Added by Keven
    addResourceReservContentController.globalParameters.reservation.time_start = addResourceReservContentController.selectResourceConsolePanel.getFieldValue("reserve.time_start");
    addResourceReservContentController.globalParameters.reservation.time_end = addResourceReservContentController.selectResourceConsolePanel.getFieldValue("reserve.time_end");
    addResourceReservContentController.loadNonUniqueDetailPanel();//Guo added 2008-08-06 to solve KB3018800
}

/**
 * This function is called when user click the Edit button
 * @param {Object} index --- the index of the element in the ResourcesReservations Array
 */
function onEditNonUniqueResourceReservation(index){
    //Guo changed 2008-08-06 to solve KB3018800
    addResourceReservContentController.paramEventObj = addResourceReservContentController.globalParameters.resourcesReservations[index];
    addResourceReservContentController.currentResource = addResourceReservContentController.getResource(addResourceReservContentController.paramEventObj.resource_id);
    var resource_nature = addResourceReservContentController.currentResource.resource_nature;
    addResourceReservContentController.currentTabIndex = addResourceReservContentController.getCurTabIndexofResourceNatures(resource_nature);
    addResourceReservContentController.paramEventIndex = index;
    addResourceReservContentController.isAdd = false;
    
    addResourceReservContentController.loadNonUniqueDetailPanel();
}

/**
 * This function is called when user click the Remove button
 * @param {Object} index --- the index of the element in the ResourcesReservations Array
 */
function onRemoveNonUniqueResourceReservation(index){
    var answer = confirm(getMessage('removeConfirm'));
    if (answer) {
        //@paramEvent --- a element in the ResourcesReservations Array ,is JSON
        var paramEvent = addResourceReservContentController.globalParameters.resourcesReservations[index];
        // If created in this session
        if (paramEvent.rsres_id == null) {
            var nonUniqueResource = addResourceReservContentController.globalParameters.resourcesReservations.NonUniqueResources;
            var uniqueResources = addResourceReservContentController.globalParameters.resourcesReservations.uniqueResources;
            var concurrentResourceReservations = addResourceReservContentController.globalParameters.resourcesReservations.ConcurrentResourceReservations;
            
            addResourceReservContentController.globalParameters.resourcesReservations.splice(index, 1);
            
            addResourceReservContentController.globalParameters.resourcesReservations.NonUniqueResources = nonUniqueResource;
            addResourceReservContentController.globalParameters.resourcesReservations.uniqueResources = uniqueResources;
            addResourceReservContentController.globalParameters.resourcesReservations.ConcurrentResourceReservations = concurrentResourceReservations;
        }
        // If an existing record, set status
        else {
            addResourceReservContentController.globalParameters.resourcesReservations[index].status = 'Cancelled';
        }
        var resource = addResourceReservContentController.getResource(paramEvent.resource_id);
        var resource_nature = resource.resource_nature;
        addResourceReservContentController.currentTabIndex = addResourceReservContentController.getCurTabIndexofResourceNatures(resource_nature);
        //redisplay the second list
        buildNonUniqueResourceReservationList(addResourceReservContentController.currentTabIndex);
        //Guo added 2008-08-26
        addResourceReservContentController.existResources();
    }
}

/**
 *
 * @param {Object} resource
 */
function viewUnlimitedResourcesDetails(resource){
    //PC Changed 28/05/2007 to solve KB item 3015481
    //Create a restriction and open the resources details dialog
    var restriction = {
        'resources.resource_id': resource
    };
    View.openDialog("ab-rr-resource-details.axvw", restriction);
}

/**
 * This function is called when clicking in the Cancel button
 */
function onCancel(){
    //Show a confirm window to the user to ensure that the user wants to cancel the process
    if (confirm(getMessage("msgBackExit"))) {
        //In case affirmative, clear all the JSObjects
        addResourceReservContentController.globalParameters.user = null;
        addResourceReservContentController.globalParameters.roomReservation = null;
        addResourceReservContentController.globalParameters.reservation = null;
        addResourceReservContentController.globalParameters.resourcesReservations = null;
        addResourceReservContentController.globalParameters.resourcesStd = null;
        addResourceReservContentController.globalParameters.timelineData = null;
        //Boolean indicating if selected timezone times are showed must be set to false
        addResourceReservContentController.existtimelinetz = false;
        
        //Redirect to My Reservations tab page
        addResourceReservContentController.mainTabs.selectTab("my-reservations");
    }
}

/**
 * Method to control the next step, to confirm resource reservation.
 */
function onConfirmNext(){

    var i;
    var j;
    var tempNonUniqueResources2 = new Array();
    var resourcesReservations = addResourceReservContentController.globalParameters.resourcesReservations;
    var resourcesReservationsArray = new Array();//Added by ZY for store resource reservations directly in current function, 2008-06-10.
    var isAllOk = true;
    var selectResources = false;
    
    //Added by Keven. Save the other object before resourcesReservations Array 
    resourcesReservationsArray.NonUniqueResources = addResourceReservContentController.globalParameters.resourcesReservations.NonUniqueResources;
    resourcesReservationsArray.UniqueResources = addResourceReservContentController.globalParameters.resourcesReservations.UniqueResources;
    resourcesReservationsArray.ConcurrentResourceReservations = addResourceReservContentController.globalParameters.resourcesReservations.ConcurrentResourceReservations;
    // -------------------------------------------------------------------------------------------------
    // Assign the pending events per timeline to the corresponding tab (replacing the empty object)
    // -------------------------------------------------------------------------------------------------
    var arrTimeline = addResourceReservContentController.arrTimeline;
    for (i = 0; i < arrTimeline.length; i++) {
        if (arrTimeline[i] != null) {
            if (arrTimeline[i].model.events != "") {
                for (j = 0; j < arrTimeline[i].model.events.length; j++) {
                    if (arrTimeline[i].model.events[j].canEdit) {
                        arrTimeline[i].model.events[j].status = 3;
                        arrTimeline[i].model.events[j].dateTimeStart = arrTimeline[i].model.events[j].timeline.getColumnDateTime(arrTimeline[i].model.events[j].columnStart);
                        arrTimeline[i].model.events[j].dateTimeEnd = arrTimeline[i].model.events[j].timeline.getColumnDateTime(arrTimeline[i].model.events[j].columnEnd + 1);
                        //PC - 2007-05-17 Changed to avoid mix of formats in the resources confirmation page, 
                        //previously some resources were showed as 17:00 and other as 15:00:00
                        if (timePattern24H == timePattern) {
                            arrTimeline[i].model.events[j].dateTimeStart = left(arrTimeline[i].model.events[j].dateTimeStart, 5);
                            arrTimeline[i].model.events[j].dateTimeEnd = left(arrTimeline[i].model.events[j].dateTimeEnd, 5);
                        }
                        selectResources = true;
                    }
                }
            } // End if (arrTimeline[i].model.events!="") 
            //Directly store Unique Resource Reservation events to ResourcesReservationArray. Added by ZY, 2008-06-10.
            saveEventsToResourcesReservationArray(resourcesReservationsArray, arrTimeline[i].getPendingEvents(), true);
        }// End if (arrTimeline[i]!=null) 
    } // End for
    //Guo added 2008-07-25
    if (valueExists(addResourceReservContentController.cancelledTimelineEvents)) {
        addCancelledEventsToResourcesReservationArray(resourcesReservationsArray);
    }
    // -------------------------------------------------------------------------------------------------
    // Assign the nonUnique events to the corresponding tab (replacing the empty object)
    // -------------------------------------------------------------------------------------------------
    j = 0;
    
    for (i = 0; i < resourcesReservations.length; i++) {
        var event = resourcesReservations[i];
        selectResources = true;
        var resource = new Object();
        var pendingObj = new Object();
        //var pendingArray = new Array();
        var curResource = addResourceReservContentController.getResource(event.resource_id);
        var resource_type = curResource.resources_type;
        if ((resource_type == 'Limited') || (resource_type == 'Unlimited')) {
            //Maximum amount of resources available
            resource.resources_quantity = curResource.resources_quantity;
            resource.resourceId = curResource.resources_id;
            resource.resource_nature = curResource.resource_nature;
            resource.resources_name = curResource.resources_name;
            resource.resources_approval = curResource.resources_approval;
            resource.resources_day_end = curResource.resources_day_end;
            resource.default_calculation = curResource.default_calculation;
            resource.resources_std = curResource.resources_std;
            resource.resource_name = curResource.resource_name;
            resource.resources_type = curResource.resources_type;
            resource.resources_date_start = curResource.resources_date_start;
            resource.editable = event.editable;
            resource.removable = event.removable;
            
            resource.quantity = event.quantity;
            resource.rsres_id = ((event.rsres_id == null) ? "" : event.rsres_id);
            //resource.comments = event.comments;
            resource.status = ((event.status == null) ? "" : event.status); //Added by keven 2008-6-16
            pendingObj.resource = resource;
            pendingObj.dateTimeStart = event.starttime;
            pendingObj.dateTimeEnd = event.endtime;
            pendingObj.comments = event.comments; //Added by keven 2008-6-26
            tempNonUniqueResources2[j] = pendingObj;
            j++;
            
        }
    } // End for
    //Directly store NonUnique Resource Reservation to ResourcesReservationArray. Added by ZY, 2008-06-10.
    saveEventsToResourcesReservationArray(resourcesReservationsArray, tempNonUniqueResources2, false);
    
    if (!selectResources) {
        View.showMessage(getMessage("selectResourceAndTimeError"));
        return;
    }
    
    if (isAllOk) {
        //start guo added
        var reservation = addResourceReservContentController.globalParameters.reservation;
        var roomReservation = addResourceReservContentController.globalParameters.roomReservation;
        var roomConflicts = addResourceReservContentController.globalParameters.roomConflicts;
        //Here directly set resourcesReservationsArray to window.tabs.resourcesReservations. Modified by ZY, 2008-06-26.		
        addResourceReservContentController.globalParameters.resourcesReservations = resourcesReservationsArray;
        addResourceReservContentController.globalParameters.resourceConflicts = [];
        if (reservation.res_id == "") {
            var reservation_name = "";
            if (reservation.res_type == 'recurring') {
                reservation_name += getMessage("recurringresfor") + " ";
            }
            else {
                reservation_name += getMessage("reservationfor") + " ";
            }
            reservation_name += reservation.date_start[0] + " " + reservation.time_start;
            reservation.reservation_name = reservation_name;
        }
        if (reservation.res_type != "recurring") {
            if (roomReservation.rmres_id != "") {
                roomConflicts = [];
                var objectsToSave = [reservation, roomReservation, roomConflicts, addResourceReservContentController.globalParameters.resourcesReservations];
                var jsonReservation = toJSON(objectsToSave);
               
				try{
					var results = Workflow.callMethod("AbWorkplaceReservations-resource-detectResourceConflicts", jsonReservation);
					afterDetectResourceConflicts(results);
				}catch(e){
					Workflow.handleError(e);
				}
            }
            else {
                addResourceReservContentController.mainTabs.showTab('resourceReservationConfirm', true);
                addResourceReservContentController.mainTabs.hideTab('resourcesReservation');
                addResourceReservContentController.mainTabs.selectTab('resourceReservationConfirm');
            }
        }
        else {
            if (roomConflicts == null || roomConflicts == undefined) {
                roomConflicts = [];
            }
            var objectsToSave = [reservation, roomReservation, roomConflicts, addResourceReservContentController.globalParameters.resourcesReservations];
            var jsonReservation = toJSON(objectsToSave);
               
            var results = Workflow.callMethod("AbWorkplaceReservations-resource-detectResourceConflicts", jsonReservation);
			afterDetectResourceConflicts(results);
        }
        //end guo added
    }
    else {
        View.showMessage(getMessage("selectTimeError"));
    }
}

/**
 *
 * @param {Object} resourcesReservationsArray
 * @param {Object} events
 * @param {Object} isUnique
 */
function saveEventsToResourcesReservationArray(resourcesReservationsArray, events, isUnique){
    if (events != null) {
        var counter = resourcesReservationsArray.length;
        var reservation = addResourceReservContentController.globalParameters.reservation;
        for (var i = 0; i < events.length; i++) {
            resourcesReservationsArray[counter] = new Object();
            resourcesReservationsArray[counter].resource_id = events[i].resource.resourceId;
            resourcesReservationsArray[counter].endtime = events[i].dateTimeEnd;
            resourcesReservationsArray[counter].starttime = events[i].dateTimeStart;
            resourcesReservationsArray[counter].quantity = events[i].resource.quantity;
            resourcesReservationsArray[counter].comments = events[i].comments;
            resourcesReservationsArray[counter].date_start = reservation.date_start[0];
            
            if ((isUnique) && (events[i].status == 3) && (events[i].canEdit) && (valueExists(events[i].eventId))) {
                resourcesReservationsArray[counter].rsres_id = events[i].eventId;
                //Added by keven 2008-7-11
                resourcesReservationsArray[counter].status = getStatusOfEditUniqueResourceReservation(events[i].eventId);
                
            }
            if (!isUnique) {
                resourcesReservationsArray[counter].rsres_id = events[i].resource.rsres_id;
                resourcesReservationsArray[counter].status = events[i].resource.status;//Added by keven 2008-6-16
            }
            counter++;
        }
    }
}

/**
 *
 * @param {Object} resourcesReservationsArray
 * add by Guo 2008-07-25
 */
function addCancelledEventsToResourcesReservationArray(resourcesReservationsArray){
    var cancelledTimelineEvents = eval("(" + addResourceReservContentController.cancelledTimelineEvents + ")");
    var reservation = addResourceReservContentController.globalParameters.reservation;
    var counter = resourcesReservationsArray.length;
    for (var i = 0; i < cancelledTimelineEvents.length; i++) {
        resourcesReservationsArray[counter] = new Object();
        resourcesReservationsArray[counter].resource_id = cancelledTimelineEvents[i].resource_id;
        resourcesReservationsArray[counter].endtime = cancelledTimelineEvents[i].endtime;
        resourcesReservationsArray[counter].starttime = cancelledTimelineEvents[i].starttime;
        resourcesReservationsArray[counter].quantity = cancelledTimelineEvents[i].quantity;
        resourcesReservationsArray[counter].comments = cancelledTimelineEvents[i].comments;
        resourcesReservationsArray[counter].date_start = reservation.date_start[0];
        resourcesReservationsArray[counter].rsres_id = cancelledTimelineEvents[i].eventId;
        resourcesReservationsArray[counter].status = cancelledTimelineEvents[i].status;
        
        counter++;
    }
    //window.tabs.cancelledTimelineEvents = null;
}

/**
 * Get Status of existent unique resource reservation
 * Added by keven 2008-7-11
 * @param {Object} rsResID
 */
function getStatusOfEditUniqueResourceReservation(rsResID){
    for (var i = 0; i < addResourceReservContentController.globalParameters.resourcesReservations.length; i++) {
        var event = addResourceReservContentController.globalParameters.resourcesReservations[i];
        if (event.rsres_id == rsResID) {
            return event.status;
        }
    }
    return "";
}

/**
 *
 * @param {Object} whichLayer
 */
function showActiveLayer(whichLayer){
    //Boolean indicating if selected timezone times are showed must be set to false
    addResourceReservContentController.existtimelinetz = false;
    //Select additional timezone should be empty
    var timezonePanel = View.panels.get('select_timezone');
    timezonePanel.setFieldValue('afm_timezones.timezone_id', '');
    
    for (var i = 0; i < addResourceReservContentController.timeName.length; i++) {
        //If there are no timeline for resources, just return. 
        if (!addResourceReservContentController.arrTimeline[i]) {
            continue;
        }
        
        if (addResourceReservContentController.timeName[i] == whichLayer) {
            //Render only one visible timeline when the user changes the tab
            
            // document.getElementById(whichLayer).style.position = "absolute";
            // document.getElementById(whichLayer).style.top = "1px";
            
            addResourceReservContentController.arrTimeline[i].show();
            
            addResourceReservContentController.currentTimelineIndex = i;
            addResourceReservContentController.currentTimeLine = addResourceReservContentController.arrTimeline[i];//guo added
            onChangeTimes();//guo added
            setCheckBoxValueOfTimeLine(addResourceReservContentController.currentTimeLine);//guo added 2008-07-11
            //Select additional timezone should be enabled
            timezonePanel.enableField('afm_timezones.timezone_id', true)
            //$('afm_timezones.timezone_id').disabled = false;
            //$('afm_timezones.timezone_id').nextSibling.disabled = false;
        }
        else {
            //Hidden timeline must clear its absolutely positioned elements
            addResourceReservContentController.arrTimeline[i].hide();
        }
    }
}

function left(str, n){
    if (n <= 0) 
        return "";
    else 
        if (n > String(str).length) 
            return str;
        else 
            return String(str).substring(0, n);
}

/**
 * Add / Remove / Edit nonUniqueResources
 * @param {Object} id
 * @param {Object} value
 * @param {Object} stype
 */
function changeNonUniqueResources(id, value, stype){
    var NonUniqueResources = eval("(" + addResourceReservContentController.ResourceInfo.NonUniqueResources + ")");
    if (stype == "Unlimited") {
        NonUniqueResources[id].resources_quantity = '1';
        NonUniqueResources[id].quantity = "" + (value * 1);
    }
    else {
        NonUniqueResources[id].resources_quantity = "" + ((NonUniqueResources[id].resources_quantity * 1) - value);
        NonUniqueResources[id].quantity = "" + ((NonUniqueResources[id].quantity * 1) + (value * 1));
    }
    addResourceReservContentController.ResourceInfo.NonUniqueResources = toJSON(NonUniqueResources);
    addResourceReservContentController.globalParameters.resourcesReservations.NonUniqueResources = ResourceInfo.NonUniqueResources;
}

/**
 *
 * @param {Object} ID
 * @param {Object} parentID
 * @param {Object} sText
 */
function writeLayer(ID, parentID, sText){
    if (document.layers) {
        var oLayer;
        if (parentID) 
            oLayer = eval('document.' + parentID + '.document.' + ID + '.document');
        else 
            oLayer = document.layers[ID].document;
        oLayer.open();
        oLayer.write(sText);
        oLayer.close();
    }
    else {
        if ((parseInt(navigator.appVersion) >= 5) && (navigator.appName == "Netscape")) {
            document.getElementById(ID).innerHTML = sText;
        }
        else 
            if (document.all) 
                document.all[ID].innerHTML = sText;
    }
}

/**
 * #####TO DO -- this method is not used, delete?
 * Check whether the time scope of a NonUnique Resource's reservation is consistent with an existed room reservtion.
 * @param {Object} s -- 'start' or 'end'
 * @param {Object} id -- resource reservation's id
 */
function checkNonUniqueResourcesTimeScope(s, id){
    var correct = true;
    var existedS = document.getElementById('time_start' + id).value;
    var existedE = document.getElementById('time_end' + id).value;
    
    validationAndConvertionTimeInput(document.getElementById(s + id), 'time_' + s + id, null, false, true, false);
    
    var sTemp = document.getElementById('Storedstart' + id).value;
    var eTemp = document.getElementById('Storedend' + id).value;
    if (!sTemp) 
        sTemp = ABRV_convert24H(existedS);
    if (!eTemp) 
        eTemp = ABRV_convert24H(existedE);
    
    //If existed a room reservation, check time scope.
    if (addResourceReservContentController.globalParameters.roomReservation && addResourceReservContentController.globalParameters.roomReservation.rmres_id) {
        if (s == "start") {
            if (ABRV_isMinnor(ABRV_convert24H(sTemp), ABRV_convert24H(addResourceReservContentController.globalParameters.roomReservation.time_start))) {
                View.showMessage(getMessage('errorStartTimeScope'));
                document.getElementById('start' + id).value = existedS;
                document.getElementById('time_start' + id).value = existedS;
                return false;
            }
        }
        else {
            if (ABRV_isMinnor(ABRV_convert24H(addResourceReservContentController.globalParameters.roomReservation.time_end), convert24H(eTemp))) {
                View.showMessage(getMessage('errorEndTimeScope'));
                document.getElementById('end' + id).value = existedE;
                document.getElementById('time_end' + id).value = existedE;
                return false;
            }
        }
    }
    
    //check if end time after start time
    if (ABRV_isMinnor(ABRV_convert24H(eTemp), ABRV_convert24H(sTemp))) {
        View.showMessage(getMessage('selectTimeError'));
        if (s == "start") {
            document.getElementById('start' + id).value = existedS;
            document.getElementById('time_start' + id).value = existedS;
        }
        else {
            document.getElementById('end' + id).value = existedE;
            document.getElementById('time_end' + id).value = existedE;
        }
        return false;
    }
    
    storeNonUniqueResources(s, id);
    return true;
}

/**
 * #### TO DO -- This method is not used
 * Add / Remove / Edit nonUniqueResources
 * @param {Object} s
 * @param {Object} id
 */
function storeNonUniqueResources(s, id){
    var sTemp = document.getElementById('Stored' + s + id).value;
    sTemp = sTemp.substring(0, 5);
    
    var NonUniqueResources = eval("(" + ResourceInfo.NonUniqueResources + ")");
    
    if (s == "start") {
        NonUniqueResources[id].resources_date_start = ABRV_convert12H(sTemp);
    }
    else {
        NonUniqueResources[id].resources_day_end = ABRV_convert12H(sTemp);
    }
    
    ResourceInfo.NonUniqueResources = toJSON(NonUniqueResources);
    addResourceReservContentController.globalParameters.resourcesReservations.NonUniqueResources = ResourceInfo.NonUniqueResources;
    document.getElementById('time_' + s + id).value = ABRV_convert12H(sTemp);
}

/**
 * Check whether the time scope of an unique Resource's reservation is consistent with an existed room reservtion
 * @param {Object} time_start -- resource reservation's start time
 * @param {Object} time_end -- resource reservation's end time
 */
function outOfRoomReservationsTimeScope(time_start, time_end){

    if (addResourceReservContentController.globalParameters.roomReservation && addResourceReservContentController.globalParameters.roomReservation.rmres_id) {
        var roomRreservation = addResourceReservContentController.globalParameters.roomReservation;
        //Modified for kb#3019118 by ZY, 2008-08-12
        if (ABRV_isMinnor(ABRV_convert24H(time_start), ABRV_convert24H(roomRreservation.time_start)) || ABRV_isMinnor(ABRV_convert24H(roomRreservation.time_end), ABRV_convert24H(time_end))) 
            return true;
        else 
            return false;
    }
    return false;
}

/**
 * Load/Hidden the recurring_panel and enable/disable some timeline's buttons
 * Guo added
 */
function optionResType(){
    var resType = View.panels.get('selectResourceConsolePanel').getFieldValue("reserve.res_type");
    var recurring_panel = View.panels.get('resource_recurring_panel');
    if (resType == "recurring") {
        recurring_panel.show(true);
		var divScroll = Ext.getDom("nested_north_north_div");
		try {
			divScroll.parentNode.scrollTop = divScroll.scrollHeight / 3;
		}catch(e){
			//Nothing
		}
    }
    else {
        recurring_panel.show(false);
    }
    for (i = 0; i < addResourceReservContentController.arrTimeline.length; i++) 
        if (addResourceReservContentController.arrTimeline[i] != null) {
            addResourceReservContentController.arrTimeline[i].refreshRowBlocks();
        }
}

/**
 * call back  when WFR DetectResourceConflicts executed to select the tab accoring the result
 * Guo added
 * @param {Object} result
 */
function afterDetectResourceConflicts(result) {
    if (result.code != "executed") {
        View.showMessage(result.message);
        return;
    }
	
    if (result.message != "OK") {
        View.showMessage(getMessage("checkAvailabilityOfResourcesFailed"));
        return;
    }
    
    var resourceConflicts = eval("(" + result.jsonExpression + ")");
    
    if (resourceConflicts.length == 0) {
        addResourceReservContentController.mainTabs.showTab('resourceReservationConfirm', true);
        addResourceReservContentController.mainTabs.hideTab('resourcesReservation');
        addResourceReservContentController.mainTabs.selectTab('resourceReservationConfirm');
    } else {
        //Guo added 2008-07-29 to solve KB3018837
        //Temporary while conflicts can't be solved, check that there's any available date. If all the dates are conflicts, then alert the user and stop here
       	var isRecurring = (addResourceReservContentController.globalParameters.reservation.res_type == "recurring"); 
	    var isConflict = (resourceConflicts.length == (addResourceReservContentController.globalParameters.resourcesReservations.length * addResourceReservContentController.globalParameters.reservation.date_start.length));
		 
		if (isRecurring && isConflict) {
            View.showMessage(getMessage("allDatesOccupiedError"));
        } else {
            addResourceReservContentController.globalParameters.resourceConflicts = resourceConflicts;
            addResourceReservContentController.mainTabs.hideTab('resourceReservationConfirm');
            addResourceReservContentController.mainTabs.hideTab('resourcesReservation');
            addResourceReservContentController.mainTabs.showTab('resourceReservationConflicts', true);
            addResourceReservContentController.mainTabs.selectTab('resourceReservationConflicts');
        }
    }
    
}

/**
 * Method when user changes the time start or time end fields in the Select Resource form
 * Guo added
 * @param {Object} fieldName
 */
function onChangeTimes(fieldName){
    if (valueExists(fieldName)) {
        //Validate and save changed values to the form JS variables
        afm_form_values_changed = true;
    }
    
    //Get stand and end time values
    var consolePanel = View.panels.get('selectResourceConsolePanel');
    var time_start = consolePanel.getFieldValue("reserve.time_start");
    var time_end = consolePanel.getFieldValue("reserve.time_end");
    if (valueExists(addResourceReservContentController.currentTimeLine)) {
        var disableCheckBox = true;
        if ((time_start != "") && (time_end != "")) {
            disableCheckBox = false;
        }
        
        var resourceLen = addResourceReservContentController.currentTimeLine.getTimeline().resources.length;
        for (var j = 0; j < resourceLen; j++) {
            //[There is no longer a] Difference of two rows in timeline (i+2) [now that we use <thead> for header]
            var checkBox = addResourceReservContentController.getTimelineCellContent(addResourceReservContentController.currentTimeLine.grid.id, j, 0);
            checkBox.disabled = disableCheckBox;
        }
    }
}



/**
 * This function is called when user click the selectValue button of Resource Standard field in console panel
 */
function selectResourceStd(){
    View.selectValue('selectResourceConsolePanel', getMessage('resourceStandard'), ['resource_std'], 'resource_std', ['resource_std.resource_std'], ['resource_std.resource_std'], '', 'afterSelectResourceStd', false, true, '', 400, 600, 'grid', 0, toJSON([{
        fieldName: 'resource_std.resource_std',
        sortOrder: 1
    }]));
}

/**
 * Set the value of resource standard field after selected
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 */
function afterSelectResourceStd(fieldName, selectedValue, previousValue){
    $('resources.resource_std').value = selectedValue;
}

/**
 * Method to check if all the fields have been set in recurring panel (Guo added)
 * @param {Object} timeline -- Timeline controller object.
 */
function setCheckBoxValueOfTimeLine(timeline){
    if (valueExists(timeline.CheckedRows)) {
        for (var j = 0; j < timeline.CheckedRows.length; j++) {
            //[There is no longer a] Difference of two rows in timeline (i+2) [now that we use <thead> for header]
            var checkBox = addResourceReservContentController.getTimelineCellContent(timeline.grid.id, timeline.CheckedRows[j], 0);
            checkBox.checked = true;
        }
    }
}

/**
 * check the input value is correct
 * @param {Object} timeStart
 * @param {Object} timeEnd
 * @param {Object} quantity
 * @return value  true /false
 */
function checkInputs(timeStart, timeEnd, quantity){
    //Guo added 2008-09-03 to solve KB3019460 and KB3019462
    if (!timeStart || !timeEnd) {
        View.showMessage(getMessage('timeFieldEmpty'));
        return false;
    }
    if (!quantity) {
        View.showMessage(getMessage('quantityEmpty'));
        return false;
    }
    if (!ABRV_isMinnor(timeStart, timeEnd)) {
        View.showMessage(getMessage('selectTimeError'));
        return false;
    }
    if (quantity <= 0) {
        View.showMessage(getMessage('selectQuantityError'));
        return false;
    }
    return true;
}

/**
 * private function
 * @param {Object} event1 --  an event from the ResourceReservations array
 * @param {Object} event2 --  an event from the ResourceReservations array
 */
function isEquals(event1, event2){
    var returnValue = false;
    
    if ((event1 == null) || (event2 == null)) {
        if ((event1 == null) && (event2 == null)) {
            returnValue = true;
        }
        else {
            returnValue = false;
        }
        
    }
    else {
        if ((event1.resource_id == event2.resource_id) &&
        (event1.rsres_id == event2.rsres_id) &&
        (event1.starttime == event2.starttime) &&
        (event1.endtime == event2.endtime) &&
        (event1.quantity == event2.quantity)) {
            returnValue = true;
        }
        else {
            returnValue = false;
        }
    }
    return returnValue;
    
}

/**
 * return "09:40.0.000"
 * @param {Object} hour --- "09:30.0.000"
 * @param {Object} minutes --- 10
 */
function addMinutes(hour, minutes){
    var hour1 = getTimeWith24Format(hour);
    var date1 = new Date(new Date().toDateString() + ' ' + hour1);
    minutes = parseInt(minutes);
    var interTimes = minutes * 60 * 1000;
    interTimes = parseInt(interTimes);
    var newDate = new Date(Date.parse(date1) + interTimes);
    return ((newDate.getHours() < 10) ? "0" : "") + newDate.getHours() + ":" + ((newDate.getMinutes() < 10) ? "0" : "") + newDate.getMinutes() + ".0.000";
}

/**
 * return "09:20.0.000"
 * @param {Object} hour --- "09:30.0.000"
 * @param {Object} minutes --- 10
 */
function desendMinutes(hour, minutes){
    var hour1 = getTimeWith24Format(hour);
    var date1 = new Date(new Date().toDateString() + ' ' + hour1);
    minutes = parseInt(minutes);
    var interTimes = minutes * 60 * 1000;
    interTimes = parseInt(interTimes);
    var newDate = new Date(Date.parse(date1) - interTimes);
    return ((newDate.getHours() < 10) ? "0" : "") + newDate.getHours() + ":" + ((newDate.getMinutes() < 10) ? "0" : "") + newDate.getMinutes() + ".0.000";
}

/**
 * return the max hour
 * @param {Object} hour1
 * @param {Object} hour2
 */
function maxHour(hour1, hour2){
    return ABRV_isMinnor(hour1, hour2) ? hour2 : hour1;
}

/**
 * return the min hour
 * @param {Object} hour1
 * @param {Object} hour2
 */
function minHour(hour1, hour2){
    return ABRV_isMinnor(hour1, hour2) ? hour1 : hour2;
}
