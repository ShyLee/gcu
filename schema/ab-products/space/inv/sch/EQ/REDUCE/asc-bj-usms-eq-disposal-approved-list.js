var controller=View.createController('disposeApprovedPanel',{
	
	afterInitialDataFetch: function(){
		addXuHao(this.returnDisposeListPanel);
		this.doDisposePanel.showField('return_dispose.cz_price',false);
		
	},
	returnDisposeListPanel_afterRefresh: function(){
		addXuHao(this.returnDisposeListPanel);
		
	},
	
	eqChangeListPanel_afterRefresh: function(){
		var rows=this.eqChangeListPanel.gridRows;
		if(rows.length>0){
			for(var i=0;i<rows.length;i++){
				var row=rows.get(i);
				var emId=row.getRecord().getValue('eq_change.person_check');
				var emName=getNameById(emId);
				row.cells.get(8).dom.innerHTML=emName;
				
			}
		}
		
	},
	/**
	 * "完成处置"操作
	 */
	doDisposePanel_onBtnDoDispose: function(){
		//如果此退还单下有未鉴定的设备，则不能完成退还
		var rows=this.eqChangeListPanel.gridRows;
		if(rows.length==0){
			View.alert("此处置单下无待处置设备,不能完成处置!");
			return;
		}
		var isAllChecked=true;
		for(var i=0;i<rows.length;i++){
			var row=rows.get(i);
			var rowRecord=row.getRecord();
			var checkStatus=rowRecord.getValue('eq_change.check_status');
			if(checkStatus=='0'){
				//未鉴定的情况
				isAllChecked=false;
			}
		}
		if(isAllChecked==false){
			View.alert('此处置单下有设备未鉴定，需鉴定后才可完成处置!');
			return;
		}else{
			var approveBy=View.user.employee.id;//审核人
			var approveDate=new Date();
			//1. 将return_dispose的审核状态改为"审核已通过"
			var rtrId=this.doDisposePanel.getFieldValue('return_dispose.rtr_dip_id');
			var rtrRes=new Ab.view.Restriction();
			rtrRes.addClause('return_dispose.rtr_dip_id',rtrId,'=');
			var chooseType=this.doDisposePanel.getFieldValue('return_dispose.dispose_type');
			var czPrice="";//残值
			var donateTo="";//捐赠给
			if(chooseType=="0"){
				donateTo=this.doDisposePanel.getFieldValue('return_dispose.donate_to');
				if(!valueExistsNotEmpty(donateTo)){
					View.alert("'捐赠给'字段不能为空");
					return;
				}
			}
			if(chooseType=="1"){
				czPrice=this.doDisposePanel.getFieldValue('return_dispose.cz_price');
				if(valueExistsNotEmpty(czPrice)){
					if(isNaN(czPrice)){
						View.alert('残值必须为数字形式');
						return;
					}
				}else{
					View.alert("'残值'字段不能为空");
					return;
				}
			}
			var handleBy=this.doDisposePanel.getFieldValue('return_dispose.handle_by');
			var rtrRecord=this.ascBjUsmsReturnDisoposeDs.getRecord();
			if(!rtrRecord.isNew){
				rtrRecord.setValue('return_dispose.approved_by',approveBy);
				rtrRecord.setValue('return_dispose.date_approved',approveDate);
				rtrRecord.setValue('return_dispose.audit_status','1');
				if(chooseType=="1"){
					rtrRecord.setValue('return_dispose.cz_price',czPrice);
				}
				if(chooseType=="0"){
					rtrRecord.setValue('return_dispose.donate_to',donateTo);
				}
				rtrRecord.setValue('return_dispose.handle_by',handleBy);
				this.ascBjUsmsReturnDisoposeDs.saveRecord(rtrRecord);
			}
			
			
			//2. 将eq_change表中与之对应的项的审核状态改为"审核已通过"
			var ecRes=new Ab.view.Restriction();
			ecRes.addClause('eq_change.rtr_dip_id',rtrId,'=');
			var ecRecords=this.ascBjUsmsEqChange.getRecords(ecRes);
			for(var i=0;i<ecRecords.length;i++){
				var ecRecord=ecRecords[i];
				ecRecord.isNew=false;
				if(!ecRecord.isNew){
					ecRecord.setValue('eq_change.audit_status','1');
				}
				this.ascBjUsmsEqChange.saveRecords(ecRecords);

			}
			
			
			//3. 将eq表中设备状态改为：捐赠-->其他    出售-->报废  拆件使用-->将挡
			for(var k=0;k<ecRecords.length;k++){
				var ecEqRecord=ecRecords[k];
				var eqId=ecEqRecord.getValue('eq_change.eq_id');
				var eqRes=new Ab.view.Restriction();
				eqRes.addClause('eq.eq_id',eqId);
				var eqRecord=this.ascBjUsmsEqDs.getRecord(eqRes);
				if(!eqRecord.isNew){
					if(chooseType=="0"){
						eqRecord.setValue('eq.sch_status','9');//捐赠-->其他
					}
					if(chooseType=="1"){
						eqRecord.setValue('eq.sch_status','6');//出售-->报废
					}
					if(chooseType=="2"){
						eqRecord.setValue('eq.sch_status','8');//拆件使用-->降挡
					}
					this.ascBjUsmsEqDs.saveRecord(eqRecord);
				}
			}
			View.alert("处置审批成功！");
			this.checkInformationPanel.clear();
			this.checkInformationPanel.show(false);
			this.doDisposePanel.show(false);
			this.eqChangeListPanel.show(false);
			this.returnDisposeListPanel.refresh();	
		}	
	}
});
/**
 * 选择grid中的单列
 * @param value
 */
