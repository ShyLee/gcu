var projStatDashProfController = View.createController('projStatDashProf',{
	
	projStatDashProf_form_afterRefresh: function(){
		var openerController = View.controllers.get('projStatDash');
		openerController.refreshProjDash(this.projStatDashProf_form.getRecord());
	}	
});
