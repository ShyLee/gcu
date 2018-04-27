var controller=View.createController('CheckForm',{
	checkValue: null,
	afterInitialDataFetch: function(){
		document.getElementById('defineDate').selectedIndex=0;
	},
	toOtherDvPanel_afterRefresh: function(){
		addXuHao(this.toOtherDvPanel);
	},
	checkHistoryPanel_afterRefresh: function(){
		addXuHaoNext(this.checkHistoryPanel);
	},
	consolePanel_onBtnCheck: function(){
		var res=new Ab.view.Restriction();
		var checkValue=document.getElementById('defineDate').selectedIndex;
		if(checkValue==0){
			View.alert('请选择鉴定类型');
			return;
		}
		if(checkValue==1){
			res.addClause('eq_change.type_adjust','1','=');
		}
		if(checkValue==2){
			res.addClause('eq_change.type_adjust','2','=');
		}
		if(checkValue==3){
			res.addClause('eq_change.type_adjust','3','=');
		}
		
		this.checkValue=checkValue;
		
		View.panels.get('toOtherDvPanel').show(true);
		View.panels.get('toOtherDvPanel').refresh(res);
		View.panels.get('verityAdjustPanel').show(false);
		View.panels.get('checkHistoryPanel').show(true);
		View.panels.get('checkHistoryPanel').refresh(res);
		
		
	},
	
	/**
	 * 鉴定操作
	 */
	verityAdjustPanel_onBtnSave: function(){
		//检查字段是否都正确填写
		var eqIds=this.verityAdjustPanel.getFieldValue('eqIds');
		var eqChangeIds=this.verityAdjustPanel.getFieldValue('eqChangeIds');
		var date_check=this.verityAdjustPanel.getFieldValue('eq_change.date_check');
		var cost=this.verityAdjustPanel.getFieldValue('eq_change.cost');
		var option=this.verityAdjustPanel.getFieldValue('eq_change.check_option');
		if(!valueExistsNotEmpty(eqIds)){
			View.alert("不存在欲鉴定的设备，请添加设备 !");
			return;
		}
		if(!valueExistsNotEmpty(date_check)){
			View.alert("请选择鉴定时间 !");
			return;
		}
		if(!valueExistsNotEmpty(cost)){
			View.alert("请填写现值 !");
			return;
		}
		if(isNaN(cost)){
			View.alert('现值必须为数字形式，如5000 ');
			return;
		}
		if(!valueExistsNotEmpty(option)){
			View.alert("请填写鉴定意见 !");
			return;
		}
		
		//进行鉴定保存操作
		var eqChangeDs=View.dataSources.get('ascBjUsmsEqAdjustApprovedEqChangeDs');
		var changeIDs=new Array();
		changeIDs=eqChangeIds.split(",");
		var sucNum=0;//记录成功操作的条数
		for(var i=0;i<changeIDs.length;i++){
			var eqChangeId=changeIDs[i];
			var eqChangeRes=new Ab.view.Restriction();
			eqChangeRes.addClause('eq_change.id',eqChangeId,'=');
			var eqChangeRecord=eqChangeDs.getRecord(eqChangeRes);
			//更改鉴定状态
			eqChangeRecord.setValue('eq_change.check_status','1');
			//更改鉴定时间
			var date=new Date();
			eqChangeRecord.setValue('eq_change.date_check',date);
			//更改鉴定人
			var emId=View.user.employee.id;
			eqChangeRecord.setValue('eq_change.person_check',emId);
			//更改鉴定意见
			eqChangeRecord.setValue('eq_change.check_option',option);
			//更改现值
			eqChangeRecord.setValue('eq_change.cost',cost);
			
			eqChangeDs.saveRecord(eqChangeRecord);
			
			sucNum++;
		}
		View.alert("成功提交"+sucNum+"条记录");
		//刷新现有的panel
		this.toOtherDvPanel.refresh();
		this.verityAdjustPanel.show(false);
		this.checkHistoryPanel.refresh();
	},
	/**
	 * 刷新操作
	 */
	verityAdjustPanel_afterRefresh: function(){
		var emId=View.user.employee.id;
		this.verityAdjustPanel.setFieldValue('eq_change.person_check',emId);
		//将emID对应的姓名填入姓名项中
		var emDs=View.dataSources.get('ascBjUsmsEmDs');
		var res=new Ab.view.Restriction();
		res.addClause('em.em_id',emId);
		var record=emDs.getRecord(res);
		var emName=record.getValue('em.name');
		this.verityAdjustPanel.setFieldValue('em.name',emName);
		//将鉴定状态改为“已鉴定”
		this.verityAdjustPanel.setFieldValue('eq_change.check_status','1');
		//将鉴定日期改为现在的日期
		var date=new Date();
		this.verityAdjustPanel.setFieldValue('eq_change.date_check',date);
		//刷新grid列表界面
		this.toOtherDvPanel.refresh();
		this.checkHistoryPanel.refresh();
	},
	/**
	 * 取消操作
	 */
	verityAdjustPanel_onBtnCancel: function(){
		this.verityAdjustPanel.setFieldValue('eq_change.cost','');
		this.verityAdjustPanel.setFieldValue('eq_change.appraisal_option','');
		var date=new Date();
		this.verityAdjustPanel.setFieldValue('eq_change.date_check',date);
		
	},
	
	toOtherDvPanel_onBtnCheck: function(){
		//1.遍历整个grid，查看有哪些行已经被选中
		var rows=this.toOtherDvPanel.getSelectedGridRows();
		if(rows.length==0){
			View.alert("请选择需要鉴定的设备 !");
			return;
		}
		var eqIDs="";//欲鉴定的设备列表
		var eqChangeIds=""
		var price="";
		for(var i=0;i<rows.length;i++){
			//IDS
			var row=rows[i];
			var record=row.getRecord()
			var eqId=record.getValue('eq_change.eq_id');
			var eqName=record.getValue('eq_change.eq_name');
			var eqChangeId=record.getValue('eq_change.id');
			if(i==rows.length-1){
				eqIDs=eqIDs+"【"+eqId+"--"+eqName+"】";
				eqChangeIds=eqChangeIds+eqChangeId;
			}else{
				eqIDs=eqIDs+"【"+eqId+"--"+eqName+"】"+",";
				eqChangeIds=eqChangeIds+eqChangeId+",";
			}
			price=record.getValue('eq.price');
			
		}
		this.verityAdjustPanel.clear();
		this.verityAdjustPanel.show(true);

		this.verityAdjustPanel.setFieldValue('eq_change.cost',price);
		
		if(this.checkValue==2){
			View.panels.get('verityAdjustPanel').showField('eq_change.cost',false);
		}else{
			View.panels.get('verityAdjustPanel').showField('eq_change.cost',true);
		}
		
		this.verityAdjustPanel.setFieldValue('eqIds',eqIDs);
		this.verityAdjustPanel.setFieldValue('eqChangeIds',eqChangeIds);
		var emId=View.user.employee.id;
		this.verityAdjustPanel.setFieldValue('eq_change.person_check',emId);
		var emName=getNameById(emId);
		this.verityAdjustPanel.setFieldValue('em.name',emName);
		var date=new Date();
		this.verityAdjustPanel.setFieldValue('eq_change.date_check',date);
	}
	
});

function addXuHao(addXuHaoPanel){
		var rows=addXuHaoPanel.gridRows;
		if(rows.length>0){
			for(var i=0;i<rows.length;i++){
				var row=rows.get(i);
				row.cells.items[1].dom.innerHTML=i+1;
				
			}
		}
}
function addXuHaoNext(addXuHaoPanel){
	var rows=addXuHaoPanel.gridRows;
	if(rows.length>0){
		for(var i=0;i<rows.length;i++){
			var row=rows.get(i);
			row.cells.items[0].dom.innerHTML=i+1;
			
		}
	}
}

function getNameById(emId){
	var ascBjUsmsEmDs=View.dataSources.get('ascBjUsmsEmDs');
	var res=new Ab.view.Restriction();
	res.addClause('em.em_id',emId,'=');
	var record=ascBjUsmsEmDs.getRecord(res);
	var name=record.getValue('em.name');
	return name;
}