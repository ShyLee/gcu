
var controller = View.createController('controller', {
	
	consoleZzf_onShow: function(){

        var emName = this.consoleZzf.getFieldValue("sc_zzfcard.em_name");
        var idCard = this.consoleZzf.getFieldValue("sc_zzfcard.identi_code");
        var year = this.consoleZzf.getFieldValue("sc_zzfrent_details.year");
        var month = this.consoleZzf.getFieldValue("sc_zzfrent_details.month");
     
        var res = new Ab.view.Restriction();
        
        if (emName != '') {
        	res.addClause('sc_zzfcard.em_name', emName, '=');
        }
        if (idCard!= '') {
        	res.addClause('sc_zzfcard.identi_code', idCard, '=');
        }
        if (year!= '') {
        	res.addClause('sc_zzfrent_details.year', year, '=');
        }
        if (month!= '') {
        	if(year!= ''){
        		res.addClause('sc_zzfrent_details.month', month, '=');
        	}else{
        		View.showMessage("请先选择一个年份！");
        	}
        }
        this.zzfRentDetails.refresh(res); 
    },
    
    consoleZzf_onClear:function(){

    	this.consoleZzf.setFieldValue("sc_zzfcard.em_name","");
    	this.consoleZzf.setFieldValue("sc_zzfcard.identi_code","");
        this.zzfRentDetails.refresh([],true); 
    },


});