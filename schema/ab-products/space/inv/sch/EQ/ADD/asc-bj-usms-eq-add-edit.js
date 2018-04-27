var controller=View.createController('addEqEditPanel',{
	addEqDetailPanel_afterRefresh: function(){
		var role=View.user.role;
		if(role=='UNV EQ ADMIN'){
			this.addEqDetailPanel.actions.get("btnSave").enable(true);
		}else{
			this.addEqDetailPanel.actions.get("btnSave").enable(false);
		}
	},
	showEqPanel: function(){
		var selectIndex=this.addEqListGridPanel.selectedRowIndex;
		var addEqId=this.addEqListGridPanel.gridRows.get(selectIndex).getRecord().getValue("add_eq.add_eq_id");
		var eqRes=new Ab.view.Restriction();
		eqRes.addClause("eq.add_eq_id",addEqId,'=');
		this.EqOfTheAddEqPanel.refresh(eqRes);
		
	},
	/**
     * 查看设备附件列表
     */
    EqOfTheAddEqPanel_onViewAttach:function(){
    	var selectIndex=this.EqOfTheAddEqPanel.selectedRowIndex;
		var addEqId=this.EqOfTheAddEqPanel.gridRows.get(selectIndex).getRecord().getValue('eq.add_eq_id');
		var eqId=this.EqOfTheAddEqPanel.gridRows.get(selectIndex).getRecord().getValue('eq.eq_id');
        
		View.openDialog("asc-bj-usms-eq-attach-card.axvw",null,false,{
			x:150,
			y:200,
			width:900,
			height:400,
			addEqId:addEqId,
			eqId:eqId
		});
    },
	addEqDetailPanel_onBtnSave: function(){
		var addEqId=this.addEqDetailPanel.getFieldValue("add_eq.add_eq_id");
		var brand=this.addEqDetailPanel.getFieldValue("add_eq.brand");
//		var eqStd=this.addEqDetailPanel.getFieldValue("add_eq.eq_std");
		var eqType=this.addEqDetailPanel.getFieldValue("add_eq.eq_type");
		var price=this.addEqDetailPanel.getFieldValue("add_eq.price");
		var csiId=this.addEqDetailPanel.getFieldValue("add_eq.csi_id");
		var ctryId=this.addEqDetailPanel.getFieldValue("add_eq.ctry_id");
		var ctryName=this.addEqDetailPanel.getFieldValue("add_eq.ctry_name");
		var danjuId=this.addEqDetailPanel.getFieldValue("add_eq.danju_id");
		var datePurchased=this.addEqDetailPanel.getFieldValue("add_eq.date_purchased");
		var sciResId=this.addEqDetailPanel.getFieldValue("add_eq.sci_resh_id");
		var subjectFund=this.addEqDetailPanel.getFieldValue("add_eq.subject_funds");
		var vnId=this.addEqDetailPanel.getFieldValue("add_eq.vn_id");
		
		View.confirm('更改报增单会更改此报增单下的所有设备的属性，是否确定更改?',function(button){
			if(button=='yes'){
				//更改报增单
				View.panels.get("addEqDetailPanel").save();
				//更改报增单下所有设备
				var eqChangeDs =View.dataSources.get('ascBjUsmsEqSaveChangeDs');
				var eqChangeRes=new Ab.view.Restriction();
				eqChangeRes.addClause("eq.add_eq_id",addEqId,'=');
				
				var records=eqChangeDs.getRecords(eqChangeRes);
				for(var i=0;i<records.length;i++){
					var record=records[i];
					record.isNew=false;
					record.setValue("eq.brand",brand);
//					record.setValue("eq.eq_std",eqStd);
					record.setValue("eq.eq_type",eqType);
					record.setValue("eq.price",price);
					record.setValue("eq.csi_id",csiId);
					record.setValue("eq.ctry_id",ctryId);
					record.setValue("eq.ctry_name",ctryName);
					record.setValue("eq.danju_id",danjuId);
					record.setValue("eq.date_purchased",datePurchased);
					record.setValue("eq.sci_resh_id",sciResId);
					record.setValue("eq.subject_funds",subjectFund);
					record.setValue("eq.vn_id",vnId);
					
					eqChangeDs.saveRecord(record);
				
				}
				var res=new Ab.view.Restriction();
				res.addClause("eq.add_eq_id",addEqId,'=');
				View.panels.get("EqOfTheAddEqPanel").refresh(res);
				View.alert("更新已完成!");
				
			}
		});
	}
});

function getSumPrice(){
	var detailPanel=View.panels.get("addEqDetailPanel");
	var count=detailPanel.getFieldValue("add_eq.count");
	var price=detailPanel.getFieldValue("add_eq.price");
	
	if(!valueExistsNotEmpty(count)){
		View.alert("数量不存在,请输入数量!");
		return;
	}
	if(!valueExistsNotEmpty(price)){
		View.alert("单价不存在,请输入单价!");
		return;
	}
	
	var countInt=parseInt(count);
	var priceFloat=parseFloat(price);
	
	var sumPrice=(countInt*priceFloat).toFixed(2);
	
	detailPanel.setFieldValue("add_eq.total_price",sumPrice);
}

function getCtryId(fieldName,selectedValue,oldValue){
	if(fieldName=='add_eq.ctry_name'){
		var ctryName=selectedValue;
		View.panels.get("addEqDetailPanel").setFieldValue("add_eq.ctry_name",ctryName);
	}
}