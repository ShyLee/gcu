/**
 * @author lei 
 */

Ab.command.exportPanel.prototype.openReport =  function(panel){
	View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));  
	 try{
		 if(valueExists(panel) && panel.callReportJob){
			 var reportProperties = {outputType: this.outputType, printRestriction: this.printRestriction, 
					 orientation: this.orientation};
			 var jobId = panel.callReportJob(reportProperties);
			 if(jobId != null){
				 var jobStatus = Workflow.getJobStatus(jobId);
    			 //XXX: finished or failed
    			 while (jobStatus.jobFinished != true && jobStatus.jobStatusCode != 8) {
					jobStatus = Workflow.getJobStatus(jobId);
    			 }
				
    			 if (jobStatus.jobFinished) {
					var url  = jobStatus.jobFile.url;
					window.open(url)
				}
			 }
		 } 
	 }catch(e){
		 var message = View.getLocalizedString(this.z_ERROR_MESSAGE);
         View.showMessage('error', message, e.message, e.data);
	 }
	View.closeProgressBar();
}




