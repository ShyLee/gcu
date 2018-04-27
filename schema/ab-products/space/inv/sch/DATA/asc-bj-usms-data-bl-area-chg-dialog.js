
var abScDefUnit = View.createController('abScDefUnit', {
   blId:"",
   blName:"",
   areamarket:"",
   afterInitialDataFetch:function(){
	  this.showrefresh();
   },
   
   showrefresh: function(){
	   this.areamarketForm.refresh(null,true);
	   this.blId = this.view.parameters['blId'];
	   this.blName = this.view.parameters['blName'];
	   this.areamarket = this.view.parameters['areamarket'];
	   setPanelTitle('areamarketForm', "建筑物："+this.blName);
	   this.areamarketForm.setFieldValue("sc_bl_value_chg.bl_id",this.blId);
	   this.areamarketForm.setFieldValue("sc_bl_value_chg.name",this.blName);
	   this.areamarketForm.setFieldValue("sc_bl_value_chg.area_book",this.areamarket);
	   this.areamarketForm.setFieldValue("sc_bl_value_chg.type",'1');
   },
   areamarketForm_onSave: function(){
	   var area_market=this.areamarketForm.getFieldValue("sc_bl_value_chg.area_market");
	   if(area_market==0){
		   var controller=this;
		   var confirmMessage="建筑物价值没有变动，你确定保存吗?";
		   View.confirm(confirmMessage, function(button){
			   if (button == 'yes') {
				   try {	
					   controller.onsaveval(); 
					   controller.areamarketForm.save();
					   controller.showrefresh();
					   controller.areamarketForm.setFieldValue("sc_bl_value_chg.area_book",area_market);
			   }catch(e){
				   View.showMessage(e.message);
				   return;
			   }
		   }
	   });
	   }else{
		   this.onsaveval(); 
		   this.areamarketForm.save(); 
		   this.showrefresh();
		   this.areamarketForm.setFieldValue("sc_bl_value_chg.area_book",area_market);
	   }
   },
   
   //将新价值保存到bl表
   onsaveval:function(){
	   var area_market=this.areamarketForm.getFieldValue("sc_bl_value_chg.area_market");
	   if(area_market==0){
		   area_market=this.areamarket;
		   this.areamarketForm.setFieldValue("sc_bl_value_chg.area_market",area_market); 
	   }
	   var blDS=View.dataSources.get('blDS');
	   var res = new Ab.view.Restriction();
	   res.addClause('bl.bl_id',this.blId,'=');
	   var record=blDS.getRecord(res);
	   record.setValue("bl.area_building_manual",area_market);
	   blDS.saveRecord(record);
   }
   
})

function change(){
	var panel=View.panels.get("areamarketForm");
	var area_add=panel.getFieldValue("sc_bl_value_chg.area_add");
	var area_book=panel.getFieldValue("sc_bl_value_chg.area_book");
	var area_market=parseFloat(area_book)+parseFloat(area_add);
	panel.setFieldValue("sc_bl_value_chg.area_market",area_market.toFixed(2));
}