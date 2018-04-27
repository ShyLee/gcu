var controller = View.createController('controller', {
	restration:"1=1",
	dvPanel_dv_id_onClick: function(row){
		var dv_id = row.getFieldValue("eq.dv_id");
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq.dv_id",dv_id,"=");
		this.eqPanel.refresh(restriction);
	},
	/**
	 * 点击单位 去掉独立的实验中心
	 * 
	 */
	clickDvName: function(){
		this.viewEqTabs.selectTab("eqViewTab");
		var selectedIndex = this.dvPanel.selectedRowIndex;
		var dv_id = this.dvPanel.rows[selectedIndex]["eq.dv_id"];
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq.dv_id",dv_id,"=");
		this.eqPanel.addParameter("dvAndDpEq","eq.dv_id||eq.dp_id not in (select dv_id||dp_id from dp where eq_own='1')");
		this.eqPanel.refresh(restriction);
		
		var restriction1=new Ab.view.Restriction();
		restriction1.addClause("eq_attach.dv_id",dv_id,"=");
		this.eqAttachPanel.addParameter("dvAndDpEqAttach","eq_attach.dv_id||eq_attach.dp_id not in (select dv_id||dp_id from dp where eq_own='1')");
		this.eqAttachPanel.refresh(restriction1);
	},
	/**
	 * 点击单位 只包含实验中心
	 * 
	 */
	clickAttachDvName: function(){
		this.viewEqTabs.selectTab("eqViewTab");
		var selectedIndex = this.dvOwnPanel.selectedRowIndex;
		var dv_id = this.dvOwnPanel.rows[selectedIndex]["eq_attach.dv_id"];
		var dp_id = this.dvOwnPanel.rows[selectedIndex]["eq_attach.dp_id"];
		
		var restriction1=new Ab.view.Restriction();
		restriction1.addClause("eq.dv_id",dv_id,"=");
		restriction1.addClause("eq.dp_id",dp_id,"=");
		
		this.eqPanel.addParameter("dvAndDpEq","eq.dv_id||eq.dp_id in (select dv_id||dp_id from dp where eq_own='1')");
		this.eqPanel.addParameter("requestDate",this.restration);
		this.eqPanel.refresh(restriction1);
		
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq_attach.dv_id",dv_id,"=");
		restriction.addClause("eq_attach.dp_id",dp_id,"=");
		this.eqAttachPanel.addParameter("dvAndDpEqAttach","eq_attach.dv_id||eq_attach.dp_id in (select dv_id||dp_id from dp where eq_own='1')");
		this.eqAttachPanel.addParameter("requestDate",this.restration);
		this.eqAttachPanel.refresh(restriction);
		
	},
	requestConsole_onShow:function(){
		var dateFrom=this.requestConsole.getFieldValue('return_dispose.datePurchasedFrom');
		var dateTo=this.requestConsole.getFieldValue('return_dispose.datePurchasedTo');
		var restration="1=1";
		if(valueExistsNotEmpty(dateFrom)){
			restration="to_char(return_dispose.date_request,'YYYY-MM-dd')>='"+dateFrom+"'";
		}
		if(valueExistsNotEmpty(dateTo)){
			restration="to_char(return_dispose.date_request,'YYYY-MM-dd')<='"+dateTo+"'";
		}
		if(dateFrom!="" && dateTo!=""){
			restration="to_char(return_dispose.date_request,'YYYY-MM-dd')>='"+dateFrom+"' and to_char(return_dispose.date_request,'YYYY-MM-dd')<='"+dateTo+"'";
		}
		this.restration=restration;
		this.dvPanel.addParameter("requestDate",restration);
		this.dvPanel.refresh();
		
		this.dvOwnPanel.addParameter("requestDate",restration);
		this.dvOwnPanel.refresh();
		
	},
	requestConsole_onCancel: function(){
		this.requestConsole.clear();
		var restration="1=1";
		this.restration=restration;
		this.dvPanel.addParameter("requestDate",restration);
		this.dvPanel.refresh();
		
		this.dvOwnPanel.addParameter("requestDate",restration);
		this.dvOwnPanel.refresh();
	},
	/**
	 * 查看设备附件列表
	 */
	eqPanel_onViewAttach:function(){
		var selectIndex=this.eqPanel.selectedRowIndex;
		var addEqId=this.eqPanel.gridRows.get(selectIndex).getRecord().getValue('eq.add_eq_id');
		var eqId=this.eqPanel.gridRows.get(selectIndex).getRecord().getValue('eq.eq_id');
    
		View.openDialog("asc-bj-usms-eq-attach-card.axvw",null,false,{
			x:150,
			y:200,
			width:900,
			height:400,
			addEqId:addEqId,
			eqId:eqId
		});
	}
});