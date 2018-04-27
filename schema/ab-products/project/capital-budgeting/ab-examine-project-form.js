var examineProjectFormController = View.createController('examineProjectForm', {
    
    quest : null,
    
    examineProjectFormColumnReport_afterRefresh : function() {
		var q_id = 'Project - ' + this.examineProjectFormColumnReport.getFieldValue('project.project_type');
		this.quest = new Ab.questionnaire.Quest(q_id, 'examineProjectFormColumnReport', true);
    }
});