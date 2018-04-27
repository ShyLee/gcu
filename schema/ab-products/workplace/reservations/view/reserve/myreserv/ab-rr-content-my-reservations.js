
var myReservContentController = View.createController("myReservContentController", {

    mainTabs: null,
    detailstabs: null,
    globalParameters: null,
    userRestriction: null,
    
    /**
     * This function is called when the page is loaded into the browser.
     */
    afterInitialDataFetch: function(){
        this.mainTabs = View.getControl('', 'createEditResevationTabs');
        this.globalParameters = View.getOpenerView().controllers.get(0);
        this.onStart();
    },
    myReservationConsolePanel_afterRefresh: function(){
        this.updateConsole();
		if (this.globalParameters.isReturnFromEditTab){
			this.detailstabs.selectTab(this.detailstabs.selectedTabName);
		}
    },
    /**
     *
     */
    onStart: function(){
        //onloadHelper();
        //BEGIN Check by default the All status option
        $("status_all").checked = true;
        $("reserve.status").disabled = true;
        
        //Generate the translated label for the "All Statuses" checkbox
        var checkboxAll = $("status_all");
        var checkboxParent = checkboxAll.parentNode;
        
        checkboxParent.appendChild(window.document.createTextNode(getMessage("AllStatuses")));
        //END Check by defaul the All status option
        
        this.detailstabs = View.getControl('', 'viewReservationTabs');
        
        if (this.detailstabs == null) {
            View.showMessage(getMessage("errorTabs"));
        }
        
        //Update the console values with the ones from the User object
        this.globalParameters.user = View.user;
		//use this flag for refreshing the current detail tab after edit the reservation
		this.globalParameters.isReturnFromEditTab = false;
        
        // Check the security groups the user belongs to, in order to restrict the list of reservations that must be showed
        // and call the onSearch() function to apply both, the user restriction and the console restrictions (by default country and site are filled)
        this.myReservationConsolePanel_onSearch();
    },
    /**
     * This function is called when the button Clear is clicked
     */
    myReservationConsolePanel_onClear: function(){
        //Clear all the console value fields
        this.myReservationConsolePanel.fields.each(function(field){
            var fieldName = field.getFullName();
            myReservContentController.myReservationConsolePanel.setFieldValue(fieldName, "");
        })
        
        $("status_all").checked = true;
        $("reserve.status").disabled = true;
        
        document.getElementById("resource_id").value = "";
        document.getElementById("resource_std").value = "";
        
        //PC commented in order to solve the KB item 3015463
    
        //Clear all the existing restrictions for the three editable reports
        //window.tabs.setTabsRestriction("", "my-reservations");
        //window.detailstabs.setTabsRestriction("", "info-reservations");		
        //window.detailstabs.setTabsRestriction("", "rm-reservations");
        //window.detailstabs.setTabsRestriction("", "rs-reservations");
        //Show by default the first editable report
        //window.tabs.selectTab("info-reservations");
        //Check the security groups the user belongs to, in order to restrict the 
        //list of reservations that must be showed
        //testRestricction();
    },
    /**
     * This function is called when the button Search is clicked
     */
    myReservationConsolePanel_onSearch: function(){
        var reservation = {};
        var reservation_resource_std = new Array(1);
        
        //Clear all the existing restrictions for the three editable reports
        this.mainTabs.setTabRestriction("my-reservations",{});
        this.detailstabs.setTabRestriction("info-reservations", {});
        this.detailstabs.setTabRestriction("rm-reservations", {});
        this.detailstabs.setTabRestriction("rs-reservations", {});
        
        //Check the security groups the user belongs to, in order to restrict the 
        //list of reservations that must be showed
        this.testRestricction();
        
        //Update the JSObjects values with the selected information in the console fields
        reservation.ctry_id = this.myReservationConsolePanel.getFieldValue("bl.ctry_id");
        reservation.user_created_by = this.myReservationConsolePanel.getFieldValue("reserve.user_created_by");
        reservation.dv_id = this.myReservationConsolePanel.getFieldValue("reserve.dv_id");
        reservation.res_id = this.myReservationConsolePanel.getFieldValue("reserve.res_id");
        reservation.site_id = this.myReservationConsolePanel.getFieldValue("bl.site_id");
        reservation.user_requested_by = this.myReservationConsolePanel.getFieldValue("reserve.user_requested_by");
        reservation.dp_id = this.myReservationConsolePanel.getFieldValue("reserve.dp_id");
        reservation.date_start = this.myReservationConsolePanel.getFieldValue("reserve.date_start");
        reservation.date_end = this.myReservationConsolePanel.getFieldValue("reserve.date_end");
        reservation.bl_id = this.myReservationConsolePanel.getFieldValue("reserve_rm.bl_id");
        reservation.user_requested_for = this.myReservationConsolePanel.getFieldValue("reserve.user_requested_for");
        reservation.time_start = ABRV_formatTime(this.myReservationConsolePanel.getFieldValue("reserve.time_start"));
        reservation.fl_id = this.myReservationConsolePanel.getFieldValue("reserve_rm.fl_id");
        reservation.phone = this.myReservationConsolePanel.getFieldValue("reserve.phone");
        reservation.reservation_name = this.myReservationConsolePanel.getFieldValue("reserve.reservation_name");
        reservation.time_end = ABRV_formatTime(this.myReservationConsolePanel.getFieldValue("reserve.time_end"));
        reservation.rm_id = this.myReservationConsolePanel.getFieldValue("reserve_rm.rm_id");
        reservation.config_id = this.myReservationConsolePanel.getFieldValue("reserve_rm.config_id");
        reservation.email = this.myReservationConsolePanel.getFieldValue("reserve.email");
        reservation.status = this.myReservationConsolePanel.getFieldValue("reserve.status");
        
        reservation.resource_id = $("resource_id").value;
        reservation_resource_std[0] = $("resource_std").value;
        reservation.resource_stds = [reservation_resource_std[0]];
        
        this.globalParameters.reservation = reservation;
        
        //Create the restrictions to apply with the values selected by the user
        this.createRestrictions();
    },
    /**
     * To check the security groups the user belongs to, in order to restrict the
     * list of reservations that must be shown
     */
    testRestricction: function(){
        var existGroupHOST = false;
        var existGroupDESK_MANAGER = false;
        var existGroupASSISTANT = false;
        var restric = "";
        var title = "";
        
        if (ABRV_isMemberOfGroup(View.user, 'RESERVATION HOST')) 
            existGroupHOST = true;
        
        if (ABRV_isMemberOfGroup(View.user, 'RESERVATION ASSISTANT')) 
            existGroupASSISTANT = true;
        
        // PC KB 3021918
        if (ABRV_isMemberOfGroup(View.user, 'RESERVATION SERVICE DESK') || ABRV_isMemberOfGroup(View.user, 'RESERVATION MANAGER') || ABRV_isMemberOfGroup(View.user, '%')) 
            existGroupDESK_MANAGER = true;
        
        this.userRestriction = new Ab.view.Restriction();
        //If any of the groups in the User.groups[] array is 'RESERVATION SERVICE DESK' or 'RESERVATION MANAGER' 
        //we don't have to apply any restriction
        if (existGroupDESK_MANAGER) {
            //this.userRestriction = "";
        }
        
        //If any of the groups in the User.groups[] array is 'RESERVATION ASSISTANT'
        if (existGroupASSISTANT) {
            this.userRestriction.addClause("reserve.user_created_by", View.user.employee.id, "=", ")AND(");
            this.userRestriction.addClause("reserve.user_requested_by", View.user.employee.id, "=", "OR");
            this.userRestriction.addClause("reserve.user_requested_for", View.user.employee.id, "=", "OR");
        }
        
        //If any of the groups in the User.groups[] array is 'RESERVATION HOST'
        if (existGroupHOST) {
            this.userRestriction.addClause("reserve.user_created_by", View.user.employee.id, "=", ")AND(");
            this.userRestriction.addClause("reserve.user_requested_for", View.user.employee.id, "=", "OR");
        }
        //If we have generated a userRestriction, apply it to the three editable reports
        if (this.userRestriction.clauses.length >0) {
            this.detailstabs.setTabRestriction("info-reservations", this.userRestriction);
            this.detailstabs.setTabRestriction("rm-reservations", this.userRestriction);
            this.detailstabs.setTabRestriction("rs-reservations", this.userRestriction);
            this.detailstabs.selectTab("info-reservations");
        }
    },
    /**
     * Updates console fields from the reservation JS object.
     */
    updateConsole: function(){
        this.myReservationConsolePanel.setFieldValue("bl.ctry_id", View.user.employee.space.countryId);
        this.myReservationConsolePanel.setFieldValue("bl.site_id", View.user.employee.space.siteId);
        this.myReservationConsolePanel.setFieldValue("reserve_rm.bl_id", View.user.employee.space.buildingId);
    },
    
    /**
     * To create the restrictions to apply with the values selected by the user.
     * The restrictions to apply (one for each editable report, as no all the filter
     * fields can be applied to all the tables) to the three editable reports
     * will be created as follows:
     */
    createRestrictions: function(){
        var reservation = this.globalParameters.reservation;
        var userRestriction = this.userRestriction;
        var reserverest = new Ab.view.Restriction();
        var reserve_rmrest = new Ab.view.Restriction();
        var reserve_rsrest = new Ab.view.Restriction();
        
        if (reservation.ctry_id != "") {
            reserve_rmrest.addClause("bl.ctry_id", reservation.ctry_id, "=");
            reserve_rsrest.addClause("bl.ctry_id", reservation.ctry_id, "=");
        }
        if (reservation.site_id != "") {
            reserve_rmrest.addClause("bl.site_id", reservation.site_id, "=");
            reserve_rsrest.addClause("bl.site_id", reservation.site_id, "=");
        }
        if (reservation.bl_id != "") {
            reserve_rmrest.addClause("reserve_rm.bl_id", reservation.bl_id, "=");
            reserve_rsrest.addClause("reserve_rs.bl_id", reservation.bl_id, "=");
        }
        if (reservation.fl_id != "") {
            reserve_rmrest.addClause("reserve_rm.fl_id", reservation.fl_id, "=");
            reserve_rsrest.addClause("reserve_rs.fl_id", reservation.fl_id, "=");
        }
        if (reservation.rm_id != "") {
            reserve_rmrest.addClause("reserve_rm.rm_id", reservation.rm_id, "=");
            reserve_rsrest.addClause("reserve_rs.rm_id", reservation.rm_id, "=");
        }
        if (reservation.config_id != "") {
            reserve_rmrest.addClause("reserve_rm.config_id", reservation.config_id, "=");
        }
        if (reservation.user_created_by != "") {
            reserverest.addClause("reserve.user_created_by", reservation.user_created_by, "=");
        }
        if (reservation.user_requested_by != "") {
            reserverest.addClause("reserve.user_requested_by", reservation.user_requested_by, "=");
        }
        if (reservation.user_requested_for != "") {
            reserverest.addClause("reserve.user_requested_for", reservation.user_requested_for, "=");
        }
        if (reservation.phone != "") {
            reserverest.addClause("reserve.phone", reservation.phone, "=");
        }
        if (reservation.email != "") {
            reserverest.addClause("reserve.email", reservation.email, "=");
        }
        if (reservation.dv_id != "") {
            reserverest.addClause("reserve.dv_id", reservation.dv_id, "=");
        }
        if (reservation.dp_id != "") {
            reserverest.addClause("reserve.dp_id", reservation.dp_id, "=");
        }
        if (reservation.reservation_name != "") {
            reserverest.addClause("reserve.reservation_name", reservation.reservation_name, "=");
        }
        if (reservation.res_id != "") {
            reserverest.addClause("reserve.res_id", reservation.res_id, "=");
            reserve_rmrest.addClause("reserve_rm.res_id", reservation.res_id, "=");
            reserve_rsrest.addClause("reserve_rs.res_id", reservation.res_id, "=");
        }
        if (reservation.date_start != "") {
            reserverest.addClause("reserve.date_start", reservation.date_start, "&gt;=");
            reserve_rmrest.addClause("reserve_rm.date_start", reservation.date_start, "&gt;=");
            reserve_rsrest.addClause("reserve_rs.date_start", reservation.date_start, "&gt;=");
        }
        if (reservation.date_end != "") {
            reserverest.addClause("reserve.date_end", reservation.date_end, "&lt;=");
            reserve_rmrest.addClause("reserve_rm.date_end", reservation.date_end, "&lt;=");
            reserve_rsrest.addClause("reserve_rs.date_end", reservation.date_end, "&lt;=");
        }
        if (reservation.time_start != "") {
            reserverest.addClause("reserve.time_start", reservation.time_start, "=");
            reserve_rmrest.addClause("reserve_rm.time_start", reservation.time_start, "=");
            reserve_rsrest.addClause("reserve_rs.time_start", reservation.time_start, "=");
        }
        if (reservation.time_end != "") {
            reserverest.addClause("reserve.time_end", reservation.time_end, "=");
            reserve_rmrest.addClause("reserve_rm.time_end", reservation.time_end, "=");
            reserve_rsrest.addClause("reserve_rs.time_end", reservation.time_end, "=");
        }
        if (reservation.resource_id != "") {
            reserve_rsrest.addClause("reserve_rs.resource_id", reservation.resource_id, "=");
        }
        
        if (reservation.resource_stds[0] != "") {
            reserve_rsrest.addClause("reserve_rs.resource_id", getResourceIdsByResStd(reservation.resource_stds[0]), "IN");
        }
        
        //BEGIN Check that if the user has selected 'All', no restriction must to be applied for the status  
        var statusAll = $('status_all');
        if ((!statusAll.checked) && (reservation.status != "")) {
            reserverest.addClause("reserve.status", reservation.status, "=");
            reserve_rmrest.addClause("reserve_rm.status", reservation.status, "=");
            reserve_rsrest.addClause("reserve_rs.status", reservation.status, "=");
        }
        //END Check that if the user has selected 'All', no restriction must to be applied for the status  
        
        //Once we have the restrictions to apply them to the editable reports
        var restriction_info = mergeReservations(this.userRestriction, reserverest);
        var restriction_rm = mergeReservations(this.userRestriction, reserverest, reserve_rmrest);
        var restriction_rs = mergeReservations(this.userRestriction, reserverest, reserve_rsrest);
        this.detailstabs.setTabRestriction("info-reservations", restriction_info);
        this.detailstabs.setTabRestriction("rm-reservations", restriction_rm);
        this.detailstabs.setTabRestriction("rs-reservations", restriction_rs);
        //Show by default the first editable report
		this.detailstabs.selectTab("info-reservations");
    }
    
})

