var uploadFileController=View.createController("uploadFileController", {
    afterInitialDataFetch: function(){
    	var fileDs = View.dataSources.get('file_type_ds');
    	var restriction="1=1";
    	var records = fileDs.getRecords(restriction);
    	$("#filetype").append('<option value="" selected="selected">'+'</option>');
    	for(var i=0;i<records.length;i++){
    		$("#filetype").append('<option value="'+records[i].getValue('doccat.doc_cat')+'">'+records[i].getValue('doccat.doc_cat')+'</option>');
    	}
    	
    	
    	var currUser=View.user.name;
    	$("#uploader").attr("value",currUser);
    	
    	
    	var openerView = View.getOpenerView();
        var restriction = View.getOpenerView().dialogRestriction;
        if(restriction){	
        	$("input[name='pk']").attr("value",restriction['pk']);
        	$("input[name='tableName']").attr("value",restriction['tbn']);
        }
    },
    closeDialogAfterFileUpload: function() {
	    if (this.onClose) {
	        this.onClose(this);
	    }
	    View.closeThisDialog();
	}
});

$(document).ready(function(){
	$("#formSubmit").click(function(){
		var files = document.getElementsByName("file");
  		if(files[0].value==""){
  			View.alert("请选择需要上传的文件");
  			return false;
  		}
	   document.forms['uploadfile'].submit();
	});
	
	
	$('button[class="btn"]').click(function(){
		this.primaryKey=this.ts_prop_manage_grid.rows[this.ts_prop_manage_grid.selectedRowIndex]['ts_prop_company.prop_code'];
		alert(primaryKey)
		var opener= View.getOpenerView();
		opener.closeDialog();
	});
});



function afterUploadFile(str){
	$("#hint").html(str).stop().fadeIn(2000).fadeOut(2000);
	 uploadFileController.closeDialogAfterFileUpload();
}