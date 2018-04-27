var controller=View.createController('viewEqForm',{
	dvId: "",
	dvName:"",
	dpId: "",
	afterInitialDataFetch: function(){
		this.searchPanel.clear();
		var res=new Ab.view.Restriction();
		//后勤处06
		res.addClause('eq.dv_id','06','=');
		this.dvId='06';
		var roleName=View.user.role;
    	if(roleName=="UNV DV EQ ST ADMIN"){
    		this.dvPanel.show(false);
    		this.dvPanel2.show(true);
    	}else{
    		this.dvPanel.show(true);
    		this.dvPanel2.show(false);
    	}
		this.eqListPanel.addParameter("dvAndDp","eq.dv_id||eq.dp_id not in (select dv_id||dp_id from dp where eq_own='1')");
		this.eqListPanel.refresh(res);
//		this.eqListPanel.show(false);
//		this.eqListExportPanel.addParameter("dvAndDpExport","eq.dv_id||eq.dp_id not in (select dv_id||dp_id from dp where eq_own='1')");
//		this.eqListExportPanel.refresh(res);
//		this.eqListExportPanel.show(false);
		this.eqListPanel.setTitle('设备列表—后勤处');
//		this.eqListExportPanel.setTitle('设备列表—后勤处');
	},
	/**
     * 查看设备附件列表
     */
    eqListPanel_onViewAttach:function(){
    	var selectIndex=this.eqListPanel.selectedRowIndex;
		var eqId=this.eqListPanel.gridRows.get(selectIndex).getRecord().getValue('eq.eq_id');
        
		View.openDialog("asc-bj-usms-eq-attach-card.axvw",null,false,{
			x:150,
			y:200,
			width:900,
			height:400,
			eqId:eqId
		});
    },
	dvPanel_onBtnViewAll: function(){
		this.eqListPanel.restriction=null;
		this.dvId="";
		this.dpId="";
		this.eqListPanel.addParameter("dvAndDp","1=1");
		this.eqListPanel.refresh([]);
//		this.eqListPanel.show(false);
//		this.eqListExportPanel.addParameter("dvAndDpExport","1=1");
//		this.eqListExportPanel.refresh([]);
//		this.eqListExportPanel.show(false);
		this.searchPanel.clear();      
		this.eqListPanel.setTitle("设备列表--全校设备资产");
//		this.eqListExportPanel.setTitle("设备列表--全校设备资产");
	},
	
	dvPanel2_onBtnViewAll: function(){
		this.eqListPanel.restriction=null;
		this.dvId="";
		this.dpId="";
		this.eqListPanel.addParameter("dvAndDp","1=1");
		var roleName=View.user.role;
    	if(roleName=="UNV DV EQ ST ADMIN"){
    		this.eqListPanel.applyVpaRestrictions=false;
    	}
		this.eqListPanel.refresh([]);
//		this.eqListPanel.show(false);
//		this.eqListExportPanel.addParameter("dvAndDpExport","1=1");
//		this.eqListExportPanel.refresh([]);
//		this.eqListExportPanel.show(false);
		this.searchPanel.clear();      
		this.eqListPanel.setTitle("设备列表--全校设备资产");
//		this.eqListExportPanel.setTitle("设备列表--全校设备资产");
	},
	onClickDvNode: function(){
		var curTreeNode=View.panels.get('dvPanel').lastNodeClicked;
		this.dvId=curTreeNode.data['dv.dv_id'];
		var dvName=curTreeNode.data['dv.dv_name'];
		var eqRes=new Ab.view.Restriction();
		eqRes.addClause('eq.dv_id',this.dvId,'=');
		this.eqListPanel.addParameter("dvAndDp","eq.dv_id||eq.dp_id not in (select dv_id||dp_id from dp where eq_own='1')");
		this.eqListPanel.refresh(eqRes);
//		this.eqListPanel.show(false);
//		this.eqListExportPanel.addParameter("dvAndDpExport","eq.dv_id||eq.dp_id not in (select dv_id||dp_id from dp where eq_own='1')");
//		this.eqListExportPanel.refresh(eqRes);
//		this.eqListExportPanel.show(false);
		this.eqListPanel.setTitle("设备列表--"+dvName);
//		this.eqListExportPanel.setTitle("设备列表--"+dvName);
	},
	onClickDpNode: function(){
		var curTreeNode=View.panels.get('dvPanel').lastNodeClicked;
		this.dvId=curTreeNode.data['dp.dv_id'];
		this.dpId=curTreeNode.data['dp.dp_id'];
		var dpName=curTreeNode.data['dp.dp_name'];
		
		var dsDv = View.dataSources.get("ascBjUsmsDvDs");
		var res1= new Ab.view.Restriction();
		res1.addClause('dv.dv_id',this.dvId,'=');
	    var dvRecord=dsDv.getRecord(res1);
		var eqDvName = dvRecord.getValue("dv.dv_name");
		
		var eqRes=new Ab.view.Restriction();
		eqRes.addClause('eq.dv_id',this.dvId,'=');
		eqRes.addClause('eq.dp_id',this.dpId,'=');
		this.eqListPanel.addParameter("dvAndDp","eq.dv_id||eq.dp_id in (select dv_id||dp_id from dp where eq_own='1')");
		this.eqListPanel.refresh(eqRes);
//		this.eqListPanel.show(false);
//		this.eqListExportPanel.addParameter("dvAndDpExport","eq.dv_id||eq.dp_id in (select dv_id||dp_id from dp where eq_own='1')");
//		this.eqListExportPanel.refresh(eqRes);
//		this.eqListExportPanel.show(false);
		this.eqListPanel.setTitle("设备列表—"+eqDvName+"—"+dpName);
//		this.eqListExportPanel.setTitle("设备列表—"+eqDvName+"—"+dpName);
	},
	onClickDvNode2: function(){
		var roleName=View.user.role;
    	if(roleName=="UNV DV EQ ST ADMIN"){
    		this.eqListPanel.applyVpaRestrictions=false;
    	}
		var curTreeNode=View.panels.get('dvPanel2').lastNodeClicked;
		this.dvId=curTreeNode.data['dv.dv_id'];
		var dvName=curTreeNode.data['dv.dv_name'];
		var eqRes=new Ab.view.Restriction();
		eqRes.addClause('eq.dv_id',this.dvId,'=');
		this.eqListPanel.addParameter("dvAndDp","eq.dv_id||eq.dp_id not in (select dv_id||dp_id from dp where eq_own='1')");
		this.eqListPanel.refresh(eqRes);
//		this.eqListPanel.show(false);
//		this.eqListExportPanel.addParameter("dvAndDpExport","eq.dv_id||eq.dp_id not in (select dv_id||dp_id from dp where eq_own='1')");
//		this.eqListExportPanel.refresh(eqRes);
//		this.eqListExportPanel.show(false);
		this.eqListPanel.setTitle("设备列表--"+dvName);
//		this.eqListExportPanel.setTitle("设备列表--"+dvName);
	},
	onClickDpNode2: function(){
		var roleName=View.user.role;
    	if(roleName=="UNV DV EQ ST ADMIN"){
    		this.eqListPanel.applyVpaRestrictions=false;
    	}
		var curTreeNode=View.panels.get('dvPanel2').lastNodeClicked;
		this.dvId=curTreeNode.data['dp.dv_id'];
		this.dpId=curTreeNode.data['dp.dp_id'];
		var dpName=curTreeNode.data['dp.dp_name'];
		
		var dsDv = View.dataSources.get("ascBjUsmsDvDs2");
		var res1= new Ab.view.Restriction();
		res1.addClause('dv.dv_id',this.dvId,'=');
	    var dvRecord=dsDv.getRecord(res1);
		var eqDvName = dvRecord.getValue("dv.dv_name");
		
		var eqRes=new Ab.view.Restriction();
		eqRes.addClause('eq.dv_id',this.dvId,'=');
		eqRes.addClause('eq.dp_id',this.dpId,'=');
		this.eqListPanel.addParameter("dvAndDp","eq.dv_id||eq.dp_id in (select dv_id||dp_id from dp where eq_own='1')");
		this.eqListPanel.refresh(eqRes);
//		this.eqListPanel.show(false);
//		this.eqListExportPanel.addParameter("dvAndDpExport","eq.dv_id||eq.dp_id in (select dv_id||dp_id from dp where eq_own='1')");
//		this.eqListExportPanel.refresh(eqRes);
//		this.eqListExportPanel.show(false);
		this.eqListPanel.setTitle("设备列表—"+eqDvName+"—"+dpName);
//		this.eqListExportPanel.setTitle("设备列表—"+eqDvName+"—"+dpName);
	},
	searchPanel_onBtnDo:function(){
		try {
	         var result = Workflow.callMethod('AbAssetManagement-EquipmentHandler-test');
	        } 
	        catch (e) {
	        	View.alert('工作流失败，请联系管理员');
	            return;
	        } 
	},
	searchPanel_onBtnFilter: function(){
		var eqListRes=this.addRestriction();
		this.eqListPanel.refresh(eqListRes);
		//this.eqListPanel.show(false);
//		this.eqListExportPanel.refresh(eqListRes);
//		this.eqListExportPanel.show(false);
		
		this.eqListPanel.setTitle(this.addPanelTitle());
	},
	searchPanel_onSelectDp:function(){
    	var dvId=this.searchPanel.getFieldValue("eq.dv_id");
    	if(valueExistsNotEmpty(dvId)){
    		var restriction = new Ab.view.Restriction();
        	restriction.addClause("dv.dv_id" , dvId, "=");
        	this.dpPanel.refresh(restriction);
        	
        	this.dpPanel.showInWindow({
        		x:250,
        		y:200,
                width: 600,
                height: 400
            });
		}else{
			View.showMessage("请输入使用单位");
			return;
		}	
    },
    searchPanel_onClearDp:function(){
    	this.searchPanel.setFieldValue("eq.dp_id","");
    	this.searchPanel.setFieldValue("eq.option3","");
    },
    dpPanel_onSure:function(){
    	var rows = this.dpPanel.getSelectedRows();
		if(rows.length == 0){
			View.showMessage("请选择部门科室！");
			return;
		}
		var temp=this.searchPanel.getFieldValue("eq.dp_id");
		var option3=this.searchPanel.getFieldValue("eq.option3");
		
		for(var i = 0; i < rows.length; i++){
			//dv_name的集合
			var dpName=rows[i]['dp.dp_name'];
			if(option3==""){
				option3=dpName;
			}else{
				option3=option3+","+dpName;
			}
		   //dp_id的集合
		   var dpId=rows[i]['dp.dp_id'];
			if(temp==""){
				temp=dpId;
			}else{
				temp=temp+","+dpId;
			}
		}
		this.searchPanel.setFieldValue("eq.dp_id",temp);
		this.searchPanel.setFieldValue("eq.option3",option3);
		this.dpPanel.closeWindow();
    },
	searchPanel_onBtnCancel: function(){
		this.searchPanel.clear();
		this.eqListPanel.refresh([]);
//		this.eqListPanel.show(false);
//		this.eqListExportPanel.refresh([]);
//		this.eqListExportPanel.show(false);
	},
	
	addRestriction: function(){
		var dateFrom=this.searchPanel.getFieldValue('eq.datePurchasedFrom');
		var dateTo=this.searchPanel.getFieldValue('eq.datePurchasedTo');
		var eqName=this.searchPanel.getFieldValue('eq.eq_name');
		var priceFrom=this.searchPanel.getFieldValue('eq.priceFrom');
		var priceTo=this.searchPanel.getFieldValue('eq.priceTo');
		var csiId=this.searchPanel.getFieldValue('eq.csi_id');
		var eqIdFrom=this.searchPanel.getFieldValue("eq.eqIdFrom");
		var eqIdTo=this.searchPanel.getFieldValue("eq.eqIdTo");
		var is_label=this.searchPanel.getFieldValue("eq.is_label");
		
		var eqListRes=new Ab.view.Restriction();
		if(valueExistsNotEmpty(dateFrom)){
			eqListRes.addClause('eq.date_in_service',dateFrom,'&gt;=');
		}
		if(valueExistsNotEmpty(dateTo)){
			eqListRes.addClause('eq.date_in_service',dateTo,'&lt;=');
		}
		if(valueExistsNotEmpty(eqName)){
			eqListRes.addClause('eq.eq_name','%'+eqName+'%','LIKE');
		}
		if(valueExistsNotEmpty(priceFrom)){
			var priceFromInt=parseInt(priceFrom);
			eqListRes.addClause('eq.price',priceFromInt,'&gt;=');
		}
		if(valueExistsNotEmpty(priceTo)){
			var priceToInt=parseInt(priceTo);
			eqListRes.addClause('eq.price',priceToInt,'&lt;=');
		}
		if(valueExistsNotEmpty(this.dvId)){
			eqListRes.addClause('eq.dv_id',this.dvId,'=');
		}
		if(valueExistsNotEmpty(this.dpId)){
			eqListRes.addClause('eq.dp_id',this.dpId,'=');
		}
		if(valueExistsNotEmpty(eqIdFrom)){
			eqListRes.addClause('eq.eq_id',eqIdFrom,'&gt;=');
		}
		if(valueExistsNotEmpty(eqIdTo)){
			eqListRes.addClause('eq.eq_id',eqIdTo,'&lt;=');
		}
		if(valueExistsNotEmpty(csiId)){
			for(var i=0;i<5;i++){
				csiId = csiId.replace(/(00)\b/gi,"");
			}
			eqListRes.addClause('eq.csi_id','%'+csiId+'%','LIKE');
		}
		if(valueExistsNotEmpty(is_label)){
			eqListRes.addClause('eq.is_label',is_label,'=');
		}
		return eqListRes;
	},
	
	addPanelTitle: function(){
		var title="设备列表:";
		var isEmpty=true;
		if(valueExistsNotEmpty(this.dvId)){
			title=title+this.dvName;
			isEmpty=false;
		}
		if(valueExistsNotEmpty(this.dpId)){
			title=title+'—'+this.dpName;
			isEmpty=false;
		}
		if(isEmpty){
			title=title+"全校";
		}
		return title;
	},
	
	eqListPanel_onBtnDBF: function(){
		 try {
		        result = Workflow.callMethod('AbAssetManagement-ExportDBFService-write');
		        if (result.code == 'executed') {
			        View.showMessage(getMessage("okMessage"));
			    }
			    else {
			        Workflow.handleError(result);
			    }
		    } 
		    catch (e) {
		        Workflow.handleError(e);
		    }
	}
})