
var editUser = View.createController('editUser', {

    emId: "",
    
//    afterInitialDataFetch: function(){
//    this.user.getFieldElement('afm_users.user_pwd').disabled = true;
//	}
    afterViewLoad: function(){
    	var roleName=View.user.role;
    	if(roleName=="UNV EQ ADMIN"){
    	   this.users.addParameter("roleNames","afm_users.role_name in ('UNV DV EQ ADMIN','UNV EQ HEAD','UNV EQ ADMIN')");
    	}else if(roleName=="UNV STU ADMIN"){
    		this.users.addParameter("roleNames","afm_users.role_name in ('UNV DV STU ADMIN','UNV STU ADMIN','UNV DV DORM METER')");
    	}
    },
    
    user_afterRefresh: function(){
        var email = this.user.getFieldValue('afm_users.email');
		var username = this.user.getFieldValue('afm_users.user_name');
        onSetEmId(email,username);
        
        this.user.getFieldElement('afm_users.user_pwd').disabled = true;
        var isAdd = (username === '');
        var title = isAdd ? getMessage('addUserTitle') : getMessage('editUserTitle');
        this.user.setTitle(title);
        var passwordField = this.user.getFieldElement('afm_users.user_pwd');
        var passwordRow = Ext.get(passwordField.parentNode.parentNode);
        passwordRow.setDisplayed(!isAdd);
        
        Ext.get("user_afm_users.vpa_option2").dom.readOnly=true;
        Ext.get("user_afm_users.vpa_option4").dom.readOnly=true;
    },
    getMailUrl: function(){
        var ds = this.scSchoolMailUrlDs;
        var restriction = new Ab.view.Restriction();
        restriction.addClause("sc_school.sch_id", '1', '=');
        var record = ds.getRecord(restriction);
        var web_url = record.getValue('sc_school.web_url');
        if (valueExistsNotEmpty(web_url)) {
            web_url = '@' + web_url.substr(4, web_url.length - 3);
            
        }
        else {
            web_url = '@temp.edu.cn';
        }
        return web_url;
    },
    
    user_onSave: function(){
        var username = this.user.getFieldValue('afm_users.user_name');
		if (username == ""){
			alert("请输入用户名");
			return;
		}
		var vpa_option1 = this.user.getFieldValue('afm_users.vpa_option1');
		if(vpa_option1==""){
			this.user.setFieldValue('afm_users.vpa_option1',"NULL");
		}
		var vpa_option3 = this.user.getFieldValue('afm_users.vpa_option3');
		if(vpa_option3==""){
			this.user.setFieldValue('afm_users.vpa_option3',"NULL");
		}
		
		var email = this.user.getFieldValue('afm_users.email');
		if (!valueExistsNotEmpty(email)) {//如果页面上邮箱为空(也就是从em表中得到的邮箱为空)，自动生成一个
			
			email = this.emId + this.getMailUrl();
			//alert("生成邮箱成功:" + email);
            this.user.setFieldValue('afm_users.email', email);
            
        }
        if (!this.checkEmail(email)) {
            View.showMessage("此邮箱已经被用户注册过，请更改邮箱!");
            return ;
        }
        if (this.checkBeforeSaveEm()) {
            if (this.user.save()) {
            	//alert("save Ok");
            	//更新em中的邮箱
                this.updateEmailOfEm(email);
                
                //如果是二级单位领导（UNV DIVISION HEAD）则更新到dv表中的head
                var role_name = this.user.getFieldValue('afm_users.role_name');
                this.updateHeadOfDv(role_name,username);
                
                this.users.refresh();
                
                //添加用户其他角色
                this.addOtherRoles(true);
                
            }
        }
    },
    /**
     * zhangyan add 
     * 在流程中二级单位领导审批会自动获取 dv表中的head字段，
     * 但是head字段很容易忘记填写，所以在定义用户时直接更新dv.head
     * 
     */
    updateHeadOfDv:function(role_name,username){
        if(role_name=="UNV DIVISION HEAD"){
        	//1、获取用户所在单位
            var restriction = new Ab.view.Restriction();
            restriction.addClause('em.em_id', this.emId);
            var emRecords = this.employeeDs.getRecords(restriction);
            if (emRecords.length > 0) {
            	var emRecord=emRecords[0];
            	var dvId=emRecord.getValue("em.dv_id");
            	
            	//2、更新用户所在单位的 单位领导字段head
            	var restrictionDv = new Ab.view.Restriction();
            	restrictionDv.addClause('dv.dv_id', dvId);
                var records = this.dv_ds.getRecords(restrictionDv);
                if (records.length > 0) {
                    record = records[0];
                    record.setValue('dv.head', username);
                    record.isNew = false;
                    try {
                        this.dv_ds.saveRecord(record);
                    } 
                    catch (e) {
                        View.showException(e, '保存教职工信息失败！');
                        return;
                    }
                    
                }
            }
        }
    },
    /**
     * return false, cann't save
     */
    checkBeforeSaveEm: function(){
    	//alert(this.emId);
        var res = new Ab.view.Restriction();
        res.addClause("em.em_id", this.emId, "=");
        var record = View.dataSources.get("consoleDs").getRecord(res);
        var em_id = record.getValue("em.em_id");
        var dv_id = record.getValue("em.dv_id");
        if (em_id == undefined) {
            alert("新增的用户没有关联的教职工，请选择已有教职工或增加教职工！");
            return false;
        }
        if (dv_id == null || dv_id == "") {
            alert("该用户关联的教职工没有所属单位，请为该教职工选择所属单位！");
            return false;
        }
        
        return true;
    },
    /**
     * update email of em
     * @param {Object} email
     */
    updateEmailOfEm: function(email){
        var record = null;
        var restriction = new Ab.view.Restriction();
        restriction.addClause('em.em_id', this.emId);
        var records = this.employeeDs.getRecords(restriction);
        if (records.length > 0) {
            record = records[0];
            record.setValue('em.email', email);
            record.isNew = false;
            try {
                this.employeeDs.saveRecord(record);
            } 
            catch (e) {
                View.showException(e, '保存教职工信息失败！');
                return;
            }
            
        }
    },
    /**
     *
     * @param {Object} email
     */
    checkEmail: function(email){
        //1获取除了当前职工，是否还有其他职工使用该邮箱
        var parameters = {
            tableName: 'em',
            fieldNames: toJSON(['em.em_id', 'em.email']),
            restriction: toJSON("em.email = '" + email + "'" + " and em.em_id!='" + this.emId + "'")
        };
        var em_length;
        var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
        if (result.code == 'executed') {
            em_length = result.data.records.length;
        }
        else {
            Ab.workflow.Workflow.handleError(result);
            return null;
        }
        
        //2获取除了当前用户，是否还有其他用户使用该邮箱
        var oldUserName = this.user.getOldFieldValues()[("afm_users.user_name")];
		if (oldUserName == "") oldUserName = this.user.getFieldValue("afm_users.user_name");
        var users_parameters = {
            tableName: 'afm_users',
            fieldNames: toJSON(['afm_users.user_name', 'afm_users.email']),
            restriction: toJSON("afm_users.email = '" + email + "'" + " and afm_users.user_name!='" + oldUserName + "'")
        };
        
        var users_length;
        var users_result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', users_parameters);
        if (users_result.code == 'executed') {
            users_length = users_result.data.records.length;
        }
        else {
            Ab.workflow.Workflow.handleError(users_result);
            return null;
        }
        
        //3如果有其他职工 或 其他用户使用该邮箱，则返回提醒
        if (users_length >= 1 || em_length >= 1) {
            return false;
        }
        return true;
    },
    
    consolePanel_onShow: function(){
        var emName = this.consolePanel.getFieldValue("em.name");
        var dvId = this.consolePanel.getFieldValue("em.dv_id");
        var parameter = " and 1 = 1 ";
        if (emName != "") {
            parameter += " and em.name like '%" + emName + "%' ";
        }
        if (dvId != "") {
            parameter += " and em.dv_id like '%" + dvId + "%' ";
        }
        this.users.addParameter('emName', parameter);
        this.users.refresh();
    },
    addOtherRoles:function(editOrNew){
       var userName="";
       if(editOrNew){
    	   userName=this.user.getFieldValue("afm_users.user_name");
       }else{
    	   var selectedIndex = this.users.selectedRowIndex;
    	   userName = this.users.rows[selectedIndex]["afm_users.user_name"];
       }
	   var restriction = new Ab.view.Restriction();
	   restriction.addClause("sc_user_roles.user_name" , userName, "=");
	  
	   var account = View.dataSources.get("sc_user_roles_ds");
	   var record=account.getRecords(restriction);
	   if(record.length!=0){
		   this.userRolesPanel.refresh(restriction,false);
	   }else{
		   this.userRolesPanel.refresh(restriction,true);
	   }
	   this.userRolesPanel.setFieldValue("sc_user_roles.user_name" , userName);
    },
    userRolesPanel_onSave:function(){
    	this.userRolesPanel.save();
    },
    /**
     * zhangy Add
     * 
     * 华广 设备管理 需要各个DP管理自己的设备，所以添加Dp的VPA来实现
     * vpa_option1 用来储存 dp_id 的集合
     * vpa_option2 用来储存 dp_name的集合 主要用来界面显示
     * vpa_option3 用来储存 dv_id 的集合
     * vpa_option4 用来储存 dv_name的集合 主要用来界面显示
     */
    user_onSelectDp:function(){
//    	var emId=this.user.getFieldValue("afm_users.user_name");
//    	var dvId=getEmDvByEmId(emId);
    	var dvId=this.user.getFieldValue("afm_users.vpa_option3");
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause("dv.dv_id" , dvId, "=");
    	this.dpPanel.refresh(restriction);
    	
    	this.dpPanel.showInWindow({
    		x:250,
    		y:200,
            width: 600,
            height: 400
        });
    },
    user_onClearDp:function(){
    	this.user.setFieldValue("afm_users.vpa_option1","");
    	this.user.setFieldValue("afm_users.vpa_option2","");
    },
    user_onSelectDv:function(){ 
    	this.dvPanel.refresh();
    	this.dvPanel.showInWindow({
    		x:250,
    		y:200,
            width: 600,
            height: 400
        });
    },
    user_onClearDv:function(){
    	this.user.setFieldValue("afm_users.vpa_option3","");
    	this.user.setFieldValue("afm_users.vpa_option4","");
    },
    dpPanel_onSure:function(){
    	var rows = this.dpPanel.getSelectedRows();
		if(rows.length == 0){
			alert("请选择部门科室！");
			return;
		}
		var vpa_option1=this.user.getFieldValue("afm_users.vpa_option1");
		var vpa_option2=this.user.getFieldValue("afm_users.vpa_option2");
		
		for(var i = 0; i < rows.length; i++){
			//dp_name的集合
			var dpName=rows[i]['dp.dp_name'];
			if(vpa_option2==""){
				vpa_option2=dpName;
			}else{
				vpa_option2=vpa_option2+","+dpName;
			}
		//dp_id的集合
		   var dpId=rows[i]['dp.dp_id'];
			if(vpa_option1==""){
				vpa_option1=dpId;
			}else{
				vpa_option1=vpa_option1+","+dpId;
			}
		}
		this.user.setFieldValue("afm_users.vpa_option1",vpa_option1);
		this.user.setFieldValue("afm_users.vpa_option2",vpa_option2);
		this.dpPanel.closeWindow();
    },
    dvPanel_onSure:function(){
    	var rows = this.dvPanel.getSelectedRows();
		if(rows.length == 0){
			alert("请选择单位！");
			return;
		}
		var vpa_option3=this.user.getFieldValue("afm_users.vpa_option3");
		var vpa_option4=this.user.getFieldValue("afm_users.vpa_option4");
		
		for(var i = 0; i < rows.length; i++){
			//dv_name的集合
			var dvName=rows[i]['dv.dv_name'];
			if(vpa_option4==""){
				vpa_option4=dvName;
			}else{
				vpa_option4=vpa_option4+","+dvName;
			}
		//dv_id的集合
		   var dvId=rows[i]['dv.dv_id'];
			if(vpa_option3==""){
				vpa_option3=dvId;
			}else{
				vpa_option3=vpa_option3+","+dvId;
			}
		}
		this.user.setFieldValue("afm_users.vpa_option3",vpa_option3);
		this.user.setFieldValue("afm_users.vpa_option4",vpa_option4);
		this.dvPanel.closeWindow();
    },
    userRolesPanel_onDelRole1:function(){
    	var roleName=this.userRolesPanel.getFieldValue("sc_user_roles.role_title1");
    	var roleOrder="role1";
    	this.userRolesPanel_onDelRole(roleOrder,roleName);
    },
    userRolesPanel_onDelRole2:function(){
    	var roleName=this.userRolesPanel.getFieldValue("sc_user_roles.role_title2");
    	var roleOrder="role2";
    	this.userRolesPanel_onDelRole(roleOrder,roleName);
    },
    userRolesPanel_onDelRole3:function(){
    	var roleName=this.userRolesPanel.getFieldValue("sc_user_roles.role_title3");
    	var roleOrder="role3";
    	this.userRolesPanel_onDelRole(roleOrder,roleName);
    },
    userRolesPanel_onDelRole4:function(){
    	var roleName=this.userRolesPanel.getFieldValue("sc_user_roles.role_title4");
    	var roleOrder="role4";
    	this.userRolesPanel_onDelRole(roleOrder,roleName);
    },
    userRolesPanel_onDelRole:function(roleOrder,roleName){
    	var userName=this.userRolesPanel.getFieldValue("sc_user_roles.user_name");
    	
    	if(roleName!=""){
    		var controller=this;
    		var confirmMessage ="确定要删除用户【"+userName+"】的角色【"+roleName+"】吗？";
    		View.confirm(confirmMessage, function(button){
    			  if (button == 'yes') {
    				  try { 
    					  if(roleOrder=="role1"){
    						  controller.userRolesPanel.setFieldValue("sc_user_roles.role_name1","");
    						  controller.userRolesPanel.setFieldValue("sc_user_roles.role_title1","");
    					  }
    					  if(roleOrder=="role2"){
    						  controller.userRolesPanel.setFieldValue("sc_user_roles.role_name2","");
    						  controller.userRolesPanel.setFieldValue("sc_user_roles.role_title2","");
    					  }
    					  if(roleOrder=="role3"){
    						  controller.userRolesPanel.setFieldValue("sc_user_roles.role_name3","");
    						  controller.userRolesPanel.setFieldValue("sc_user_roles.role_title3","");
    					  }
    					  if(roleOrder=="role4"){
    						  controller.userRolesPanel.setFieldValue("sc_user_roles.role_name4","");
    						  controller.userRolesPanel.setFieldValue("sc_user_roles.role_title4","");
    					  }
    					  controller.userRolesPanel.save();
    					  
    				  }catch(e){
    					  View.showMessage("操作失败,请重新操作！");
    					  return ;
    				  }
    			  }
    		});
    	}else{
    		View.showMessage("不存在角色,不能删除！");
			return ;
    	}
    }
    
});

