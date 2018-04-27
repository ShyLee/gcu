var controller = View.createController('abSpAsgnEmToRm_Controller', {
	dvName:null,
	stuNo:null,
	stuName:null,
    afterViewLoad: function(){
		 this.SiteTree.addParameter('siteRestriction', "site.site_id like '%广州学院%'");
    },
    ConsoleForm_onShowTree: function(){
    	var dvName = this.ConsoleForm.getFieldValue('dv.dv_name');
        var stuNo = this.ConsoleForm.getFieldValue('sc_student.stu_no');
        var stuName = this.ConsoleForm.getFieldValue('sc_student.stu_name');
		var restriction = new Ab.view.Restriction();
		if(dvName != "")
			restriction.addClause('dv.dv_name' , dvName , '=');	
		if(stuNo != "")
			restriction.addClause('sc_student.stu_no' , stuNo , '=');
		if(stuName != "")
			restriction.addClause('sc_student.stu_name' , stuName , '=');	
		this.stuSelect.refresh(restriction);
    },
	ConsoleForm_onClear:function(){
    	this.ConsoleForm.clear();
		var rec = new Ab.view.Restriction();
    	this.stuSelect.refresh(rec);
	},
    showAllFlashInfo: function(afterShow){
    	if(this.stuSelect.rows.length==0){
    		return;
    	}else{	
    		var panel = this.stuSelect;
    		var index = -1;
    		if(afterShow){
    			index = 0;
    		}else{
    			index = this.stuSelect.selectedRowIndex;
    			}
    		var stuNo = this.stuSelect.gridRows.get(index).getFieldValue("sc_student.stu_no");
	        this.stuNo = stuNo;
		    var restriction = new Ab.view.Restriction();
	        restriction.addClause('sc_student.stu_no', stuNo,"=");
	        this.abSpAsgnEmToRm_emAssigned.refresh(restriction);
    		}
    }, 
});
function onTreeClick(){
	var curNode=View.panels.get("SiteTree").lastNodeClicked;
	controller.curTreeNode= curNode;
	var dvRes=curNode.data['dv.dv_id'];
    var rec2 = new Ab.view.Restriction();
    rec2.addClause('sc_student.dv_id' , dvRes , '=');
	controller.stuSelect.refresh(rec2);
    var rec3 = new Ab.view.Restriction();
    rec3.addClause('sc_stu_log.dv_id' , dvRes , '=');
	controller.abSpAsgnEmToRm_emAssigned.refresh(rec3);
}