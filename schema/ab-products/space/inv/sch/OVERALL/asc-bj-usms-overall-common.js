/**
 * 得到主校区
 */
function getMainCampus(){
	var parameters = {
            tableName: 'site',
            fieldNames: toJSON(['site.site_id']),
            restriction: 'site.isMainCampus = 1'
    };
            
    var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    var mainCampus_id = result.data.records[0]['site.site_id'];
	return mainCampus_id;
}
/**
 * 得到主校区(暂不能使用，数据库中没有afm_scmpref.mainCampus_id这个字段)
 */
function getMainCampus2(){
	var parameters = {
            tableName: 'afm_scmpref',
            fieldNames: toJSON(['afm_scmpref.mainCampus_id'])
    };
            
    var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    var mainCampus_id = result.data.records[0]['afm_scmpref.mainCampus_id'];
	return mainCampus_id;
}

/**
 * add column to current row
 * @param {Object} gridRow
 * @param {int} count
 * @param {String} text
 */
function addColumn(gridRow, count, text){
    for (var i = 0; i < count; i++) {
        var gridCell = document.createElement('th');
        if (text) {
            gridCell.innerHTML = text;
            gridCell.style.textAlign = 'right';
            gridCell.style.color = 'blue';
        }
        gridRow.appendChild(gridCell);
    }
}


function ASC_showFieldValuesInComboxList(table_name,field_name,restriction,selectOptions){
	    var typeFrame = document.getElementById(selectOptions);
        typeFrame.options.length = 0;
		
		//get the enum_list of status
        var parameters = {
            tableName: table_name,
            fieldNames: toJSON([field_name]),
            restriction: restriction
        };
        try {
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
		//add space option
        var option = new Option('', '', true);        
        typeFrame.options.add(option);	
		
		
		var len = result.data.records.length;
		var fieldValue;
		for (var i = 0; i < len; i++) {
			fieldValue = result.dataSet.records[i].getValue(table_name + "." + field_name);
			var myValue = fieldValue;
			var myText = fieldValue;
			option = new Option(myText, myValue);
			typeFrame.options.add(option);
		}
		
}

function ASC_showSiteValuesInComboxList(selectOptions,restriction){
	    var typeFrame = document.getElementById(selectOptions);
        typeFrame.options.length = 0;
		
		//get the enum_list of status
        var parameters = {
            tableName: 'site',
            fieldNames: toJSON(['site_id','name']),
            restriction: restriction
        };
        try {
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
		//add space option
        var option = new Option('', '', true);        
        typeFrame.options.add(option);	
		
		
		var len = result.data.records.length;
		var fieldValue;
		for (var i = 0; i < len; i++) {
			fieldValue1 = result.dataSet.records[i].getValue('site.site_id');
			fieldValue2 = result.dataSet.records[i].getValue('site.name');
			var myValue = fieldValue1;
			var myText = fieldValue2;
			option = new Option(myText, myValue);
			typeFrame.options.add(option);
		}
		
}
/**
 * 
 * @param {Object} sId
 * @param {Object} value
 */
function getSelectValue(sId, name){
    var s = document.getElementById(sId);
    var ops = s.options;
    for (var i = 0; i < ops.length; i++) {
        var tempName = ops[i].name;
        if (tempName == name) {
            return ops[i].value;
			break;
        }
    }
	return "null"
}
function ASC_showEnumFieldInComboxList(tableName, fieldName, selectOptions){
	    var typeFrame = document.getElementById(selectOptions);
        typeFrame.options.length = 0;
		
		//get the enum_list of status
        var parameters = {
            tableName: 'afm_flds',
            fieldNames: toJSON(['afm_flds.enum_list']),
            restriction: "afm_flds.table_name = '" + tableName + "' AND afm_flds.field_name = '" + fieldName + "'"
        };
        try {
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
        var row = result.data.records[0];
        var arrType = row['afm_flds.enum_list'].split(';');
        var len = arrType.length / 2;
        
		//add space option 
        var option = new Option('', '', true);        
        typeFrame.options.add(option);		
        for (var i = 0; i < len; i++) {
			var myValue = arrType[(i * 2)];
			var myText =  arrType[(i * 2)+1];           
            option = new Option(myText, myValue);
            typeFrame.options.add(option);
        }
}
