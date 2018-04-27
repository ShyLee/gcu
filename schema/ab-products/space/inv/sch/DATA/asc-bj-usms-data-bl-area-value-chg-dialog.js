var abDataBlMngtChgController = View.createController('abDataBlMngtChgController',{
	openerController:null,
	blId:"",
	blName:"",
	area:"",
	value:"",
	flag:"",//传递一个标记值，如果是change， dialog为变更框，如果为history，dialog显示变更历史列表
	afterInitialDataFetch: function(){
		this.blId  = this.view.parameters['bl_id'];
		this.blName = this.view.parameters['bl_name'];
		this.area = this.view.parameters['area'];
		this.value = this.view.parameters['value'];
		this.flag = this.view.parameters['flag'];
		if(this.flag == "change"){
			this.historyGrid.show(false);
			this.accordDateConsole.show(false);
			this.marketForm.show(true);
			this.openerController = this.view.parameters['openerController'];
			this.marketForm.setFieldValue("sc_bl_value_chg.bl_id",this.blId);
			this.marketForm.setFieldValue("sc_bl_value_chg.name",this.blName);
			this.marketForm.setFieldValue("sc_bl_value_chg.area_book",this.area);
			this.marketForm.setFieldValue("sc_bl_value_chg.value_book",this.value);
			this.marketForm.setFieldValue("sc_bl_value_chg.area_market",this.area);
			this.marketForm.setFieldValue("sc_bl_value_chg.value_market",this.value);
//			this.marketForm.setFieldValue("sc_bl_value_chg.area_market",-1);
//			this.marketForm.setFieldValue("sc_bl_value_chg.value_market",-1);
			this.marketForm.setTitle(getMessage('blName') + this.blName);
			return;
		}
		if(this.flag == "history"){
			this.marketForm.show(false);
			this.accordDateConsole.show(false);
			this.historyGrid.show(true);
			var res = new Ab.view.Restriction();
			res.addClause('sc_bl_value_chg.bl_id',this.blId,'=');
			this.historyGrid.refresh(res);
			this.historyGrid.setTitle(getMessage('blName') + this.blName);
			return;
		}
		if(this.flag == "building"){
			this.marketForm.show(false);
			this.accordDateConsole.show(true);
			this.historyGrid.show(true);
			this.historyGrid.refresh();
			this.historyGrid.setTitle("全部建筑物变更历史");
			return;
		}
		
	},
	accordDateConsole_onShow:function(){
    	var from_date = this.accordDateConsole.getFieldValue('date_from');
        var to_date = this.accordDateConsole.getFieldValue('date_to');
        if(Date.parse(from_date.replace(/-/g,"/"))>Date.parse(to_date.replace(/-/g,"/"))){
      	  View.showMessage("截止时间不能小于起始时间！");
      	  return false;
        }

    },
	marketForm_onSave: function(){
		if (!this.marketForm.canSave()) {
            return false;
        }else{
        	
    					
        	var area_book=this.marketForm.getFieldValue("sc_bl_value_chg.area_book");
			var area_market=this.marketForm.getFieldValue("sc_bl_value_chg.area_market");
			var area_add = area_market - area_book;
			var value_book=this.marketForm.getFieldValue("sc_bl_value_chg.value_book");
			var value_market=this.marketForm.getFieldValue("sc_bl_value_chg.value_market");
			var value_add = value_market - value_book;
			if(area_add==0 && value_add==0 ){
				   View.showMessage(getMessage('wrongNoChangeValue') + getMessage('wantCancel'));   
			}else{
				   this.marketForm.setFieldValue('sc_bl_value_chg.area_add', area_add);
				   this.marketForm.setFieldValue('sc_bl_value_chg.value_add', value_add);
				   var controller = this;
				   View.confirm("确定保存信息?", function(button){
		    			if (button == 'yes')
		    			{
		    				try {
		    					controller.marketForm.save();
		    					controller.saveValueIntoBl(area_market,value_market,value_add);
		    					controller.openerController.tsBlGrid.refresh(null,false);
		    					View.closeThisDialog();
					}catch(e){
		            	return;
		            }
			}
		});
			}
        } 
	},
	saveValueIntoBl: function(area_market,value_market,value_add){
		var blDS=View.dataSources.get('blDS');
		var res = new Ab.view.Restriction();
		res.addClause('bl.bl_id',this.blId,'=');
		var record=blDS.getRecord(res);
		record.setValue("bl.area_building_manual",area_market);
		record.setValue("bl.value_net",value_market);
		//也要给净值+维修价值
		var valueBook=parseFloat(record.getValue("bl.value_book"))+parseFloat(value_add);
		record.setValue("bl.value_book",valueBook);
		
		blDS.saveRecord(record);
	}
});