/**
 *
 */
function jsImport(path) {
 var i;
 var ss = document.getElementsByTagName("script");
 for (i = 0; i < ss.length; i++) {
  if (ss[i].src && ss[i].src.indexOf(path) != -1) {
   return;
  }
 }
 var s = document.createElement("script");
 s.type = "text/javascript";
 s.src = path;
 var head = document.getElementsByTagName("head")[0];
 head.appendChild(s);
}

jQuery().ready(function() {
  var hrefLocation = window.location.protocol + "//" + window.location.host + "\/archibus";
  jsImport(hrefLocation + "/dwr/interface" + "/FileUpload.js");

   jQuery("#startUpload").attr("value","提交");
   jQuery("#startUpload").bind("click",function(){
   	if(abScDefEmController.abScDefEmForm.getFieldValue("em.em_id") != ""){
	    var uploadFile = dwr.util.getValue("uploadFile"); 
		if(uploadFile.value != ""){
		    var filename = abScDefEmController.abScDefEmForm.getFieldValue("em.em_id") + ".jpg";  
		    var url = "em";
		    FileUpload.uploadFile(uploadFile,filename,url,function(imageURL){  
			    var addr=imageURL+"?id="+new Date().getTime();
		        dwr.util.setValue('uploadFile', "");  
				jQuery.ajax({
                    url: addr,
                    success:function(){
				        jQuery("#em_photo").removeAttr("src");
                        jQuery("#em_photo").attr("src",addr);

                    },
                    error:function(e){
//                    	alert(e);
                       jQuery("#em_photo").removeAttr("src");
                       jQuery("#em_photo").attr("display","none");
                    }
				});
		    });
		}else{
			alert("请先选择员工照片");
		} 
	}else{
		alert("请先输入员工 号");
	}
   });
   
   
   
   jQuery("#abScDefEmForm input[class*='inputValueChg']").on("input",function(e){
	   var eventSrc=e.target.id;
	   if(jQuery(this).val().trim()==''){
		   
		   switch(eventSrc)
		   {
		   case 'abScDefEmForm_dv.dv_name':
			   jQuery("#abScDefEmForm_em\\.dv_id").val('');
			     break;
		   case 'abScDefEmForm_dp.dp_name':
			   jQuery("#abScDefEmForm_em\\.dp_id").val('');
			     break;
			    
		   default:
		    
		   }
	   }
   });
});


