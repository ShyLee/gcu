
var abScDefUnit = View.createController('abScDefUnit', {
   blId:"",
   blName:"",
   valueBook:"",
   afterInitialDataFetch:function(){
	  this.showrefresh();
   },
   
   showrefresh: function(){
	   this.valueMarketForm.refresh(null,true);
	   this.blId = this.view.parameters['blId'];
	   this.blName = this.view.parameters['blName'];
	   this.valueBook = this.view.parameters['blValueBook'];
	   setPanelTitle('valueMarketForm', "建筑物："+this.blName);
	   this.valueMarketForm.setFieldValue("sc_bl_value_chg.bl_id",this.blId);
	   this.valueMarketForm.setFieldValue("sc_bl_value_chg.name",this.blName);
	   this.valueMarketForm.setFieldValue("sc_bl_value_chg.value_book",this.valueBook);
	   this.valueMarketForm.setFieldValue("sc_bl_value_chg.type",'2');
   },
   valueMarketForm_onSave: function(){
	   var value_market=this.valueMarketForm.getFieldValue("sc_bl_value_chg.value_market");
	   if(value_market==0){
		   var controller=this;
		   var confirmMessage="建筑物价值没有变动，你确定保存吗?";
		   View.confirm(confirmMessage, function(button){
			   if (button == 'yes') {
				   try {	
					   controller.onsaveval(); 
					   controller.valueMarketForm.save();
					   //controller.showrefresh();
					   //controller.valueMarketForm.setFieldValue("sc_bl_value_chg.value_book",value_market);
			   }catch(e){
				   View.showMessage(e.message);
				   return;
			   }
			   
		   }
	   });
	   }else{
		   this.onsaveval(); 
		   this.valueMarketForm.save(); 
		   this.showrefresh();
		   this.valueMarketForm.setFieldValue("sc_bl_value_chg.value_book",value_market);
	   }
   },
   
   //将新价值保存到bl表
   onsaveval:function(){
	   var value_market=this.valueMarketForm.getFieldValue("sc_bl_value_chg.value_market");
	   var value_book=this.valueMarketForm.getFieldValue("sc_bl_value_chg.value_book");
	   if(value_market==0){
		   value_market=value_book;
		   this.valueMarketForm.setFieldValue("sc_bl_value_chg.value_market",value_market); 
	   }
	   var blDS=View.dataSources.get('blDS');
	   var res = new Ab.view.Restriction();
	   res.addClause('bl.bl_id',this.blId,'=');
	   var record=blDS.getRecord(res);
	   //折旧基数=原值 +value_add (sc_bl_value_chg)
	   record.setValue("bl.value_book",value_market);
	   //净值　=  净值 + value_add (sc_bl_value_chg)
	   var value_net = this.getValueNet();
	   record.setValue("bl.value_net",value_net);
	   blDS.saveRecord(record);
	   var contr=View.getOpenerView();
	   var openerPanel=contr.panels.get('bl_detail');
		openerPanel.refresh();
   },
   getValueNet:function(){
	   var value_add = this.valueMarketForm.getFieldValue("sc_bl_value_chg.value_add");
	   var blValueNet = this.view.parameters['blValueNet'];
	   var valueNet = parseFloat(value_add)+parseFloat(blValueNet);
	   return valueNet;
   }
   
})

function change(){
	var panel=View.panels.get("valueMarketForm");
	var value_add=panel.getFieldValue("sc_bl_value_chg.value_add");
	var value_book=panel.getFieldValue("sc_bl_value_chg.value_book");
	var value_market=parseFloat(value_book)+parseFloat(value_add);
	panel.setFieldValue("sc_bl_value_chg.value_market",value_market.toFixed(2));
}