function selectUserName(){

    View.selectValue({
        formId: 'user',
        title: '从教职工表选择用户名称',
        fieldNames: ['afm_users.user_name', 'afm_users.email', 'afm_users.user_xingMing','afm_users.vpa_option3','afm_users.vpa_option4'],
        selectTableName: 'em',
        selectFieldNames: ['em.em_id', 'em.email', 'em.name','em.dv_id','dv.dv_name'],
        visibleFieldNames: ['em.em_id', 'em.name', 'dv.dv_name','em.zhiw_id', 'em.email','em.dv_id'],
		restriction : 'not exists ( SELECT email FROM afm_users where afm_users.email=em.email)',
        actionListener: 'afterSelectEmployee',
        width: 710,
        height: 500
    });
}

/**
 *
 * @param {Object} email
 */
function getEmIdByEmail(email){
    var em_id = "";
    var res = new Ab.view.Restriction();
    res.addClause("em.email", email, "=");
    var records = View.dataSources.get("employeeDs").getRecords(res);
    if (records.length > 0) {
        em_id = records[0].getValue("em.em_id");
    }
    
    return em_id;
}

function afterSelectEmployee(fieldName, selectedValue, previousValue){
    if (fieldName == 'afm_users.user_name') {
        $('em_name_text_input').value = selectedValue;
		editUser.emId = selectedValue;
    }
    
    return true;
}

/**
 * after click the grid item, set the em_id value into users panel
 * @param {Object} email
 */
function onSetEmId(email, username){
    var emId = '';
    if (email) {
        emId = getEmIdByEmail(email);
    }
    else {//此种情况运用到在grid中（users）里面有记录（但记录中没有邮箱的情况下），又因为user的数据源是按照邮箱进行查找的，里面肯定有邮箱的值，所以没意义
    	  //而点击新增按钮，username的值为空，也没意义
        emId = username;
    }
    if (!View.panels.get('users').newRecord) {
        $('em_name_text_input').value = emId;
    }
    else {
        $('em_name_text_input').value = '';
    }
	
    editUser.emId = emId;
}
/**
 * 获取登陆人的姓名
 * @param emId
 * @returns
 */
function getEmDvByEmId(emId){
	var parameters = {
 			tableName: 'em',
 			fieldNames: toJSON(['em.dv_id']),
 			restriction: "em.em_id ='" + emId + "'"
 		};
		var dvId="";
 		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
 		if (result.data.records.length > 0) {
 			dvId = result.data.records[0]['em.dv_id'];
 		}
 		return dvId;
}