var abScDefEmController = View.createController('abScDefEm', {

    afterInitialDataFetch: function(){
        this.abScDefEmForm.getFieldElement('em.zhic_bz_id').disabled = true;
        
        var role = View.user.role;
        var dvId = View.user.employee.organization.divisionId;
        if (role == 'UNV DV ADMIN' || role == 'UNV DIVISION HEAD'){
        	this.searchTeacherPanel.getFieldElement('em.dv_id').disabled= true;
        }else{
        	this.searchTeacherPanel.getFieldElement('em.dv_id').disabled= false;
        }
        this.searchTeacherPanel.setFieldValue("em.dv_id",dvId);
        
    },
    searchTeacherPanel_onSearch: function(){
		
		var   emName=this.searchTeacherPanel.getFieldValue("em.name");
		var   emId=this.searchTeacherPanel.getFieldValue("em.em_id");
		var   dpId=this.searchTeacherPanel.getFieldValue("em.dp_id");
		var   dvId=this.searchTeacherPanel.getFieldValue("em.dv_id");
		
		
		var consoleRestriction = new Ab.view.Restriction();
		
		if (emName != "") {
			consoleRestriction.addClause("em.name", emName, "like");
		}
		if (emId != "") {
			consoleRestriction.addClause("em.em_id", emId, "like");
		}
		if (dpId != "") {
			consoleRestriction.addClause("em.dp_id", dpId, "like");
		}
		if (dvId != "") {
			consoleRestriction.addClause("em.dv_id", dvId, "like");
		}
		this.abScDefEmGrid.refresh(consoleRestriction);
		
		/*if (this.abScDefEmGrid.rows.length == 0) {
			this.abScDefEmGrid.show(false);
			this.abScDefEmForm.show(false);
	    	 View.showMessage("没有符合条件的员工信息！");
			 return;
		}*/
	},
	searchTeacherPanel_onBianjizaigangzhuangtai:function()
	{
		View.openDialog('asc-bj-usms-data-def-em-status.axvw', "");
	},
    abScDefEmForm_afterRefresh: function(){
        showDistinctPhoto();
        var role = View.user.role;
        
        if (this.abScDefEmForm.newRecord) {
        	var employee = AUSC_getEmployeeDivisionIdByEmail(View.user.email);
        	if(valueExists(employee)){
        		var dvId = employee.organization.divisionId;
            	var dpId = employee.organization.departmentId;
            	this.abScDefEmForm.setFieldValue("em.dv_id", dvId);
            	this.abScDefEmForm.setFieldValue("em.dp_id", dpId);
        	}   
        }
    },
    
    abScDefEmForm_onSave: function(){
        //var panel = View.panels.get('abScDefEmForm');
    	var   emName=this.abScDefEmForm.getFieldValue("em.name");
		
        if (!this.checkEmail()) {
            View.showMessage("此邮箱已经被用户注册过，请更改邮箱！");
            return;
        }
		
        var controller=this;
        var confirmMessage="你确定要保存["+emName+"]的信息吗?";
        View.confirm(confirmMessage, function(button){
        	 if (button == 'yes') {
        		try {
        		  var successMessage = controller.abScDefEmForm.save();
        	       if(successMessage){
        	   		
        	    	   controller.abScDefEmGrid.refresh();
        	           
        	    	   //controller.saveUserEmail(controller.abScDefEmForm);//暂时不同步更新用户邮箱
        	    	   View.showMessage("保存成功！");
        	       }else{
        	    	   View.showMessage("保存失败,请重新保存！");
        	    	   return;
        	       }
        	 }catch(e){
            	 View.showMessage("操作失败,请重新操作！");
            	 return;
             }
           }
        });
    },
    /**
     * call wfr to update user's email when employee's mail is changed
     * @param {Object} panel
     *
     */
    saveUserEmail: function(panel){
    	 var emailFrom = panel.getOldFieldValues()["em.email"];
        var emailTo = panel.getFieldValue("em.email");
        var result;
        try {
            result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SchoolHandler-updateUserEmail', emailFrom, emailTo);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    },
    
    //update static field when em increase or reduce
    abScDefEmForm_onUpdateStatic: function(){
        updateStaticFieldAboutEmOrRm();
    },
    
    checkEmail: function(){
        var username = this.abScDefEmForm.getFieldValue('em.em_id');
        var email = this.abScDefEmForm.getFieldValue('em.email');
        
        var parameters = {
            tableName: 'em',
            fieldNames: toJSON(['em.em_id', 'em.email']),
            restriction: toJSON("em.email = '" + email + "'" + " and em.em_id!='" + username + "'")
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
        if (em_length >= 1) {
            return false;
        }
        return true;
    },
    abScDefEmGrid_onAddNew:function(){
		this.abScDefEmForm.refresh(null,true);
		this.abScDefEmForm.setFieldValue("em.dp_id","");
        var role = View.user.role;
        var dvId = View.user.employee.organization.divisionId;
        if (role == 'UNV DV ADMIN' || role == 'UNV DIVISION HEAD'){
        	this.abScDefEmForm.setFieldValue("em.dv_id",dvId);
        	var dvName=getDvNameById(dvId);
        	this.abScDefEmForm.setFieldValue("dv.dv_name",dvName);
        }
	}
    
});



function opendialog(){

    View.openDialog('asc-bj-usms-data-def-em-rated-area.axvw', null, true, {
        width: 800,
        height: 600,
        closeButton: false
    });
    abScDefEmController.abScDefEmForm_onSave();
}

function showDistinctPhoto(){
   var emphoto = View.panels.get('abScDefEmForm');
        //var em_photo = emphoto.getFieldValue('em.image_file').toLowerCase();
        //var em_id = emphoto.getFieldValue('em.em_id');
        var em_photo = emphoto.getFieldValue('em.em_id');
        var em_photoImg = Ext.get('em_photo');   
        if (!em_photo) {
            return;
        }
        if (valueExistsNotEmpty(em_photo)) {
            em_photoImg.setVisible(true);
			em_photoImg.dom.src = View.project.projectGraphicsFolder + '/em/' + em_photo+'.jpg';
			em_photoImg.dom.alt = "";
        }
        else {
       		bl_photoImg.setVisible(false);
			bl_photoImg.dom.src = null;
			bl_photoImg.dom.alt = getMessage('noImage');
        }
}
function getDvNameById(dvId){
	var parameters = {
			tableName: 'dv',
			fieldNames: toJSON(['dv.dv_name']),
			restriction: "dv.dv_id ='" + dvId + "'"
	};

		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		var dvName=dvId;
		if (result.data.records.length > 0) {
			dvName = result.data.records[0]['dv.dv_name'];
		}
		return dvName;
}


