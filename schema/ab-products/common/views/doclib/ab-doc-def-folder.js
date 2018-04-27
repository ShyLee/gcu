var abDocEditCtrl = View.createController('abDocEditCtrl',{
	
	curFolder:'',			// hierarchy_ids of record currently in edit form

	curFolderParent:'',  // hierarchy_ids of parent of record currently in edit form
	
	newFolderParent:'',   // hierarchy_ids of parent for new records
	
	abDocEdit_detailsPanel_beforeSave: function(){
		this.curFolder = document.getElementById('parentFolder').value+this.abDocEdit_detailsPanel.getFieldValue("docfolder.doc_folder") + '|';
		this.abDocEdit_detailsPanel.setFieldValue("docfolder.hierarchy_ids", this.curFolder);
	},
	
	abDocEdit_detailsPanel_afterRefresh:function(){
		if(this.abDocEdit_detailsPanel.newRecord==true){
			document.getElementById('parentFolder').value=this.newFolderParent;
			this.curFolderParent = this.newFolderParent;
		}else{
			document.getElementById('parentFolder').value=this.curFolderParent;
		}
	},
	
	/**
	 * Set parent folder
	 */
	setParentFolder:function(ob){
		this.newFolderParent='';
		this.curFolderParent='';
		this.curFolder='';

		var clickedNode =abDocEditCtrl.abDocEdit_treePanel.lastNodeClicked.data['docfolder.doc_folder'];
		var record = this.abDocEdit_ds_1.getRecord("docfolder.doc_folder='"+clickedNode+"'");
		if(record){
			this.newFolderParent = record.getValue('docfolder.hierarchy_ids');
			this.curFolder = this.newFolderParent;
			var arr=this.curFolder.split('|');
			for(var i=0;i<arr.length-2;i++){  // use -2 because there is trailing | in string, so split yields extra empty string
				if(i>0){
					this.curFolderParent=this.curFolderParent+"|"+arr[i];
				}else{
					this.curFolderParent=arr[i];
				}
			}
			if(this.curFolderParent) this.curFolderParent=this.curFolderParent+"|";
		}
	},
	
	dialogClicked:function(){
		var clickedValue=abDocEditCtrl.abDocEdit_treePanelForDialog.lastNodeClicked.data['docfolder.hierarchy_ids'];
		document.getElementById('parentFolder').value=clickedValue;
		abDocEditCtrl.newFolderParent = abDocEditCtrl.curFolderParent = clickedValue;
		abDocEditCtrl.abDocEdit_treePanelForDialog.closeWindow.defer(500, abDocEditCtrl.abDocEdit_treePanelForDialog);
	}
});

function selectParentFolder(){
	 var panel =abDocEditCtrl.abDocEdit_treePanelForDialog;
	 if(abDocEditCtrl.abDocEdit_detailsPanel.newRecord==false) {
	   panel.addParameter('param', "docfolder.hierarchy_ids !='"+abDocEditCtrl.curFolder+"'");
	 }
	 else panel.addParameter('param', "1=1");
	 panel.refresh();
	 panel.show(true);
	 panel.showInWindow({
	        width: 600,
	        height: 400
	    });
}

function clearLastNodeClicked(){
	abDocEditCtrl.newFolderParent = '';
}