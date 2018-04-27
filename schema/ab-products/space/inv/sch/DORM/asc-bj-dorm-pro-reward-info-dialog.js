//jQuery(function(){
//	jQuery("#dengJiForm_sc_stu_property_log\\.yearmonth").attr("placeholder","例如：2015年6月,请输入201506")
//});




var controller=View.createController("controller",{
	openController:"",
	//保存奖罚记录
	saveAward:function(){
		this.dengJiForm.save();
		this.openController = this.view.parameters['parentController'];
		this.openController.gridTotalAwardPanel.refresh();
	}
})

//function showProInfo(fieldName,newValue,oldValue){
//	var form = View.panels.get('dengJiForm');
//	if(fieldName=='sc_stu_property_log.pro_sex'){
//		var sex=newValue;		
//		if(sex=="男"){
//			sex = '1';
//		}else if(sex=="女"){
//			sex ='2';
//		}
//		form.setFieldValue("sc_stu_property_log.pro_sex",sex);	
//	}
//	if(fieldName=='sc_stu_property_log.pro_type'){
//		var type=newValue;		
//		if(type=="宿管员"){
//			type = '1';
//		}else if(type=="清洁工"){
//			type ='2';
//		}
//		form.setFieldValue("sc_stu_property_log.pro_type",type);	
//	}
//	
//}

function showProInfo(fieldName, selectedValue, previousValue){
    if (fieldName == 'sc_stu_property_log.pro_sex') {
        dealWith('dengJiForm', fieldName, selectedValue);
    	return false;
    }
    
    if (fieldName == 'sc_stu_property_log.pro_type') {
        dealWith('dengJiForm', fieldName, selectedValue);
    	return false;
    }
}

function dealWith(panelId, fieldName, selectedValue){
    var panel = View.panels.get(panelId);
    var listOptions = panel.getFieldElement(fieldName);
    
    if (typeof listOptions == 'undefined' || !listOptions) 
        return;
    
    var nCount = listOptions.options.length;
    for (var nIdx = 0; nIdx < nCount; nIdx++) {
        var optionsValue = listOptions.options[nIdx].innerHTML;
        if (optionsValue == selectedValue) {
            listOptions.selectedIndex = nIdx;
            break;
        }
    }
}
