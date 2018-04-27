
$(document).ready(function(){
    jQuery("#confirm").val("确 定");
    var yearObj = document.getElementById('year');
    var currentYear = new Date().getFullYear();
    var array = new Array();
    for (var i = 0; i < 10; i++) {
        array[i] = currentYear - i;
    }
    
    for (var i = 0; i < array.length; i++) {
        if (i != array.length - 1) {
            var option = new Option(array[i], array[i]);
            yearObj.options.add(option);
        }
        else {
            var option = new Option('其他', 'other');
            yearObj.options.add(option);
            
        }
    }
    var rptList = document.getElementById('rpt');
    var arr = new Array();
    var option0 = new Option("请选择报表...", "");
    var option1 = new Option("财基报表", "asc-bj-rpt-caiji");
    var option2 = new Option("财决报表", "asc-bj-rpt-caijue");
    var option3 = new Option("房屋构筑物财政部", "asc-bj-rtp-fwgzw-finance");
    var option4 = new Option("房屋构筑物教育部", "asc-bj-rtp-fwgzw-edu");
    var option5 = new Option("固定资产处置明细表", "asc-bj-rpt-fixedasset-dispose");
    var option6 = new Option("固定资产增减变动表", "asc-bj-rpt-fixedasset-change");
    var option7 = new Option("全校固定资产数", "asc-bj-rpt-sch-fixedasset");
    var option8 = new Option("土地", "asc-bj-rpt-sch-land");
    var option9 = new Option("土地财政部", "asc-bj-rpt-land-caizheng");
    var option10 = new Option("学年初报表", "asc-bj-rpt-earlier-xuenian");
    arr.push(option0);
    arr.push(option1);
    arr.push(option2);
    arr.push(option3);
    arr.push(option4);
    arr.push(option5);
    arr.push(option6);
    arr.push(option7);
    arr.push(option8);
    arr.push(option9);
    arr.push(option10);
    for (var i = 0; i <= arr.length; i++) {
        rptList.options.add(arr[i]);
    }
    
	 jQuery("#point").attr("checked", true);

});


function gradeChange(){
    var objS = jQuery("#year").val();
    jQuery("#yearField").text("");
    if (objS == 'other') {
        jQuery("#yearField").attr("hidden", false);
		jQuery("#yearField").css("display","block");
    }
    else {
        jQuery("#yearField").attr("hidden", true);
		jQuery("#yearField").css("display","none");
    }
    
};



function controlDate(currNode){
    if (currNode.value == 'point') {
        jQuery("#pointTime").css("display", "block");
        jQuery("#nonpointTime").css("display", "none");
    }
    else {
        jQuery("#pointTime").css("display", "none");
        jQuery("#nonpointTime").css("display", "block");
		jQuery("#datefrom").val("");
		jQuery("#dateto").val("");
    }
    
};

function confirmGenerate(){
    var rptObj = jQuery('#rpt');
    var rptType = rptObj.val();
    if (rptType == '') {
        View.alert('请选择需要生成的报表');
        return;
    }
    else {
        xmlName = rptType;
    }
    
  //土地表
    if (rptType == 'asc-bj-rpt-sch-land') {
        var param = {
        };
        generate(xmlName, param)
    }
    //土地财政部表
    if (rptType == 'asc-bj-rpt-land-caizheng') {
        var param = {
        };
        generate(xmlName, param)
    }
    
    //固定资产增减变动表
    if (rptType == 'asc-bj-rpt-fixedasset-change') {
        var val = jQuery("#year").val();
        if (val == 'other') {
            var textValue = jQuery("#yearField").val();
            val = textValue;
        }
        if(val == ""){
        	alert("请选择一个时间点");
        	return;
        }
        var param = {
            'year': val,
            'lastYear': (parseInt(val) - 1).toString()
        };
        generate(xmlName, param)
    }
    //财决报表
    if(rptType =='asc-bj-rpt-caijue'){
        var val = jQuery("#year").val();
        if (val == 'other') {
            var textValue = jQuery("#yearField").val();
            val = textValue;
        }
        if(val == ""){
        	alert("请选择一个时间点");
        	return;
        }
        var param = {
                'year': val,
                'lastYear': (parseInt(val) - 1).toString()
            };
        generate(xmlName, param)
    }
    //固定资产处置明细表
    if(rptType == 'asc-bj-rpt-fixedasset-dispose')
	{
    	var param = {
        };
        generate(xmlName, param)
	}
    
    //全校固定资产数
    if (rptType == 'asc-bj-rpt-sch-fixedasset') {
        var val = jQuery("#year").val();
        if (val == 'other') {
            var textValue = jQuery("#yearField").val();
            val = textValue;
        }
        if(val == ""){
        	alert("请选择一个时间点");
        	return;
        }
        var param = {
            'year': val
};
        generate(xmlName, param)
    }
    
    //学年初报表
    if (rptType == 'asc-bj-rpt-earlier-xuenian') {
        var dateFrom = jQuery('#datefrom').val();
        var dateTo = jQuery('#dateto').val();
        var annual = dateFrom.split("-")["0"] + " - " + dateTo.split("-")["0"];    
        if(dateFrom == "" || dateTo == ""){
        	alert("请选择好报表所需的时间段");
        	return;
        }
        var param = {
            'xueNianDu': annual,
            'startYear': dateFrom,
            'endYear': dateTo
        };
        generate(xmlName, param)
    }
     //房屋构筑物固定资产教育部
    if (rptType == 'asc-bj-rtp-fwgzw-edu') {
    	var param = {};
    	generate(xmlName, param)
    }
	
	  if (rptType == 'asc-bj-rtp-fwgzw-finance') {
    	var param = {};
    	generate(xmlName, param)
    }
	
    //财基报表
    if (rptType == 'asc-bj-rpt-caiji') {
    	var val = jQuery("#year").val();
    	if (val == 'other') {
    		var textValue = jQuery("#yearField").val();
    		val = textValue;
    	}
        if(val == ""){
        	alert("请选择一个时间点");
        	return;
        }
    	var param = {
    			'year': val
    	};
    	generate(xmlName, param)
    }

};


var xmlName = "";
function generate(xmlName, param){
    var txlspdf = jQuery('input[name="lock"]:checked').val();
    var wfrId = 'AbSpaceRoomInventoryBAR-iReportHandler-PmreReport';
    try {
        var result = Workflow.callMethod(wfrId, xmlName, txlspdf, param);
        if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
            result.data = eval('(' + result.jsonExpression + ')');
            this.jobId = result.data.jobId;
            var url = 'ab-ireport-example.axvw?jobId=' + this.jobId;
            window.open(url);
        }
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    View.closeThisDialog();
};

