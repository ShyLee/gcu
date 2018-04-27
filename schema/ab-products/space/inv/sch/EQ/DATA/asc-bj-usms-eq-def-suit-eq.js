var controller=View.createController('eqSuitForm',{
	eqSeriesPanel_onBtnAddSeries: function(){
		this.eqSeriesListDetaiPanel.setFieldValue('eq_series.total_price',0);
	}
});

function transEqInfo(filedName,selectValue,preValue){
	var eqId=selectValue;
	var eqDs=View.dataSources.get('ascBjUsmsEqDs');
	var eqRes=new Ab.view.Restriction();
	eqRes.addClause('eq.eq_id',eqId,'=');
	var eqRecord=eqDs.getRecord(eqRes);
	var eqName=eqRecord.getValue('eq.eq_name');
	var brand=eqRecord.getValue('eq.brand');
	var eqStd=eqRecord.getValue('eq.eq_std');
	var eqType=eqRecord.getValue('eq.eq_type');
	var price=eqRecord.getValue('eq.price');
	
	var formPanel=View.panels.get('eqSeriesListDetaiPanel');
	formPanel.setFieldValue('eq_series_list.eq_name',eqName);
	formPanel.setFieldValue('eq_series_list.brand',brand);
	formPanel.setFieldValue('eq_series_list.eq_std',eqStd);
	formPanel.setFieldValue('eq_series_list.eq_type',eqType);
	formPanel.setFieldValue('eq_series_list.price',price);
	
}

function getCount(){
	var formPanel=View.panels.get('eqSeriesListDetaiPanel');
	var eqNum=0;
	var num=formPanel.getFieldValue('eq_series_list.eq_num');
	if(valueExistsNotEmpty(num)){
		eqNum=parseInt(num);
	}
	var eqPrice=0;
	var price=formPanel.getFieldValue('eq_series_list.price');
	if(valueExistsNotEmpty(price)){
		eqPrice=parseInt(price);
	}
	var totalPrice=eqPrice*eqNum;
	formPanel.setFieldValue('eq_series_list.total_price',totalPrice);
	
}

function caculatprice(){
	var seriesListFPanel=View.panels.get('eqSeriesListDetaiPanel');
	var eqSeriesId=seriesListFPanel.getFieldValue('eq_series_list.series_id');
	
	var eqSeriesItemRes=new Ab.view.Restriction();
	eqSeriesItemRes.addClause('eq_series_list.series_id',eqSeriesId);
	var sumDs=View.dataSources.get('ascBjUsmsCaculateSumDs');
	var sumRec=sumDs.getRecord(eqSeriesItemRes);
	var sumPrice=sumRec.getValue('eq_series_list.sumPrice');
	
	var eqSeriesRes=new Ab.view.Restriction();
	eqSeriesRes.addClause('eq_series.series_id',eqSeriesId,'=');
	var eqSeriesDs=View.dataSources.get('ascBjUsmsEqSeriesDs');
	var eqSeriesRecord=eqSeriesDs.getRecord(eqSeriesRes);
	eqSeriesRecord.setValue('eq_series.total_price',sumPrice);
	
	eqSeriesDs.saveRecord(eqSeriesRecord);
	
	var res=new Ab.view.Restriction();
	res.addClause('eq_series_list.series_id',eqSeriesId,'=');
	View.panels.get('eqSeriesPanel').refresh();
	View.panels.get('eqSeriesFormPanel').refresh();
	View.panels.get('eqSeriesListPanel').refresh(res);
}

function saveHidden(){
	caculatprice();
}

function deleteHidden(){
	caculatprice();
	View.panels.get('eqSeriesListDetaiPanel').show(false);
}

function showSeriesList(value){
	var seriesId=value.restriction['eq_series.series_id'];
	var seriesRes=new Ab.view.Restriction();
	seriesRes.addClause('eq_series_list.series_id',seriesId,'=');
	View.panels.get('eqSeriesListPanel').refresh(seriesRes);
}
