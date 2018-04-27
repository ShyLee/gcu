var abPropertiesDefineController = View.createController('abPropertiesDefineController', {
	form_abPropertiesDefine_afterRefresh: function(){
    	if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
    		this.form_abPropertiesDefine.setFieldLabel("property.value_book",getMessage("value_book_title") + ", " + View.user.userCurrency.description);
    		this.form_abPropertiesDefine.setFieldLabel("property.value_market",getMessage("value_market_title") + ", " + View.user.userCurrency.description);
    	}else{
    		this.form_abPropertiesDefine.setFieldLabel("property.value_book",getMessage("value_book_title"));
    		this.form_abPropertiesDefine.setFieldLabel("property.value_market",getMessage("value_market_title"));
    	}
    }
});