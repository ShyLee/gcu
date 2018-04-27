var controller=View.createController('adjustSelectController',{
	tabs: null,
	rtrId:"",
	eqid_new:"",
	afterViewLoad: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
	},
	afterInitialDataFetch: function(){
		this.onStart(true);
	},
	helpPanel_afterRefresh:function(){
		this.onStart(true);
	},
	onStart:function(autoShow){
		
		this.tabs=View.getControlsByType(parent, 'tabs')[0];
		this.rtrId=this.tabs.rtrDipId;
		
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq_change.rtr_dip_id",this.rtrId,"=");
		this.requestPanel.refresh(restriction);
		
		this.helpPanel.show(false);
		
		var panel = this.requestPanel;
	    var selectedIndex="-1";
	    if(autoShow){
	       selectedIndex="0";
	    }else{
	       selectedIndex=panel.selectedRowIndex;
	    }
	    var eq_id = panel.rows[selectedIndex]["eq_change.eq_id"];		
		var res1=new Ab.view.Restriction();
		res1.addClause("eq_attach.eq_id",eq_id,"=");
		res1.addClause("eq_attach.status","0","=");
		this.eqAttachPanel.refresh(res1);
		if(eq_id==null){
			this.eqAttachPanel.setTitle("固定资产列表");
		}else{
			this.eqAttachPanel.setTitle("设备【"+eq_id+"】的附件列表");
		}
	},
	//删除已经添加到eq_change表中的设备
	requestPanel_btnDelete_onClick: function(row){
		var message="确定要删除";
		var controller=this;
		View.confirm(message,function(button){
			if(button=="yes"){
				var selectRecord=row.getRecord();
		    	//删除当前行的eq_change表的数据
				View.dataSources.get('eq_change_ds').deleteRecord(selectRecord);
				controller.requestPanel.refresh();
				controller.eqAttachPanel.refresh();		
				controller.eqAttachPanel.setTitle("设备附件列表");		
			}else{
				
			}
		});
		controller.requestPanel.refresh();
		controller.eqAttachPanel.refresh();
	},
	showAddAttach:function(){
		
		var selectIndex=this.requestPanel.selectedRowIndex;
		var eqId=this.requestPanel.gridRows.get(selectIndex).getRecord().getValue('eq_change.eq_id');
		var res=new Ab.view.Restriction();
		res.addClause('eq_attach.eq_id',eqId,'=');
		res.addClause('eq_attach.status','0','=');
		this.eqAttachPanel.refresh(res,false);
		this.eqAttachPanel.setTitle("设备【"+eqId+"】的附件列表");
		this.eqid_new=eqId;
	},
	//返回上一个tab
	goBack: function(){
		var nextTabName ='selectTab';
	    var nextTab = this.tabs.findTab(nextTabName);
	    this.tabs.findTab("requestTab").show(false);
	    nextTab.loadView();
	    this.tabs.selectTab(nextTabName);
	},
	//提交审核
	requestPanel_onSubmit:function(){
		var dsEqChange = View.dataSources.get("eq_change_ds");
		var restraction=new Ab.view.Restriction();
		restraction.addClause('eq_change.rtr_dip_id',this.rtrId,'=');
	    var Records=dsEqChange.getRecords(restraction);
	    if(Records.length<1){
		      View.showMessage("当前报减设备为空，无法报减");
		      return;
		}
	    
		var message="确定要提交";
		var controller=this;
		View.confirm(message,function(button){
			if(button=="yes"){
				var dsReturn = View.dataSources.get("ascBjUsmsEqReturnSch");
			    var res=new Ab.view.Restriction();
				res.addClause('return_dispose.rtr_dip_id',controller.rtrId,'=');
			    var Record=dsReturn.getRecord(res);
			    //0;未提交;1;已提交;2;审核已通过;3;审核未通过;4;处理完成;5;已公示
			    Record.setValue("return_dispose.audit_status", "2");
			    dsReturn.saveRecord(Record);
			    //返回第一个tab
			    var nextTabName ='selectTab';
			    var nextTab = controller.tabs.findTab(nextTabName);
			    nextTab.loadView();
			    controller.tabs.selectTab(nextTabName);
			}else{
				
			}
		});		
	},
	//改变附件的状态，不报减
	eqAttachPanel_onBtnEditValue:function(){		
		var message="确定转换报减状态";
		var controller=this;
		View.confirm(message,function(button){
			if(button=="yes"){	
				var dsEqAttach = View.dataSources.get("eq_attach_ds");		 
				var panel = controller.eqAttachPanel;
				var selectedIndex = panel.selectedRowIndex;
				var eq_attach_id = panel.rows[selectedIndex]["eq_attach.eq_attach_id"];
				var is_dispose = panel.rows[selectedIndex]["eq_attach.is_dispose"];
				 var restraction=new Ab.view.Restriction();
				 restraction.addClause('eq_attach.eq_attach_id',eq_attach_id,'=');
				 var attachRecord=dsEqAttach.getRecord(restraction);
				 if(is_dispose=="是"){
					 attachRecord.setValue("eq_attach.is_dispose", "1");
				 }else if(is_dispose=="否"){
					 attachRecord.setValue("eq_attach.is_dispose", "0");
				 }
				 
				 dsEqAttach.saveRecord(attachRecord);
				 controller.eqAttachPanel.refresh();
			     View.alert("修改成功");
			}else{
				
			}
		});
		
		
		 
	}, 
	eqAttachPanel_afterRefresh:function(){
		this.eqAttachPanel.setTitle("设备【"+this.eqid_new+"】的附件列表");
	}
});