function onSelectItem(value){
	var eqChangeListPanel=View.panels.get('eqChangeListPanel');
	var doDisposePanel=View.panels.get('doDisposePanel');
	var checkInformationPanel=View.panels.get('checkInformationPanel');
	
	var rtrId=value.restriction['return_dispose.rtr_dip_id'];
	var eqChangeRes=new Ab.view.Restriction();
	eqChangeRes.addClause('eq_change.rtr_dip_id',rtrId,'=');
	eqChangeListPanel.show();
	eqChangeListPanel.refresh(eqChangeRes);

	doDisposePanel.show();
	doDisposePanel.refresh(value.restriction);
	checkInformationPanel.show();
	checkInformationPanel.refresh(eqChangeRes);
	addXuHao(eqChangeListPanel);
}

/**
 * 选择下拉列表中的一项
 * @param value 选定行的元素
 */
function onclickSelect(value){
	var doDisposePanel=View.panels.get('doDisposePanel');
	if(value=="1"||value=="2"){
		if(value=="1"){
			doDisposePanel.showField('return_dispose.cz_price',true);
		}else{
			doDisposePanel.showField('return_dispose.cz_price',false);
		}
		doDisposePanel.showField('return_dispose.donate_to',false);
	}
	if(value=="0"){
		doDisposePanel.showField('return_dispose.donate_to',true);
		doDisposePanel.showField('return_dispose.cz_price',false);
	}
}
/**
 * 为指定的grid Panel增加序号
 * @param PanelId 指定的panelId
 */
function addXuHao(PanelId){
	
	var rows=PanelId.gridRows;
	if(rows.length>0){
		for(var i=0;i<rows.length;i++){
			var row=rows.get(i);
			row.cells.items[0].dom.innerHTML=i+1;
			
		}
	}
}

function getNameById(emId){
	var emDs=View.dataSources.get('ascBjUsmsEmDs');
	var emRes=new Ab.view.Restriction();
	emRes.addClause('em.em_id',emId);
	var emName=emDs.getRecord(emRes).getValue('em.name');
	if(!valueExistsNotEmpty(emName)){
		emName="";
	}
	return emName;
}