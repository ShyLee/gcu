

var ascBjUsmsDataParcellandXiazhangWdController = View.createController('ascBjUsmsDataParcellandXiazhangWd', {
	land_code: "",
	openerController:null,
	afterInitialDataFetch: function(){

		if (this.view.parameters){
        	this.land_code = this.view.parameters['landCode'];
		}
		var title="宗地："+this.land_code;
		this.openerController = this.view.parameters['openerController'];
		this.ascBjUsmsDataParcellandXiazhangWdForm.setTitle(title);
		this.ascBjUsmsDataParcellandXiazhangWdForm.setFieldValue('sc_parcelland_xz.date_xiazhang',new Date());
//		this.ascBjUsmsDataParcellandXiazhangWdForm.setFieldValue('sc_parcelland_xz.date_operate',new Date());
    },
	ascBjUsmsDataParcellandXiazhangWdForm_onSave : function() {
		
		var form=this.ascBjUsmsDataParcellandXiazhangWdForm;
		form.setFieldValue("sc_parcelland_xz.land_code",this.land_code);
		if(!form.canSave()){
			return ;
		}
		 var xzController=this;
		 var confirmMessage = ("是否要将宗地："+this.land_code+" 下账？");
	     controller=this;
	        View.confirm(confirmMessage, function(button){
	        	 
	            if (button == 'yes') {
	            	try {
	            		controller.ascBjUsmsDataParcellandXiazhangWdForm.save();
	            		View.log('ascBjUsmsDataParcellandXiazhangWd');
	                    View.closeThisDialog();
	            		controller.openerController.dialog_onClose();
	    			  }catch (e) {
	    				    Workflow.handleError(e);
	    		 	}
	            }
	        });
	},
    ascBjUsmsDataParcellandXiazhangWdForm_afterRefresh:function(){
        Ext.get("ascBjUsmsDataParcellandXiazhangWdForm_sc_parcelland_xz.approved_by").dom.readOnly=true;
        Ext.get("ascBjUsmsDataParcellandXiazhangWdForm_sc_parcelland_xz.approved_dv").dom.readOnly=true;
    }
});
