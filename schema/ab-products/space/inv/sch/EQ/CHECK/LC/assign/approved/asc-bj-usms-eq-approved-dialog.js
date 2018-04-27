var controller=View.createController('checkApproveForm',{
	 afterInitialDataFetch: function(){
		 if (this.view.parameters){
			 var checkMainId=this.view.parameters['check_main_id']
			 var dvId=this.view.parameters['dv_id'];
			 var reportRes=new Ab.view.Restriction();
			 reportRes.addClause('eq_check_report.check_main_id',checkMainId,'=');
			 reportRes.addClause('eq_check_report.dv_id',dvId,'=');
			 this.eqCheckReportPanel.refresh(reportRes);
		 }
		 
	 }
});