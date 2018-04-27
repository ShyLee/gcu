var controller=View.createController('controller',{
	rtrId:"",
	afterInitialDataFetch: function(){
		var restriction=new Ab.view.Restriction();
		restriction.addClause("return_dispose.audit_status","2","=");
		this.DisposeListPanel.refresh(restriction);
	},
	//显示追加单的设备
	showEqList:function(){
		var panel = this.DisposeListPanel;
		var selectedIndex = panel.selectedRowIndex;
		var rtr_dip_id = panel.rows[selectedIndex]["return_dispose.rtr_dip_id"];
		var restriction=new Ab.view.Restriction();
	    restriction.addClause('eq_change.rtr_dip_id',rtr_dip_id,'=');
	    this.requestPanel.refresh(restriction);
	    this.eqAttachPanel.show(false);
	    this.requestPanel.show(true);
	    this.rtrId=rtr_dip_id;
	},
	//显示设备下的报减资产
	showAddAttach:function(){
		var selectIndex=this.requestPanel.selectedRowIndex;
		var eqId=this.requestPanel.gridRows.get(selectIndex).getRecord().getValue('eq_change.eq_id');
		var res=new Ab.view.Restriction();
		res.addClause('eq_attach.eq_id',eqId,'=');
		res.addClause('eq_attach.is_dispose','0','=');
		this.eqAttachPanel.refresh(res,false);
		this.eqAttachPanel.setTitle("设备【"+eqId+"】的附件列表");
	},
	addSuggest:function(){
			var res2=new Ab.view.Restriction();
			res2.addClause('return_dispose.rtr_dip_id',this.rtrId,'=');
			this.addHeadSuggestPanel.refresh(res2,false);	
			this.addHeadSuggestPanel.showInWindow({
			      x:300,
			      y:300,
			      width: 550,
			      height: 200
			     });
		
	},
	//查看各部门单位意见
	showCauseValue:function(){
		var disposeForm = View.panels.get("causeDisposePanel");
		var panel = this.DisposeListPanel;
		var selectedIndex = panel.selectedRowIndex;	
		var rtr_dip_id = panel.rows[selectedIndex]["return_dispose.rtr_dip_id"];

		var restriction=new Ab.view.Restriction();
		restriction.addClause('return_dispose.rtr_dip_id',rtr_dip_id,'=');
		disposeForm.refresh(restriction);
		disposeForm.showInWindow({
			   x:300,
			   y:100,
			   width: 650,
			   height: 700
		});
	},
	//驳回申请
	rejectApply:function(){
			var res1=new Ab.view.Restriction();
			res1.addClause('return_dispose.rtr_dip_id',this.rtrId,'=');
			this.rejectPanel.refresh(res1,false);	
			this.rejectPanel.setFieldValue("return_dispose.eq_head_suggest","");
			this.rejectPanel.setTitle("驳回意见");
			this.rejectPanel.showInWindow({
			      x:300,
			      y:300,
			      width: 550,
			      height: 200
			     });
		
		
	},
	//保存驳回意见
	reject:function(){		
	
			var message="确定要提交";
			var controller=this;
			View.confirm(message,function(button){
				if(button=="yes"){
					var doc=controller.rejectPanel.getFieldValue('return_dispose.eq_head_suggest');
					if(!valueExistsNotEmpty(doc)){
						View.showMessage("驳回意见不能为空");
					    return;
					}
					controller.rejectPanel.setFieldValue('return_dispose.audit_status','3','=');
					controller.rejectPanel.setFieldValue('return_dispose.rtr_dip_id',controller.rtrId,'=');
					View.panels.get('rejectPanel').save();
					View.panels.get('rejectPanel').closeWindow();
					View.panels.get('DisposeListPanel').refresh();
					View.panels.get('requestPanel').show(false);
					View.panels.get('eqAttachPanel').show(false);
					View.alert('驳回成功');
				}else{
					
				}
			});
			
		
	},
	//显示设备卡片
	showEqCard:function(){
		var panel = this.requestPanel;
		var selectedIndex = panel.selectedRowIndex;
		var eq_id = panel.rows[selectedIndex]["eq_change.eq_id"];
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
	    	width: 600,
	    	height: 400,
	    	eq_id: eq_id
	    });
	},
	//保存审核意见
	saveSuggest:function(){		
			var message="确定要提交";
			var controller=this;
			View.confirm(message,function(button){
				if(button=="yes"){
					var doc=controller.addHeadSuggestPanel.getFieldValue('return_dispose.eq_head_suggest');
					if(!valueExistsNotEmpty(doc)){
						View.showMessage("审核意见不能为空");
					    return;
					}
					controller.addHeadSuggestPanel.setFieldValue('return_dispose.audit_status','4','=');
					controller.addHeadSuggestPanel.setFieldValue('return_dispose.rtr_dip_id',controller.rtrId,'=');
					View.panels.get('addHeadSuggestPanel').save();
					View.panels.get('addHeadSuggestPanel').closeWindow();
					View.panels.get('DisposeListPanel').refresh();
					View.panels.get('requestPanel').show(false);
					View.panels.get('eqAttachPanel').show(false);
					try {
				         var result = Workflow.callMethod('AbAssetManagement-EquipmentHandler-eqDispose',controller.rtrId);
				        } 
				        catch (e) {
				        	View.alert('工作流失败，请联系管理员');
				            return;
				        } 
					View.alert('审核成功');
				}else{
					
				}
			});
			
		
	}	
});

