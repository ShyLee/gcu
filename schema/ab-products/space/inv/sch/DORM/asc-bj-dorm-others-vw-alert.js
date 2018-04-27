var abOthersAlertController = View.createController('abOthersAlertController', {
	
	afterInitialDataFetch: function(){
		$('idd1').innerHTML="<font size='2'>3天以上到期</font>";
		$('idd2').innerHTML="<font size='2'>3天内到期</font>";
		$('idd3').innerHTML="<font size='2'>已超期</font>";
	},
	alertListPanel_afterRefresh: function(){
		var items = this.alertListPanel.gridRows.items;
		for(var i = 0; i < items.length; i++){
			var nowDate = new Date();
			var endDate = items[i].getFieldValue('sc_stu_other.date_checkout');
			var days = (endDate.getTime() - nowDate.getTime())/(3600000 * 24) + 1;
			
			if(days <= 0){
				items[i].dom.bgColor = "red";
			}else if(days>0 && days <= 3){
				items[i].dom.bgColor = "yellow";
			}else{
				items[i].dom.bgColor = "green";
			}
		}
	}
	
});
