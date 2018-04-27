var controller=View.createController('detialViewForm',{
	
	consolePanel_onBtnShow: function(){
		var eqId=this.consolePanel.getFieldValue('eq.eq_id');
		var eqName=this.consolePanel.getFieldValue('eq.eq_name');
		var blId=this.consolePanel.getFieldValue('eq.bl_id');
		var dvId=this.consolePanel.getFieldValue('eq.dv_id');
		
		var consoleRes=new Ab.view.Restriction();
		if(valueExistsNotEmpty(eqId)){
			consoleRes.addClause('eq.eq_id',eqId,'=');
		}
		if(valueExistsNotEmpty(eqName)){
			consoleRes.addClause('eq.eq_name','%'+eqName+'%','LIKE');
		}
		if(valueExistsNotEmpty(blId)){
			consoleRes.addClause('eq.bl_id','%'+blId+'%','LIKE');
		}
		if(valueExistsNotEmpty(dvId)){
			consoleRes.addClause('eq.dv_id','%'+dvId+'%','LIKE');
		}
		this.eqListPanel.refresh(consoleRes);
		
		this.eqDetialInforPanel.show(false,false);
		this.eqImageFilePanel.show(false,false);
		this.servcontInforPanel.show(false,false);
		this.eqAttachmentPanel.show(false,false);
	},
	consolePanel_onBtnClear: function(){
		this.consolePanel.clear();
		this.eqListPanel.restriction=null;
		this.eqListPanel.refresh("");
	},
	
});

function selectEqList(value){
	var eqDetialInforPanel=View.panels.get('eqDetialInforPanel');//设备详细
	var eqImageFilePanel=View.panels.get('eqImageFilePanel');//设备图片
	var servcontInforPanel=View.panels.get('servcontInforPanel');//保修信息
	var eqAttachmentPanel=View.panels.get('eqAttachmentPanel');//附件信息
	var eqDs=View.dataSources.get('ascBjUsmsEqDs');
	var eqId=value.restriction['eq.eq_id'];
	
	eqImageFilePanel.show(true);
	eqImageFilePanel.refresh(value.restriction);
	eqDetialInforPanel.show(true);
	eqDetialInforPanel.refresh(value.restriction);
	
	//显示图像
	var imageFile=eqImageFilePanel.getFieldValue('eq.image_file');
	if(valueExistsNotEmpty(imageFile)){
		var isrc=View.project.projectGraphicsFolder+'/'+imageFile;
		eqImageFilePanel.fields.get('image_field').dom.src =isrc;
	}else{
		eqImageFilePanel.fields.get('image_field').dom.src = null;
		eqImageFilePanel.fields.get('image_field').dom.alt =getMessage('text_no_image');
	}
	
	
	var eqRecord=eqDs.getRecord(value.restriction);
	if(!eqRecord.isNew){
		//获取保修单信息
		var warrantyId=eqRecord.getValue('eq.warranty_id');
		var warrantyRes=new Ab.view.Restriction();
		warrantyRes.addClause('warranty.warranty_id',warrantyId,'=');
		servcontInforPanel.show(true);
		servcontInforPanel.refresh(warrantyRes);
		
		//获取附件信息
		var attRes=new Ab.view.Restriction();
		attRes.addClause('eq_attht.attht_id',eqId+'%','LIKE');
		eqAttachmentPanel.show(true);
		eqAttachmentPanel.refresh(attRes);
	}
	
	
}