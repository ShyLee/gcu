
var importStudentController=View.createController('importStudentController',{
	
	afterViewLoad:function(){

	},
	afterInitialDataFetch:function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0]; 
		this.stuInYear = this.tabs.stuInYear;
		var ds = this.importFailGridPanel;
		ds.addParameter('stuInYear',this.stuInYear);
		this.importFailGridPanel.refresh();
	},
	importFailFormPanel_onAdd:function(){
		var panel = this.importFailFormPanel;
		var stu_no = panel.getFieldValue("sc_student_verify.stu_no");
		var stu_name = panel.getFieldValue("sc_student_verify.stu_name");
		var stu_sex = panel.getFieldValue("sc_student_verify.stu_sex" );
		var stu_in_year = panel.getFieldValue("sc_student_verify.stu_in_year");
		var status = panel.getFieldValue("sc_student_verify.status");
		var dv_name = panel.getFieldValue("sc_student_verify.dv_name");
		var pro_name = panel.getFieldValue("sc_student_verify.pro_name");
		var bl_id = panel.getFieldValue("sc_student_verify.bl_id");
		var fl_id = panel.getFieldValue("sc_student_verify.fl_id");
		var rm_id = panel.getFieldValue("sc_student_verify.rm_id");
		var phone = panel.getFieldValue("sc_student_verify.phone");
		var telephone = panel.getFieldValue("sc_student_verify.telephone");
		var comments = panel.getFieldValue("sc_student_verify.comments");
		var controllerImport = this;
		try{
			
			var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-ImportStudentService-insertNewData',stu_no,stu_name,stu_sex,stu_in_year,status,dv_name,pro_name,bl_id,fl_id,rm_id,phone,telephone,comments);
			if (result.code == 'executed') {
				this.importFailGridPanel.refresh();
				var obj = eval("(" + result.jsonExpression + ")");
				var message = obj.messageImport;
				View.showMessage(message);
				if(message=="导入已进行"){
					controllerImport.importFailFormPanel.closeWindow();
				}
			}
		}catch(e){
			Workflow.handleError(e);
		}
	},
	showEditPanel:function(){
		var restriction = new Ab.view.Restriction();
		var selectedIndex = this.importFailGridPanel.selectedRowIndex;
		var stu_no=this.importFailGridPanel.rows[selectedIndex]["sc_student_verify.stu_no"];
		restriction.addClause("sc_student_verify.stu_no", stu_no, "=");
		this.importFailFormPanel.addParameter('stuInYear',this.stuInYear);
		this.importFailFormPanel.refresh(restriction,false);
		this.importFailFormPanel.showInWindow({
			left:0,
	        width: 600,
	        height: 400
	    });
	},
	importFailFormPanel_onClose: function() {
        this.importFailFormPanel.closeWindow();
    }
	
});