/**
 * To modify the status of the checkbox "status_all"
 */
function selectStatusAll(){
    if ($("status_all").checked) 
        $("reserve.status").disabled = true;
    else 
        $("reserve.status").disabled = false;
}

/**
 *  This function is called when user click the selectValue button of Resource Code field in console panel
 */
function selectResourceCode(){
    View.selectValue('myReservationConsolePanel', getMessage('resourceCode'), ['resource_id'], 'resources', ['resources.resource_id'], ['resources.resource_id'], '', 'afterSelectResource', false, true, '', 400, 600, 'grid', 0, toJSON([{
        fieldName: 'resources.resource_id',
        sortOrder: 1
    }]));
}

/**
 * Set the value of resource code field after selected
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 */
function afterSelectResource(fieldName, selectedValue, previousValue){
    $('resource_id').value = selectedValue;
}

/**
 * This function is called when user click the selectValue button of Resource Standard field in console panel
 */
function selectResourceStd(){
    View.selectValue('myReservationConsolePanel', getMessage('resourceStandard'), ['resource_std'], 'resource_std', ['resource_std.resource_std'], ['resource_std.resource_std'], '', 'afterSelectResourceStd', false, true, '', 400, 600, 'grid', 0, toJSON([{
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
    $('resource_std').value = selectedValue;
}

/**
 * Combine the clauses of these restrictions
 * @param {Object} restriction1
 * @param {Object} restriction2
 * @param {Object} restriction3
 */
function mergeReservations(restriction1, restriction2, restriction3){
    var restriction = new Ab.view.Restriction();
    restriction.addClauses(restriction1, true);
    restriction.addClauses(restriction2, true);
    if (restriction3) {
        restriction.addClauses(restriction3, true);
    }
    return restriction;
}

/**
 * return the related the array of resource ids from
 * resources according to the parameter resource standard.
 *
 * @param {Object} resStd resource standard
 */
function getResourceIdsByResStd(resStd){
    var results = new Array();
    var parameter0 = {
        tableName: 'resources',
        fieldNames: toJSON(['resources.resource_id']),
        sortValues: toJSON([{
            fieldName: 'resources.resource_id',
            sortOrder: 1
        }]),
        restriction: toJSON({
            'resources.resource_std': resStd
        })
    };
    //when not all work request were closed out of the same work order, 
    //the closed work request is still in the wr table. 
    var resources = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameter0);
    if (resources.code == 'executed') {
        if (resources.data.records.length > 0) {
            var preResourceStd = "";
            var curResourceStd = "";
            for (var i = 0; i < resources.data.records.length; i++) {
                curResourceStd = resources.data.records[i]['resources.resource_id'];
                if (curResourceStd != preResourceStd) {
                    results.push(curResourceStd);
                    preResourceStd = curResourceStd;
                }
            }
        }
    }
    else {
        View.showMessage(resources.message);
    }
    return results;
}

