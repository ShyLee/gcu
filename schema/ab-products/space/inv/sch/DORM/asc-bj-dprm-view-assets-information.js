var controller = View.createController('abSpAsgnEmToRm_Controller', {

    afterViewLoad: function(){
    	this.blId = this.view.parameters['blId'];
		this.flId = this.view.parameters['flId'];
		this.rmId = this.view.parameters['rmId'];
//		this.Grid1.addParameter("blIdRes",this.blId);
//		this.Grid1.addParameter("flIdRes",this.flId);
//		this.Grid1.addParameter("rmIdRes",this.rmId);
//		
//		this.Grid2.addParameter("blIdRes",this.blId);
//		this.Grid2.addParameter("flIdRes",this.flId);
//		this.Grid2.addParameter("rmIdRes",this.rmId);
		var restriction = new Ab.view.Restriction();
		restriction.addClause('rm.bl_id' , this.blId , '=');	
		restriction.addClause('rm.fl_id' , this.flId , '=');
		restriction.addClause('rm.rm_id' , this.rmId , '=');	
		this.Grid1.refresh(restriction);
		this.Grid2.refresh(restriction);
    },
});