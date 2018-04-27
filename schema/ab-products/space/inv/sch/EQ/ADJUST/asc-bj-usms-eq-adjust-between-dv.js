var controller=View.createController('ReduceForm',{
	afterInitialDataFetch: function(){
		//初始化加载时清空dv_id中的内容
		this.formPanel.setFieldValue('eq.comments',"");
	},
	gridPanel_afterRefresh: function(){
		//为grid表格添加序号
		addXuHao(this.gridPanel);
	},
	consolePanel_onBtnShow: function(){
		var eqId=this.consolePanel.getFieldValue('eq.eq_id');
		var eqName=this.consolePanel.getFieldValue('eq.eq_name');
		
		var filterRes=new Ab.view.Restriction();
		if(valueExistsNotEmpty(eqId)){
			filterRes.addClause('eq.eq_id',eqId,'=');
		}
		if(valueExistsNotEmpty(eqName)){
			filterRes.addClause('eq.eq_name','%'+eqName+'%','LIKE');
		}
		
		this.gridPanel.refresh(filterRes);
	},
	consolePanel_onBtnClear: function(){
		this.gridPanel.restriction=null;
		this.gridPanel.refresh("");
	},
	formPanel_onBtnAdjust: function(){
		//判断“转入单位”项是否为空，如果为空则弹出提示，并退出当前操作
		var comments=this.formPanel.getFieldValue('eq.comments');
		var eqId=this.formPanel.getFieldValue('eq.eq_id');
		var eqName=this.formPanel.getFieldValue('eq.eq_name');
		
		if(!valueExistsNotEmpty(comments)){
			View.alert("调转备注信息不能为空!请填写后继续操作!");
			return;
		}
		//判断这个要调剂的设备是否已经提交并且处于“已提交”的状态，则取消操作并弹出对话框
		var eqExistsRes=new Ab.view.Restriction();
		eqExistsRes.addClause('eq_change.eq_id',eqId,'=');
		eqExistsRes.addClause('eq_change.audit_status','0');
		eqExistsRes.addClause('eq_change.type_adjust','0','!=');
		
		var eqExistsRecord=this.ascBjUsmsEqReduceRequestEqAdjust.getRecord(eqExistsRes);
		if(eqExistsRecord.isNew!=true){
			View.alert("此设备的调剂申请已经提交，请审批结束后再进行操作!");
			return;
		}
		
		//1.弹出firm，询问用户是否确认调剂
		
		View.confirm("确认要将设备编码为："+eqId+";设备名称为："+eqName+"的设备吗?",function(button){
			if(button=="yes"){
				//2.根据eq_id从eq表中取出该id的相关信息，封装到一个record中
				var eqRes=new Ab.view.Restriction();
				eqRes.addClause('eq.eq_id',eqId,'=');
				var eqDs=View.dataSources.get('ascBjUsmsEqReduceRequestEq');
				var eqRecord=eqDs.getRecord(eqRes);
				
				//3.新建一个isNew=true的有关于表eq_change的record,将eq中的信息传入
				var record = new Ab.data.Record();
				record.isNew = true;
			    record.setValue('eq_change.eq_id',eqRecord.getValue('eq.eq_id'));
			    record.setValue('eq_change.eq_name',eqRecord.getValue('eq.eq_name'));
			    record.setValue('eq_change.eq_type',eqRecord.getValue('eq.eq_type'));
			    record.setValue('eq_change.eq_std',eqRecord.getValue('eq.eq_std'));
			    record.setValue('eq_change.em_id_old',eqRecord.getValue('eq.em_id'));
			    record.setValue('eq_change.bl_id_old',eqRecord.getValue('eq.bl_id'));
			    record.setValue('eq_change.fl_id_old',eqRecord.getValue('eq.fl_id'));
			    record.setValue('eq_change.rm_id_old',eqRecord.getValue('eq.rm_id'));
			    record.setValue('eq_change.type_use_old',eqRecord.getValue('eq.type_use'));
			    record.setValue('eq_change.dv_id_old',eqRecord.getValue('eq.dv_id'));
			    var operator=View.user.employee.id;
			    record.setValue('eq_change.operator',operator);
			    record.setValue('eq_change.num_serial',eqRecord.getValue('eq.num_serial'));
			    record.setValue('eq_change.cost_old',eqRecord.getValue('eq.price'));
			    record.setValue('eq_change.comments',comments);

			    record.setValue('eq_change.type_adjust',1);

			    record.setValue('eq.audit_status',0);
			    try{
			    	var eqChangeDs=View.dataSources.get('ascBjUsmsEqReduceRequestEqAdjust');
			    	eqChangeDs.saveRecord(record);
			    	View.alert("调剂申请提交成功!");
			    }catch(e){
			    	View.alert("程序操作遇到错误，设备调剂失败!");
			    } 
			}
		});
		   
	},
	formPanel_onBtnCancelAdjust: function(){
		this.formPanel.setFieldValue('eq.comments','');
	}
});
/**
 * 为grid Panel添加序号的封装方法
 * @param panel  PanelId
 */
function addXuHao(panel){
	var rows=panel.gridRows;
	if(rows.length>0){
		for(var i=0;i<rows.length;i++){
			var row=rows.get(i);
			row.cells.items[0].dom.innerHTML=i+1;
		}
	}
}

function clearDv(){
	var formPanel=View.panels.get('formPanel');
	formPanel.setFieldValue('eq.dv_id',"");
	
}