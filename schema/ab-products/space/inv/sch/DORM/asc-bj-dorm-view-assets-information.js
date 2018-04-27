var abSpAsgnEmToRm_Controller = View.createController('abSpAsgnEmToRm_Controller', {
	afterViewLoad:function(){
		
    	this.blId = this.view.parameters['blId'];
		this.flId = this.view.parameters['flId'];
		this.rmId = this.view.parameters['rmId'];
		this.Grid1.addParameter("BlFlRm","rm.bl_id='"+this.blId+"' and rm.fl_id='"+this.flId+"' and rm.rm_id='"+this.rmId+"'");
		this.Grid2.addParameter("BlFlRmEq","eq.bl_id='"+this.blId+"' and eq.fl_id='"+this.flId+"' and eq.rm_id='"+this.rmId+"'");
		this.stuGrid.addParameter("BlFlRmStu","sc_student.bl_id='"+this.blId+"' and sc_student.fl_id='"+this.flId+"' and sc_student.rm_id='"+this.rmId+"'");
	}
});