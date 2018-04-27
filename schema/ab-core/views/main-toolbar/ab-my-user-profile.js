/**
 * My Profile Controller 
 * Utilizing the locale controller provided by ab-view-locale.js 'viewLocaleController'
 * requires sharing of varibales due to delegation of the locale control listener
 *
 */
var controller = View.createController('myProfileController', {
	// controller providing localization functionality for the locale select control in the form
	localeController: null,

	// reference to the select input
	localeSelector: null,

	// function called by the delegate
	proofLocale: null,

    // selected locale
    currentLocale: 'en_US',
    
	// key3 of the localization lang file - actually the locale title
    localeKeys: null,

	// if this locale is selected, login page controls do not have to be localized
    // DEFAULT_LOCALE: 'en_US',
    afterInitialDataFetch: function(){
    	this.afterViewLoad();
    },
    
	/**
	 * After view loads set up the top panel's localized labels and profile values
	 * Set up the listener -- and localize the values -- for the locale select control in the form
	 */
    
	afterViewLoad: function() {
	    // set up the top panel label and user values
		var employeeNumberElem = document.getElementById("employeeNumber");
		empNumberText = getMessage('employee_number');
		employeeNumberElem.innerHTML = empNumberText;

		var locationElem = document.getElementById("locationTitle");
		locText = getMessage('location');
		locationElem.innerHTML = locText;
			

		var divisionElem = document.getElementById("divisionTitle");
		divText = getMessage('division');
		divisionElem.innerHTML = divText;

		var deptElem = document.getElementById("departmentTitle");
		deptText = getMessage('department');
		deptElem.innerHTML = deptText;

		var employeeNameElem = document.getElementById("employeeName");
		empNameText = getMessage('employee');
		employeeNameElem.innerHTML = empNameText;

		var instrElem = document.getElementById("instruction");
		if (instrElem != null) {
			instrElem.className = 'formMessage';
			instrText = getMessage('logout_message');
			instrElem.innerHTML = instrText
		}
		
		var currentUser = View.user;
		if (currentUser != null) {
			var em_id = currentUser.name;
			if(valueExistsNotEmpty(em_id)){
				this.userRolesPanelRefresh(em_id);
				var dsEm = View.dataSources.get("em_ds");
			    var res=new Ab.view.Restriction();
			    res.addClause("em.em_id",em_id,"=");
			    var emRecord=dsEm.getRecord(res);
			    var em_name = emRecord.getValue("em.name");
			    var em_dv = emRecord.getValue("em.dv_id");
			    var em_dp = emRecord.getValue("em.dp_id");
			    //拿到科室名称
			    var dsDp = View.dataSources.get("dp_ds");
			    var res1=new Ab.view.Restriction();
			    res1.addClause("dp.dv_id",em_dv,"=");
			    res1.addClause("dp.dp_id",em_dp,"=");
			    var dpRecord=dsDp.getRecord(res1);
			    var dp_name = dpRecord.getValue("dp.dp_name");
			    if(dp_name==null){
			    	deptElem.innerHTML = deptElem.innerHTML + ': ' + '';
			    }else{
			    	deptElem.innerHTML = deptElem.innerHTML + ': ' + dp_name;
			    }
			    if(valueExistsNotEmpty(em_name)){
			    	employeeNameElem.innerHTML = employeeNameElem.innerHTML + ': ' + em_name;
			    }else{
			    	employeeNameElem.innerHTML = employeeNameElem.innerHTML + ': ' + '';
			    }
			    
			}else{
				
				deptElem.innerHTML = deptElem.innerHTML + ': ' + currentUser.employee.organization.departmentId;
			}
			
			employeeNumberElem.innerHTML = employeeNumberElem.innerHTML + ': ' + currentUser.name;
			
			var empLocation = currentUser.employee.space.buildingId;
			if (currentUser.employee.space.buildingId.length > 0) {
				empLocation += '|';
			}
			empLocation += currentUser.employee.space.floorId;
			if (currentUser.employee.space.floorId.length > 0) {
				empLocation += '|';
			}
			empLocation += currentUser.employee.space.roomId;
			locationElem.innerHTML = locationElem.innerHTML + ': ' + empLocation;
			
			var dv_id = currentUser.employee.organization.divisionId;
			if(valueExistsNotEmpty(dv_id)){
				var dsDv = View.dataSources.get("dv_ds");
			    var res1=new Ab.view.Restriction();
			    res1.addClause("dv.dv_id",dv_id,"=");
			    var dvRecord=dsDv.getRecord(res1);
			    var dv_name = dvRecord.getValue("dv.name");
				divisionElem.innerHTML = divisionElem.innerHTML + ': ' + dv_name;
			}else{
				divisionElem.innerHTML = divisionElem.innerHTML + ': ' +currentUser.employee.organization.divisionId;
			}
			
		}
		
		
		// get the locale controller from the view
		this.localeController = View.controllers.get('viewLocaleController');
		// assign the select control to a listener that calls the other controller to localize the control's values
        this.localeSelector = Ext.get('preferencesForm_afm_users.locale');
		this.localeSelector.on('change', this.selectUserLocale.createDelegate(this));

		// set local vars in this when needed by delegate
		this.proofLocale = this.localeController.proofLocale;
		this.localeKeys = this.localeController.localeKeys;
		
		// KB 3026680: disable Change Password button in preauth mode
		SmartClientConfigService.getSsoMode({
	        callback: this.setSsoMode.createDelegate(this, [$('changePassword')]),
	        errorHandler: function(m, e) {
	            View.showException(e);
	        }
	    });
	    
	    this.currentLocale = Ab.view.View.user.locale;

		// get locale list from the server
	    SecurityService.getLocales(this.currentLocale, {
	        callback: this.localeController.onGetLocales.createDelegate(this),
	        errorHandler: function(m, e) {
	            Ab.view.View.showException(e);
	        }
	    });
	},    
	
	userRolesPanelRefresh: function(em_id){ 
        var roleForm = View.panels.get("userRolesPanel");
	    var res3=new Ab.view.Restriction();
	    res3.addClause("sc_user_roles.user_name",em_id,"=");
	    this.userRolesPanel.refresh(res3);
	    this.userRolesPanel.getFieldElement('sc_user_roles.role_title1').disabled = true;
        this.userRolesPanel.getFieldElement('sc_user_roles.role_title2').disabled = true;
        this.userRolesPanel.getFieldElement('sc_user_roles.role_title3').disabled = true;
        this.userRolesPanel.getFieldElement('sc_user_roles.role_title4').disabled = true;
	    
    },
	
	/**
	 * Disables the Change Password button if the server runs in SSO mode.
	 * 1. Invoke SmartClientConfigService.getSsoMode();
     * 2. Decode the returned string.
     * 3. If the value contains "preauth", than we are in SSO mode: disable the button.
	 */
	setSsoMode: function(ssoMode) {
        if (ssoMode) {
            var ssoModeUnsecured = doUnsecure(ssoMode);
            if (ssoModeUnsecured.indexOf('preauth') != -1) {
                var changePasswordAction = this.preferencesForm.actions.get(1);
                if (changePasswordAction) {
                    changePasswordAction.button.el.dom.style.display = 'none';
                }
            }
        }
	},

	/**
	 * Select listener for the Locale combobox.
	 */
	selectUserLocale: function(e, option) {
		var op = option;
		var localeId = option.value;
	    if (localeId != this.localeController.currentLocale) {
            this.localeController.currentLocale = localeId;
            
            var cultureInfo = View.cultureInfos[localeId];
            if (valueExists(cultureInfo)) {
            	this.preferencesForm.setFieldValue('vf_ctry_id', cultureInfo.country);
            	this.preferencesForm.setFieldValue('vf_currency_id', cultureInfo.currency);
            }
		}

		// localize the control's values
        this.localeController.localizeLocaleNames(this);
	},

    preferencesForm_onSave: function() {
		var canSave = this.preferencesForm.save();
		if(canSave){
			var instructionElem = Ext.get('instruction');
            if (instructionElem) {
                var message = getMessage('logout_message');
                instructionElem.innerHTML = message;
                instructionElem.setVisible(true, {duration: 1});
                instructionElem.setHeight(20, {duration: 1});
                this.dismissMessage.defer(3000, this, [instructionElem]);
            }
			
			this.setCookie();
		}
	},

	setCookie: function() {
		// set cookie
		afm_user_language = this.localeSelector.dom.value;
		
		// set up cookies
		var today = new Date();
		var expires = new Date();
		
		// expire cookies in one year?
		expires.setTime(today.getTime() + 1000 * 60 * 60 * 24 * 365);
		setCookie("afm_user_language_per_computer", afm_user_language, expires);
	},
	
	dismissMessage: function(messageElement) {
		messageElement.setHeight(1, {duration: 1});
		messageElement.setVisible(false, {duration: 0.25});	
	},
	
	//chang role and login
	changRole:function(num){
		var userForm = View.panels.get("preferencesForm");
		var currentUser = userForm.getFieldValue("afm_users.role_name");
		var role_name;
		var home_page;
		if(num=="1"){
			role_name="sc_user_roles.role_name1";
			home_page="sc_user_roles.home_page1";
		}else if(num=="2"){
			role_name="sc_user_roles.role_name2";
			home_page="sc_user_roles.home_page2";
		}else if(num=="3"){
			role_name="sc_user_roles.role_name3";
			home_page="sc_user_roles.home_page3";
		}else if(num=="4"){
			role_name="sc_user_roles.role_name4";
			home_page="sc_user_roles.home_page4";
		}
		
		var roleForm = View.panels.get("userRolesPanel");
		var role_name_new = roleForm.getFieldValue(role_name);
		var home_page_new = roleForm.getFieldValue(home_page);
		if(currentUser==role_name_new){
			View.showMessage("您已是当前角色，不可更换");
			return;
		}
		if(!valueExistsNotEmpty(role_name_new)){
			View.showMessage("角色不存在，不可更换");
			return;
		}
		//修改afm_users表中用户的角色和导航
		var dsUsers = View.dataSources.get("afmUsersDataSource");
		var user_name = this.view.user.name;
		var res4 = new Ab.view.Restriction();
		res4.addClause("afm_users.user_name", user_name, "=");    		
		var userRecord=dsUsers.getRecord(res4);
		userRecord.setValue("afm_users.role_name", role_name_new);			
		userRecord.setValue("afm_users.home_page", home_page_new);			
		dsUsers.saveRecord(userRecord);		
		
		//jQuery('#changeRole1').on("click", this.onLogout.createDelegate(this));
		this.doLogout();
	},
    /**
     * Performs the sign out action.
     */
    doLogout: function() {
        SecurityService.logout({
            callback: function(x, y, z) {
               window.parent.location = View.getUrlForPath(View.logoutView);
            	//window.parent.location='http://localhost:8081/archibus/login.axvw';
            },
            errorHandler: function(message, e) {
                // DWR has its own session timeout check which may bypass our server-side timeout check
                if (message == 'Attempt to fix script session' || message.indexOf('expired') != -1) {
                    window.parent.location = View.getUrlForPath(View.logoutView);
                	//window.parent.location='http://localhost:8081/archibus/login.axvw';
                } else {
                    View.showException(e);
                }
            }
        });
    },
    preferencesForm_onChangePassword: function() {
        // show change password form
        var dialog = View.openDialog('ab-change-password.axvw', null, false, {
            width: 450,
            height: 200,
            closeButton: false,
            title: getMessage('Change_password'),

            afterViewLoad: function(dialogView) {
                var changePasswordController = dialogView.controllers.get('ab-change-password');
                changePasswordController.username = View.user.name;
                // user is authenticated, do not supply projectId
                changePasswordController.projectId = null;
            }
        });
    }
});
