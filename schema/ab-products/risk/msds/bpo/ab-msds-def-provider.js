View.createController("abMsdsDefProviderController", {
	

	/**
	 *  Execute after 'abMsdsDefProviderForm' Form refreshed
	 */
	abMsdsDefProviderForm_onSave: function(){
		
		var form=this.abMsdsDefProviderForm;
		form.setFieldValue('company.date_last_updated',getCurrentDateInISOFormat());
		form.save();
		this.abMsdsDefProviderGrid.refresh();
		
	}
});

//YYYY-MM-DD
function getCurrentDateInISOFormat()
{
	var returnedDate = "";
	var curDate = new Date();
	var month = curDate.getMonth()+ 1;
	var day	  = curDate.getDate();
	var year  = curDate.getFullYear();
	returnedDate = year + "-" + month + "-" + day;
	return returnedDate;
}