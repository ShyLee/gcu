var controller = View.createController('controller', {
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
		this.eqPanel.refresh(restriction1);
		
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq_attach.dv_id",dv_id,"=");
		restriction.addClause("eq_attach.dp_id",dp_id,"=");
		this.eqAttachPanel.addParameter("dvAndDpEqAttach","eq_attach.dv_id||eq_attach.dp_id in (select dv_id||dp_id from dp where eq_own='1')");
		this.eqAttachPanel.refresh(restriction);
		
	},
	dvPanel_onShowMulEq:function(){
		this.viewEqTabs.selectTab("eqViewTab");
		var rows=this.dvPanel.getSelectedGridRows();
		var dvIds="";
		if(rows.length==0){
			View.alert("请选择需要查询的单位 !");
			return;
		}
		for(var i=0;i<rows.length;i++){
			//IDS
			var record=rows[i].getRecord()
			var dvId=record.getValue('eq.dv_id');
			if(i==0){
				dvIds=dvId;
			}else{
				dvIds=dvIds+"','"+dvId;
			}
		}
		var restriction=new Ab.view.Restriction();
		this.eqPanel.addParameter("dvAndDpEq","eq.dv_id in('"+dvIds+"') and eq.dv_id||eq.dp_id not in (select dv_id||dp_id from dp where eq_own='1')");
		this.eqPanel.refresh(restriction);
		
		var restriction1=new Ab.view.Restriction();
		this.eqAttachPanel.addParameter("dvAndDpEqAttach","eq_attach.dv_id in('"+dvIds+"') and eq_attach.dv_id||eq_attach.dp_id not in (select dv_id||dp_id from dp where eq_own='1')");
		this.eqAttachPanel.refresh(restriction1);
	},
	dvOwnPanel_onShowMulEqAttach:function(){
		this.viewEqTabs.selectTab("eqViewTab");
		var rows=this.dvOwnPanel.getSelectedGridRows();
		var dvIds="";
		var dpIds="";
		if(rows.length==0){
			View.alert("请选择需要查询的单位!");
			return;
		}
		for(var i=0;i<rows.length;i++){
			//IDS
			var record=rows[i].getRecord()
			var dvId=record.getValue('eq_attach.dv_id');
			var dpId=record.getValue('eq_attach.dp_id');
			if(i==0){
				dvIds=dvId;
				dpIds=dpId;
			}else{
				dvIds=dvIds+"','"+dvId;
				dpIds=dpIds+"','"+dpId;
			}
		}
		var restriction=new Ab.view.Restriction();
		this.eqPanel.addParameter("dvAndDpEq","eq.dv_id in('"+dvIds+"') and eq.dp_id in('"+dpIds+"') and eq.dv_id||eq.dp_id in (select dv_id||dp_id from dp where eq_own='1')");
		this.eqPanel.refresh(restriction);
		
		var restriction1=new Ab.view.Restriction();
		this.eqAttachPanel.addParameter("dvAndDpEqAttach","eq_attach.dv_id in('"+dvIds+"') and eq_attach.dp_id in('"+dpIds+"') and eq_attach.dv_id||eq_attach.dp_id in (select dv_id||dp_id from dp where eq_own='1')");
		this.eqAttachPanel.refresh(restriction1);
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