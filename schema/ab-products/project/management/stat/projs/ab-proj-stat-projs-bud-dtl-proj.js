var projStatProjsBudDtlProjController = View.createController('projStatProjsBudDtlProj',{
	quest: null,
    
    projStatProjsBudDtlProj_projectForm4_afterRefresh: function() {	
		var q_id = 'Project - ' + this.projStatProjsBudDtlProj_projectForm.getFieldValue('project.project_type');	
		this.quest = new Ab.questionnaire.Quest(q_id, 'projStatProjsBudDtlProj_projectForm4');
    },

	projStatProjsBudDtlProj_projectForm_afterRefresh: function() {
		var project_id = this.projStatProjsBudDtlProj_projectForm.getFieldValue('project.project_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', project_id);
		this.projStatProjsBudDtlProj_projectForm2.refresh(restriction);
		this.projStatProjsBudDtlProj_projectForm3.refresh(restriction);
		this.projStatProjsBudDtlProj_projectForm4.refresh(restriction);
	}
});
