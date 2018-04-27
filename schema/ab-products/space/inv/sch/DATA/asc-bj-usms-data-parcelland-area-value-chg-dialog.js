var abDataParcellandMngtChgController = View.createController('abDataParcellandMngtChgController',{
	openerController:null,
	landCode:"",
	parcellandAddress:"",
	areaTudi:null,
	valueBook:null,
	flag:"",//传递一个标记值，如果是change， dialog为变更框，如果为history，dialog显示变更历史列表
	afterInitialDataFetch: function(){
		this.landCode  = this.view.parameters['land_code'];
		this.parcellandAddress = this.view.parameters['parcelland_address'];
		this.areaTudi = this.view.parameters['area'];
		this.valueBook = this.view.parameters['value'];
		this.flag = this.view.parameters['flag'];
		if(this.flag == "change"){
			this.historyGrid.show(false);
			this.marketForm.show(true);
			this.openerController = this.view.parameters['openerController'];
			this.marketForm.setFieldValue("sc_land_change.land_code",this.landCode);
			this.marketForm.setFieldValue("sc_land_change.parcelland_address",this.parcellandAddress);
			this.marketForm.setFieldValue("sc_land_change.area_book",this.areaTudi);
			this.marketForm.setFieldValue("sc_land_change.value_book",this.valueBook);
			
			this.marketForm.setFieldValue("sc_bl_value_chg.area_market",this.areaTudi);
			this.marketForm.setFieldValue("sc_bl_value_chg.value_market",this.valueBook);
			this.marketForm.setTitle(getMessage('blName') + this.landCode);
			return;
		}
		if(this.flag == "history"){
			this.marketForm.show(false);
			this.historyGrid.show(true);
			var res = new Ab.view.Restriction();
			res.addClause('sc_land_change.land_code',this.landCode,'=');
			this.historyGrid.refresh(res);
			this.historyGrid.setTitle(getMessage('blName') + this.landCode);
			return;
		}
		
	},
	marketForm_onSave: function(){
		if (!this.marketForm.canSave()) {
            return false;
        }else{
        	var area_book=this.marketForm.getFieldValue("sc_land_change.area_book");
			var area_market=this.marketForm.getFieldValue("sc_land_change.area_market");
			var area_add = area_market - area_book;
			
			var value_book=this.marketForm.getFieldValue("sc_land_change.value_book");
			var value_market=this.marketForm.getFieldValue("sc_land_change.value_market");
			var value_add = value_market - value_book;
			if(area_add==0 && value_add==0 ){
				   View.showMessage(getMessage('wrongNoChangeValue') + getMessage('wantCancel'));   
			}else{
				   this.marketForm.setFieldValue('sc_land_change.area_add', area_add);
				   this.marketForm.setFieldValue('sc_land_change.value_add', value_add);
				   this.marketForm.save();
				   this.saveValueIntoBl(area_market,value_market);
				  // View.showMessage(getMessage('success'));   
				   View.closeThisDialog();
				   this.openerController.tsParcellandGrid.refresh(null,false);  
			}
        } 
	},
	saveValueIntoBl: function(area_market,value_market){
		var blDS=View.dataSources.get('parcellandDs');
		var res = new Ab.view.Restriction();
		res.addClause('sc_parcelland.land_code',this.landCode,'=');
		var record=blDS.getRecord(res);
		record.setValue("sc_parcelland.area_tudi",area_market);
		record.setValue("sc_parcelland.value_book",value_market);
		blDS.saveRecord(record);
	}
});