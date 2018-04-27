/**
 * MuLiang
 */

function ASBT_getCurrentDate_Client()
{
	var returnedDate = "";
	var curDate = new Date();
	var temp_month = curDate.getMonth()+ 1;
	var month = temp_month<10?"0"+temp_month:temp_month;
	var temp_day = ""+curDate.getDate();
	var day	= temp_day<10?"0"+temp_day:temp_day;
	var year  = ""+curDate.getFullYear();
	returnedDate = year + "-" + month + "-" + day;
	return returnedDate;
}

var ascBjUsmsDataBlXiazhangWdController = View.createController('ascBjUsmsDataBlXiazhangWd', {
	blId: "",
	afterInitialDataFetch: function(){
		if (this.view.parameters){
        	this.blId = this.view.parameters['bl_id'];
		}
		var title="建筑物："+this.blId;
		this.ascBjUsmsDataBlXiazhangWdForm.setTitle(title);
		var currentDate = ASBT_getCurrentDate_Client();
		this.ascBjUsmsDataBlXiazhangWdForm.setFieldValue('sc_bl_xz.date_xiazhang',currentDate)
    },
	ascBjUsmsDataBlXiazhangWdForm_onSave : function() {
		
		var form=this.ascBjUsmsDataBlXiazhangWdForm;
		form.setFieldValue("sc_bl_xz.bl_id",this.blId);
		if(!form.canSave()){
			return ;
		}
		 var record = ABHDC_getDataRecord2(form); 
		 var xzController=this;
		 var confirmMessage = ("是否要将建筑物："+this.blId+" 下账？");
	
	        View.confirm(confirmMessage, function(button){
	        	 
	            if (button == 'yes') {
	            	try {
	            		var	jobId = Workflow.startJob('AbSpaceRoomInventoryBAR-SchoolJobService-BuildingWholeLifeCycleManageServiceStart',record);
	            		xzController.SetFormDisabel();
	            	
				            View.openJobProgressBar('建筑物下账-进度条', jobId, '', function(status) {
				            	if(status.jobFinished == true){
				            		 // 如果WorkFlow执行成功
				    				 //关闭弹出页面，并且将回调bl页面的函数，将bl删除
			    			 	xzController.deleteBuildingRecord_onClose();
								                               }
						                                                                               });
	    			  }catch (e) {
	    				    Workflow.handleError(e);
	    		 	              }
	            }
	        });
	},
	SetFormDisabel: function() {
		
		var form=this.ascBjUsmsDataBlXiazhangWdForm;
		form.actions.get("save").enable(false);
		form.actions.get("cancel").enable(false);
		form.getFieldElement('sc_bl_xz.status').disabled = true;
		form.getFieldElement('sc_bl_xz.date_approved').disabled = true;
		form.getFieldElement('sc_bl_xz.approved_by').disabled = true;
		form.getFieldElement('sc_bl_xz.approved_dv').disabled = true;
		form.getFieldElement('sc_bl_xz.approved_doc').disabled = true;
		
		
	},
	deleteBuildingRecord_onClose: function() {
        View.log('ascBjUsmsDataBlXiazhangWd');
        if (this.onClose) {
            this.onClose(this);
        }
        View.closeThisDialog();
    }
});
