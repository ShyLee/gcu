var controller=View.createController('ReduceForm',{
	afterInitialDataFetch: function(){
		this.choseReducePanel.actions.items[0].enable(false);
		this.ReducePanel.showField('eq_change.dv_id',false);
		this.ReducePanel.showField('eq_change.cost',false);
		this.ReducePanel.showField('eq_change.comments',false);
		$('controlType').disabled=false;
	},
	choseReducePanel_afterRefresh: function(){
		this.choseReducePanel.clear();
		
		$('controlType').value="0";
	},
	ReducePanel_afterRefresh: function(){
		this.ReducePanel.clear();
	},
	ReduceInfoListPanel_afterRefresh: function(){
		//this.ReduceInfoListPanel.clear();
	},
	/**
	 * 1.将所有的panel都置空
	 * 2.将select下拉列表disabled=false
	 *
	 */
	ReducePanel_onBtnCancel: function(){
		this.choseReducePanel.clear();
		$('controlType').value="0";
		$('controlType').disabled=false;
		this.ReducePanel.clear();
		this.ReduceInfoListPanel.refresh();
		this.ReducePanel.showField('eq_change.dv_id',false);
		this.ReducePanel.showField('eq_change.cost',false);
		this.ReducePanel.showField('eq_change.comments',false);
	},
	/**
	 * 当点击“确认报减”按钮时，执行报减操作
	 */
	choseReducePanel_onBtnAdd: function(){
		var reduceType=$('controlType').value;
		if(reduceType=="0"){
			View.alert('请选择报减类型！');
			return;
		}
		
		if(!valueExistsNotEmpty(this.choseReducePanel.getFieldValue('eq.eq_id'))){
			View.alert('请选择设备编码！');
			return;
		}
		//查看当前grid中是否已经有这条eq_id的记录
		var rows=this.ReduceInfoListPanel.gridRows;
		var inputEqId=this.choseReducePanel.getFieldValue('eq.eq_id');
		if(rows.length>0){
			for(var i=0;i<rows.length;i++){
				var eqId=rows.get(i).getRecord().getValue('eq.eq_id');
				
				if(eqId==inputEqId){
					View.alert("报减记录中已存在此设备！不能重复添加！");
					this.choseReducePanel.clear();
					return;
				}
			}
		}
		var eq_id=this.choseReducePanel.getFieldValue('eq.eq_id');
		var auditType=$('controlType').value;
		var typeAdjust=0;
		if(auditType=="1"){//退还
			typeAdjust='2';
		}
		if(auditType=="2"){
			typeAdjust='1';
		}
		if(auditType=="3"){
			typeAdjust='3';
		}
		//查询调剂库中是否已有未审核的此设备
		var eqAdjustDs=View.dataSources.get('ascBjUsmsEqReduceRequestEqAdjust');
		var adjustRes=new Ab.view.Restriction();
		adjustRes.addClause('eq_change.eq_id',inputEqId,'=');
		adjustRes.addClause('eq_change.audit_status','0','=');
		//adjustRes.addClause('eq_change.type_adjust',typeAdjust,'=');
		var eqAdjustRec=eqAdjustDs.getRecord(adjustRes);
		if(!eqAdjustRec.isNew){
			View.alert("此设备报减请求已经提交，尚未审核通过！不能重复添加此设备");
			this.choseReducePanel.clear();
			return;
		}
		
		var nowDV="";
		var nowCost="";
		if(reduceType=="2"){
			var nowDV=this.ReducePanel.getFieldValue('eq_change.dv_id');
			var nowCost=this.ReducePanel.getFieldValue('eq_change.cost');
			if(valueExistsNotEmpty(nowDV)&&valueExistsNotEmpty(nowCost)){
				
			}else{
				View.alert("请填入转入单位和现值");
				return;
			}
		}
			//当点击“确定按钮”时，需保证转入单位和现值都已填入
			
			//TODO 执行添加报减操作
			//1.先获得字段传入eq_change对应的panel中
				
				var eqName=this.choseReducePanel.getFieldValue('eq.eq_name');
				var Status=this.choseReducePanel.getFieldValue('eq.status');
				var changeReason=this.choseReducePanel.getFieldValue('eq.comments');
				var cost=this.ReducePanel.getFieldValue('eq_change.cost');
				//2.通过eq_id在eq表中获得其他信息
				var eqDs=View.dataSources.get('ascBjUsmsEqReduceRequestEq');
				var res=new Ab.view.Restriction();
				res.addClause('eq.eq_id',eq_id,'=');
				var record=eqDs.getRecord(res);
				if(!record.isNew){
					var eqStd=record.getValue('eq.eq_std');
					var eq_type=record.getValue('eq.eq_type');
					var emId=record.getValue('eq.em_id');
					var dvId="";
					var dvIdOld=record.getValue('eq.dv_id');
					if(auditType=="2"){
						dvId=this.ReducePanel.getFieldValue('eq_change.dv_id');
					}
					if(auditType=="3"){
						dvId="资产管理处";
					}
					var csiId=record.getValue('eq.csi_id');
					var blIdOld=record.getValue('eq.bl_id');
					var flIdOld=record.getValue('eq.fl_id');
					var rmIdOld=record.getValue('eq.rm_id');
					var typeUseOld=record.getValue('eq.type_use');
					var operPerson=View.user.employee.id;//修改人
					var costOld=record.getValue('eq.price');
					var auditStatus=0;
					var SnNumber=record.getValue('eq.num_serial');
					var comments=record.getValue('comments');
				}
				
				//添加Row
				var totalRow = new Object();
		        totalRow['eq.eq_id'] = eq_id;
		        totalRow['eq.eq_id.index']=eq_id;
		        totalRow['eq.eq_name'] = eqName;
		        totalRow['eq.em_id'] =emId;
		        totalRow['eq.dv_id']=dvIdOld;
		        totalRow['eq.type_use'] =typeUseOld;
		        totalRow['eq.bl_id']=blIdOld;
		        totalRow['eq.fl_id']=flIdOld;
		        totalRow['eq.rm_id']=rmIdOld;
		        totalRow['eq.eq_type']=eq_type;
		        totalRow['eq.csi_id']=csiId;
		        totalRow['eq.price']=costOld;
		        totalRow['auditType']=auditType;
		        if(auditType=="2"){
		        	totalRow['dvId']=dvId;
		        }else{
		        	totalRow['dvId']="";
		        }
		        totalRow['eq.num_serial']=SnNumber;
		        totalRow['eq.eq_std']=eqStd;
		        if(auditType=="2"){
		        	totalRow['costNow']=cost;
		        }else{
		        	totalRow['costNow']="";
		        }
		        totalRow['changeReason']=changeReason;
		        totalRow['eq.status']=Status;
		        totalRow['eq.comments']=comments;
		        totalRow['xiuGaiRen']=operPerson;
		        totalRow['TypeAdjust']=typeAdjust;
		        
		        this.ReduceInfoListPanel.addRow(totalRow);
		        this.ReduceInfoListPanel.reloadGrid();
		        $('controlType').disabled=true;
		        addXuHao();
	},
	/**
	 * 执行批量报减
	 */
	ReducePanel_onBtnReduce: function(){
		var rtrDipId="";
		//当grid中无数据时，提示
		if(this.ReduceInfoListPanel.gridRows.length<=0){
			View.alert('没有报减设备！请添加报减设备');
			
		}
		//当grid中有数据时，逐行取出数据执行保存操作
		else if(this.ReduceInfoListPanel.gridRows.length>0){
			//先将“退还”和“处置”记录到return_dispose中，然后取出其主键，作为eq_change表的外键
			var chuZhiType=$('controlType').value;//1.退还;2.调剂;3.处置
			if(chuZhiType=="1"||chuZhiType=="3"){
				var record = new Ab.data.Record();
				record.isNew = true;
				if(chuZhiType=="1"){
					record.setValue('return_dispose.data_type',0);
				}
				if(chuZhiType=="3"){
					record.setValue('return_dispose.data_type',1);
				}
			    var date=new Date();
			    record.setValue('return_dispose.data_request',date);
			    var dvId=View.user.employee.organization.divisionId;
			    record.setValue('return_dispose.dv_id',dvId);
			    record.setValue('return_dispose.audit_status','0');
			    var description=this.ReducePanel.getFieldValue('eq_change.comments');
			    record.setValue('return_dispose.description',description);
			    try{
			    	this.ascBjUsmsEqReturnSch.saveRecord(record);
			    }catch(e){
			    	for(var p in e){
			    		document.writeln(e[p]);
			    	}
			    }
			    
			    rtrDipId=this.ascBjUsmsEqReturnSch.getRecord().getValue('return_dispose.rtr_dip_id');
			}
			
			var rows=this.ReduceInfoListPanel.gridRows;
			var saveOkLenth=0;//保存成功的条数，保存成功后一条进行累加
			//新建一条record,将record中的数据进行赋值，然后保存
			for(var i=0;i<rows.length;i++){
				var rowRecord=rows.get(i).getRecord();
				var record = new Ab.data.Record();
				record.isNew = true;
			    record.setValue('eq_change.eq_id',rowRecord.getValue('eq.eq_id'));
			    record.setValue('eq_change.rtr_dip_id',rtrDipId);
			    record.setValue('eq_change.eq_name',rowRecord.getValue('eq.eq_name'));
			    record.setValue('eq_change.eq_type',rowRecord.getValue('eq.eq_type'));
			    record.setValue('eq_change.eq_std',rowRecord.getValue('eq.eq_std'));
			    record.setValue('eq_change.em_id_old',rowRecord.getValue('eq.em_id'));
			    record.setValue('eq_change.bl_id_old',rowRecord.getValue('eq.bl_id'));
			    record.setValue('eq_change.fl_id_old',rowRecord.getValue('eq.fl_id'));
			    record.setValue('eq_change.rm_id_old',rowRecord.getValue('eq.rm_id'));
			    record.setValue('eq_change.type_use_old',rowRecord.getValue('eq.type_use'));
			    record.setValue('eq_change.dv_id_old',rowRecord.getValue('eq.dv_id'));
			    var auditType=rowRecord.getValue('auditType');
			    if(auditType=="2"){
			    	record.setValue('eq_change.dv_id',rowRecord.getValue('dvId'));
			    	record.setValue('eq_change.cost',rowRecord.getValue('costNow'));
			    }
			    record.setValue('eq_change.operator',rowRecord.getValue('xiuGaiRen'));
			    record.setValue('eq_change.change_reason',rowRecord.getValue('changeReason'));
			    record.setValue('eq_change.cost_old',rowRecord.getValue('eq.price'));
			    record.setValue('eq_change.comments',rowRecord.getValue('eq.comments'));
			    if(auditType=="1"){
			    	record.setValue('eq_change.type_adjust',2);
			    }
			    if(auditType=="2"){
			    	record.setValue('eq_change.type_adjust',1);
			    }
			    if(auditType=="3"){
			    	record.setValue('eq_change.type_adjust',3);
			    }
			    record.setValue('eq.audit_status',0);
			    try{
			    	var isSaveOk= this.ascBjUsmsEqReduceRequestEqAdjust.saveRecord(record);
			    }catch(e){
			    	for(var p in e){
			    		document.write(e[p]);
			    	}
			    }
			  
			  if(isSaveOk){
				  
				  saveOkLenth++;
			  }
			    
			}
			$('controlType').disabled=false;
			$('controlType').value="0";
			this.ReduceInfoListPanel.refresh();
			View.alert("共有"+rows.length+"条记录,提交成功"+saveOkLenth+"条");
			this.choseReducePanel.clear();
			
		}
	}
});
/**
 * 根据eq_id得出eqName
 *
 */
