var controller=View.createController('controller',{
	rtrId:"",
	afterInitialDataFetch: function(){
		var user = this.view.user;
		var restriction=new Ab.view.Restriction();
		if(user.role == "UNV EQ ADMIN")
		{
		   restriction.addClause("return_dispose.audit_status","1","=");
		}
		if(user.role == "UNV EQ HEAD")
		{
		   restriction.addClause("return_dispose.audit_status","2","=");
		}
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
	    this.rtrId=rtr_dip_id;
	    
	    var length = this.requestPanel.rows.length;
	    if(length>0){
	    	this.showAddAttach(true);
	    }else{
	    	this.eqAttachPanel.show(false);
	    }
	},
	//驳回申请
	rejectApply:function(){
		var user = this.view.user;
		if(user.role == "UNV EQ ADMIN")
		{
			var res1=new Ab.view.Restriction();
			res1.addClause('return_dispose.rtr_dip_id',this.rtrId,'=');
			this.rejectPanel.refresh(res1,false);	
			this.rejectPanel.setFieldValue("return_dispose.comments","");
			this.rejectPanel.setTitle("驳回意见");
			this.rejectPanel.showInWindow({
			      x:300,
			      y:300,
			      width: 550,
			      height: 200
			     });
		}
		if(user.role == "UNV EQ HEAD")
		{
			var res2=new Ab.view.Restriction();
			res2.addClause('return_dispose.rtr_dip_id',this.rtrId,'=');
			this.headRejectPanel.refresh(res2,false);
			this.headRejectPanel.setFieldValue("return_dispose.eq_head_suggest","");
			this.headRejectPanel.setTitle("驳回意见");
			this.headRejectPanel.showInWindow({
			      x:300,
			      y:300,
			      width: 550,
			      height: 200
			     });
		}
	},
	//打印资产追加单
	printCard:function(){
		var selectedRecord = this.requestPanel.getSelectedRecords();
		if(selectedRecord.length<1){
			  View.showMessage("请选择需要打印的资产追加单");
			  return;
		}	
		for (var i = 0; i < selectedRecord.length; i++) {
		      var row = selectedRecord[i];
		      var eq_id = row.values["eq_change.eq_id"];
		      View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
		            width: 470,
		            height: 200,
		            xmlName: "gcu-eq-add-attach-sheet",
		             parameters: {
		                 'applyRtrId':this.rtrId,
		                 'applyId':eq_id
		             },
		            closeButton: false
		        });
		   }
		
		/*var rows = this.requestPanel.rows;
		for(var i=0;i<rows.length;i++){
			var eq_id = rows[i]["eq_change.eq_id"];
			View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
	            width: 470,
	            height: 200,
	            xmlName: "gcu-eq-add-attach-sheet",
	             parameters: {
	                 'applyRtrId':this.rtrId,
	                 'applyId':eq_id
	             },
	            closeButton: false
	        });
		}*/		
	},
	//打印单张资产追加单
	printOneCard:function(){
		var panel = this.requestPanel;
		var selectedIndex = panel.selectedRowIndex;
		var eq_id = panel.rows[selectedIndex]["eq_change.eq_id"];
		//var Id=eq_id+"-"+this.rtrId;
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
            width: 470,
            height: 200,
            xmlName: "gcu-eq-add-attach-sheet",
             parameters: {
            	 'applyRtrId':this.rtrId,
                 'applyId':eq_id
                 
             },
            closeButton: false
        });
	},
	//显示设备下的追加资产
	showAddAttach:function(autoShow){
		var panel = this.requestPanel;
	      var selectedIndex="-1";
	      if(autoShow){
	       selectedIndex="0";
	      }else{
	       selectedIndex=panel.selectedRowIndex;
	      }
	    var eqId = panel.rows[selectedIndex]["eq_change.eq_id"];
		/*var selectIndex=this.requestPanel.selectedRowIndex;
		var eqId=this.requestPanel.gridRows.get(selectIndex).getRecord().getValue('eq_change.eq_id');*/
		var res=new Ab.view.Restriction();
		res.addClause('eq_attach.eq_id',eqId,'=');
		res.addClause('eq_attach.type','1','=');
		res.addClause('eq_attach.sch_status','7','=');
		res.addClause('eq_attach.rtr_dip_id',this.rtrId,'=');
		this.eqAttachPanel.refresh(res);
		this.eqAttachPanel.setTitle("设备【"+eqId+"】的资产追加列表");
	},
	addSuggest:function(){
		var user = this.view.user;
		if(user.role == "UNV EQ ADMIN")
		{
			var res1=new Ab.view.Restriction();
			res1.addClause('return_dispose.rtr_dip_id',this.rtrId,'=');
			this.addSuggestPanel.refresh(res1,false);	
			this.addSuggestPanel.setFieldValue("return_dispose.comments","");	
			this.addSuggestPanel.showInWindow({
			      x:300,
			      y:300,
			      width: 550,
			      height: 200
			     });
		}
		if(user.role == "UNV EQ HEAD")
		{
			var res2=new Ab.view.Restriction();
			res2.addClause('return_dispose.rtr_dip_id',this.rtrId,'=');
			this.addHeadSuggestPanel.refresh(res2,false);	
			this.addHeadSuggestPanel.setFieldValue("return_dispose.eq_head_suggest","");
			this.addHeadSuggestPanel.showInWindow({
			      x:300,
			      y:300,
			      width: 550,
			      height: 200
			     });
		}
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
	//保存驳回意见
	reject:function(){		
		var user = this.view.user;
		if(user.role == "UNV EQ ADMIN")
		{	
			var message="确定要提交";
			var controller=this;
			View.confirm(message,function(button){
				if(button=="yes"){
					var doc=controller.rejectPanel.getFieldValue('return_dispose.comments');
					if(!valueExistsNotEmpty(doc)){
						View.showMessage("驳回意见不能为空");
					    return;
					}
					try {
				        var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-EqQuantityEditValue-rejectEqAttachValue',controller.rtrId);
				    } 
				    catch (e) {
				        View.alert('工作流失败，请联系管理员');
				        return;
				    } 
				    if(result.code == 'executed'){
				        controller.rejectPanel.setFieldValue('return_dispose.audit_status','3','=');
						controller.rejectPanel.setFieldValue('return_dispose.rtr_dip_id',controller.rtrId,'=');
						View.panels.get('rejectPanel').save();
						View.panels.get('rejectPanel').closeWindow();
						View.panels.get('DisposeListPanel').refresh();
						View.panels.get('requestPanel').show(false);
						View.panels.get('eqAttachPanel').show(false);
						View.alert('驳回成功');
				    }					
				}else{
					
				}
			});
			
		}
		if(user.role == "UNV EQ HEAD")
		{	
			var message="确定要提交";
			var controller=this;
			View.confirm(message,function(button){
				if(button=="yes"){
					var doc=controller.headRejectPanel.getFieldValue('return_dispose.eq_head_suggest');
					if(!valueExistsNotEmpty(doc)){
						View.showMessage("驳回意见不能为空");
					    return;
					}
					try {
				        var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-EqQuantityEditValue-rejectEqAttachValue',controller.rtrId);
				    } 
				    catch (e) {
				        View.alert('工作流失败，请联系管理员');
				        return;
				    } 
				    if(result.code == 'executed'){
				    	controller.headRejectPanel.setFieldValue('return_dispose.audit_status','3','=');
						controller.headRejectPanel.setFieldValue('return_dispose.rtr_dip_id',controller.rtrId,'=');
						View.panels.get('headRejectPanel').save();
						View.panels.get('headRejectPanel').closeWindow();
						View.panels.get('DisposeListPanel').refresh();
						View.panels.get('requestPanel').show(false);
						View.panels.get('eqAttachPanel').show(false);
						View.alert('驳回成功');
				    }	
				}else{
					
				}
			});
			
		}
	},
	//保存审核意见
	saveSuggest:function(){		
		var user = this.view.user;
		if(user.role == "UNV EQ ADMIN")
		{	
			var message="确定要提交";
			var controller=this;
			View.confirm(message,function(button){
				if(button=="yes"){
					var doc=controller.addSuggestPanel.getFieldValue('return_dispose.comments');
					if(!valueExistsNotEmpty(doc)){
						View.showMessage("审核意见不能为空");
					    return;
					}
					controller.addSuggestPanel.setFieldValue('return_dispose.audit_status','2','=');
					controller.addSuggestPanel.setFieldValue('return_dispose.rtr_dip_id',controller.rtrId,'=');
					View.panels.get('addSuggestPanel').save();
					View.panels.get('addSuggestPanel').closeWindow();
					View.panels.get('DisposeListPanel').refresh();
					View.panels.get('requestPanel').show(false);
					View.panels.get('eqAttachPanel').show(false);
					View.alert('审核成功');
				}else{
					
				}
			});
			
		}
		if(user.role == "UNV EQ HEAD")
		{	
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
				         var result = Workflow.callMethod('AbAssetManagement-EquipmentHandler-editEqValue',controller.rtrId);
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
	}	
});

