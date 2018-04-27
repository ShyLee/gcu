var abEqAttachcontroller=View.createController('abEqAttachcontroller',{
	rtrId:"",
	afterInitialDataFetch: function(){
		var restriction=new Ab.view.Restriction();
		restriction.addClause("return_dispose.audit_status","1","=");
		this.DisposeListPanel.refresh(restriction);
	},
	//显示追加单的设备
	showEqList:function(){
		var panel = this.DisposeListPanel;
		var selectedIndex = panel.selectedRowIndex;
		var rtr_dip_id = panel.rows[selectedIndex]["return_dispose.rtr_dip_id"];
		var restriction=new Ab.view.Restriction();
	    restriction.addClause('eq_attach_change.rtr_dip_id',rtr_dip_id,'=');
	    this.requestPanel.refresh(restriction);
	    this.requestPanel.show(true);
	    this.rtrId=rtr_dip_id;
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
	//显示设备卡片
	showEqCard:function(){
		var panel = this.requestPanel;
		var selectedIndex = panel.selectedRowIndex;
		var eq_id = panel.rows[selectedIndex]["eq_attach_change.eq_id"];
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
	    	width: 600,
	    	height: 400,
	    	eq_id: eq_id
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
					View.alert('驳回成功');
				}else{
					
				}
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
			   height: 790
		});
	},
	//保存审核意见
	saveSuggest:function(){		
		var doc=this.addHeadSuggestPanel.getFieldValue('return_dispose.eq_head_suggest');
		if(!valueExistsNotEmpty(doc)){
			View.showMessage("审核意见不能为空");
		    return;
		}
			var message="确定要提交";
			var controller=this;
			View.confirm(message,function(button){
				if(button=="yes"){
					
					var grid = View.panels.get("requestPanel");
					try {
						for (var i = 0; i < grid.gridRows.length; i++) {
							var dsEqAttach = View.dataSources.get("eq_attach_ds");
							var row = grid.gridRows.items[i];
							var eq_attach_id = row.getFieldValue("eq_attach_change.eq_attach_id");
							
							 var restriction=new Ab.view.Restriction();
						     restriction.addClause('eq_attach.eq_attach_id',eq_attach_id,'=');
						     var records=dsEqAttach.getRecord(restriction);
						     records.setValue("eq_attach.sch_status", "6");
						     dsEqAttach.saveRecord(records);
								controller.addHeadSuggestPanel.setFieldValue('return_dispose.audit_status','4','=');
								controller.addHeadSuggestPanel.setFieldValue('return_dispose.rtr_dip_id',controller.rtrId,'=');
								View.panels.get('addHeadSuggestPanel').save();
								View.panels.get('addHeadSuggestPanel').closeWindow();
								View.panels.get('DisposeListPanel').refresh();
								View.panels.get('requestPanel').show(false);
						}
						grid.show(false);
						View.panels.get("DisposeListPanel").refresh();
						View.alert("审核成功");
					} 
					catch (e) {
						View.closeProgressBar();
						View.alert("审核失败，请联系管理员");
						return;
					}
					
					
				}else{
					
				}
			});
			
		
	}	
});