function inputEqName(fieldName,nowValue,preValue){
	var choseReducePanel=View.panels.get('choseReducePanel');
	var ReduceInfoListPanel=View.panels.get('ReduceInfoListPanel');
	var eqId=nowValue;
	var eqName=getEqNameById(eqId);
	if(eqName==""){
		View.alert("不存在此用户!");
	}else{
		choseReducePanel.setFieldValue('eq.eq_name',eqName);
	}
	
	
}

function getEqNameById(eqId){
	var eqName="";
	var eqDs=View.dataSources.get('ascBjEq');
	var res=new Ab.view.Restriction();
	res.addClause('eq.eq_id',eqId,'=');
	var record=eqDs.getRecord(res);
	if(record.isNew){
		eqName="";
	}else{
		eqName=record.getValue('eq.eq_name');
	}
	return eqName;
}

/**
 * 选择下拉列表的值，激发事件
 * @param value 下拉列表所选择的值
 */
function selectValue(value){
	
	var choseReducePanel=View.panels.get('choseReducePanel');
	var ReducePanel=View.panels.get('ReducePanel');
	
	if(value=="0"){
		ReducePanel.actions.items[2].enable(false);
	}else{
		ReducePanel.actions.items[2].enable(true);
		if(value=="1"){
			//ReducePanel.actions.items[2].setTitle(getMessage('txtReturn'));
			ReducePanel.actions.items[2].setTitle('退还');
		}
		if(value=="2"){
			ReducePanel.actions.items[2].setTitle('调剂');
		}
		if(value=="3"){
			ReducePanel.actions.items[2].setTitle('处置');
		}
	}
	
	choseReducePanel.setFieldValue('eq.eq_id','');
	choseReducePanel.setFieldValue('eq.eq_name','');
	choseReducePanel.setFieldValue('eq.status','in');
	choseReducePanel.setFieldValue('eq.comments','');
	
	ReducePanel.setFieldValue('eq_change.dv_id','');
	ReducePanel.setFieldValue('eq_change.cost','');
	
	
	if(value=="0"){
		choseReducePanel.actions.items[0].enable(false);
	}else{
		choseReducePanel.actions.items[0].enable(true);
	}
	if(value=="0"){
		ReducePanel.showField('eq_change.dv_id',false);
		ReducePanel.showField('eq_change.cost',false);
		ReducePanel.showField('eq_change.comments',false);
	}
	if(value=="1"){
		ReducePanel.showField('eq_change.dv_id',false);
		ReducePanel.showField('eq_change.cost',false);
		ReducePanel.showField('eq_change.comments',false);
	}
	if(value=="2"){
		ReducePanel.showField('eq_change.dv_id',true);
		ReducePanel.showField('eq_change.cost',true);
		ReducePanel.showField('eq_change.comments',false);
	}
	if(value=="3"){
		ReducePanel.showField('eq_change.dv_id',false);
		ReducePanel.showField('eq_change.cost',false);
		ReducePanel.showField('eq_change.comments',true);
	}
}

/**
 * 执行删除"报减条目"的操作
 * @param value
 */
function deleteRecord(value){
	var ReduceInfoListPanel=View.panels.get('ReduceInfoListPanel');
	var index=ReduceInfoListPanel.selectedRowIndex;
	ReduceInfoListPanel.removeRow(index);
	ReduceInfoListPanel.reloadGrid();
	var rowsLength=ReduceInfoListPanel.gridRows.length;
	if(rowsLength==0){
		 $('controlType').disabled=false;
	}
	addXuHao();
}

function addXuHao(){
	var ReduceInfoListPanel=View.panels.get('ReduceInfoListPanel');
	var rows=ReduceInfoListPanel.gridRows;
	if(rows.length>0){
		for(var i=0;i<rows.length;i++){
			var row=rows.get(i);
			row.cells.items[0].dom.innerHTML=i+1;
			
		}
	}
}