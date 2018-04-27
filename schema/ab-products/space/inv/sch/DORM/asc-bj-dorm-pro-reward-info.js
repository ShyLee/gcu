

var checkoutAwardController=View.createController('checkoutAwardController',{
	
	awardYear:"",
	awardMonth:"",
	showAward:function(){
		var restriction = new Ab.view.Restriction();
		this.awardYear = this.consoleAwardPanel.getFieldValue("sc_stu_property_log.year");
		this.awardMonth = this.consoleAwardPanel.getFieldValue("sc_stu_property_log.month");
		if(this.awardYear!=""){
			if(this.awardMonth!=""){
				restriction.addClause("sc_stu_property_log.yearmonth",this.awardYear+this.awardMonth,"=");
			}else{
				restriction.addClause("sc_stu_property_log.yearmonth",this.awardYear,"LIKE");
			}
		}
		
		if(this.awardYear==""){
			if(this.awardMonth!=""){
				View.alert('请输入查询的年份');
			}
		}
		
		
		this.gridTotalAwardPanel.refresh(restriction);
//		this.consoleAwardPanel.refresh();
	},
	
	//删除
	gridTotalAwardPanel_onDels:function(){
		var rows = this.gridTotalAwardPanel.getPrimaryKeysForSelectedRows();
		for(var i=0;i<rows.length;i++){
			var id=rows[i]["sc_stu_property_log.id"];
			var restriction=new Ab.view.Restriction();
			restriction.addClause("sc_stu_property_log.id",id,"=");
			var record=this.prAawardDs.getRecord(restriction);
			this.prAawardDs.deleteRecord(record);
		}
		
		this.gridTotalAwardPanel.refresh();
	},
	
	//新增
	gridTotalAwardPanel_onAwardId:function(){
		View.openDialog('asc-bj-dorm-pro-reward-info-dialog.axvw', null, true, {
            width: 600,
            height: 400,
            parentController:checkoutAwardController,
            closeButton: false
        });
	}
});