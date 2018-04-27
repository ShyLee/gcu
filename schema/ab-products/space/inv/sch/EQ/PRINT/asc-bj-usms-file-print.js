var controller=View.createController('printForm',{
	parameters: {'TIME_START':null,'TIME_END':null,'DV_ID':null},
	current_view_path: "",
	image_path: "",
	afterInitialDataFetch: function(){
		var window=View.getWindow();
		this.current_view_path=(window.location).toString();
		var archibusIndex=this.current_view_path.indexOf('archibus');
		//var fileIndex= this.current_view_path.lastIndexOf('asc-bj-usms-file-print.axvw');
		this.image_path=this.current_view_path.substring(0,archibusIndex)+"archibus/schema/ab-products/space/inv/sch/EQ/PRINT/reports-static/";

		var tableElem=document.getElementById('printTable');
		//tableElem.setAttribute('border',"1px,1px,solid");
		tableElem.appendChild(createTRElement("wjmChuZhiShenBaoStatic","1.对外经济贸易大学固定资产处置申报单"));
		tableElem.appendChild(createTRElement("wjmCaigouyusuanStatic","2.对外经济贸易大学政府采购预算表"));
		tableElem.appendChild(createTRElement("wjmReportStatic","3.对外经济贸易大学固定资产校内调转单"));
		tableElem.appendChild(createTRElement("wjmSheBeiTuiHuanStatic","4.对外经济贸易大学设备退还单"));
		tableElem.appendChild(createTRElement("wjmZiChaBaoGaoStatic","5.对外经济贸易大学固定资产自查报告表"));
		tableElem.appendChild(createTRElement("wjmSheBeiYanShouStatic","6.对外经济贸易大学仪器设备验收单"));
		tableElem.appendChild(createTRElement("wjmSheBeiYanShouStatic","7.对外经济贸易大学仪器设备验收单"));
	
		//tableElem.appendChild(getZongZhangTR("8.对外经济贸易大学仪器设备总账"));
	}
});

function printZongZhang(){
	var datePickPanel=View.panels.get('dateInputPanel');
	var date_begin=datePickPanel.getFieldValue('dateBegin');
	if(!valueExistsNotEmpty(date_begin)){
		View.alert("数据起始日期不能为空 ! ");
		return;
	}
	var date_end=datePickPanel.getFieldValue('dateEnd');
	if(!valueExistsNotEmpty(date_end)){
		View.alert("数据结束日期不能为空 ! ");
		return;
	}
	var dv_id=View.user.employee.organization.divisionId;
	controller.parameters['TIME_START']=date_begin;
	controller.parameters['TIME_END']=date_end;
	controller.parameters['DV_ID']=dv_id;
	View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200,xmlName:"wjmSheBeiZongZhang",parameters:controller.parameters, closeButton:false});
}

function createTRElement(fileName,fileTitle){
	//tr
	var trElem=document.createElement("tr");
	trElem.setAttribute('height','40px');
	trElem.setAttribute('width','800px');
		//显示箭头和文件名称
		var td1=document.createElement("td");
			var imgJT=document.createElement('img');
			imgJT.setAttribute('src',controller.image_path+"jianTou.png");
			imgJT.setAttribute('width','17px');
			imgJT.setAttribute('height','17px');
			
			var spanName=document.createElement("span");
			spanName.setAttribute('translatable',"true");
				var bElement=document.createElement("b");
				bElement.innerHTML=fileTitle;
			spanName.appendChild(bElement);
			//spanName.setAttribute('value',fileTitle);
		td1.appendChild(imgJT);
		td1.appendChild(spanName);
		
		//显示pdf图标和名称
		var td2=document.createElement("td");
		td2.setAttribute("width","100px");
		td2.setAttribute("align","center");
			var imgPDF=document.createElement('img');
			imgPDF.setAttribute('src',controller.image_path+"pdf_image.png");
			imgPDF.setAttribute('width','20px');
			imgPDF.setAttribute('height','23px');
			
			var AElement=document.createElement("a");
			AElement.setAttribute('href',controller.image_path+fileName+".pdf");
				var spanPdf=document.createElement("span");
				spanPdf.setAttribute('translatable',"true");
				spanPdf.innerHTML="PDF类型";
				//spanPdf.setAttribute('value',"PDF Type");
			AElement.appendChild(spanPdf);
		td2.appendChild(imgPDF);
		td2.appendChild(AElement);
		
		//显示xls图标和名称
		var td3=document.createElement("td");
		td3.setAttribute("width","100px");
		td3.setAttribute("align","center");
			var imgEXCEL=document.createElement('img');
			imgEXCEL.setAttribute('src',controller.image_path+"xls_image.png");
			imgEXCEL.setAttribute('width','20px');
			imgEXCEL.setAttribute('height','23px');
			
			var AElement2=document.createElement("a");
			AElement2.setAttribute('href',controller.image_path+fileName+".xls");
				var spanEXCEL=document.createElement("span");
				spanEXCEL.setAttribute('translatable',"true");
				spanEXCEL.innerHTML="XLS类型";
				//spanPdf.setAttribute('value',"");
			AElement2.appendChild(spanEXCEL);
		td3.appendChild(imgEXCEL);
		td3.appendChild(AElement2);
		
	trElem.appendChild(td1);
	trElem.appendChild(td2);
	trElem.appendChild(td3);
	
	return trElem;
}

//function getZongZhangTR(fileTitle){
////	var zTR=document.createElement("tr");
////		var td1=document.createElement("tr");
////			var imgJT=document.createElement('img');
////			imgJT.setAttribute('src',controller.image_path+"jianTou.png");
////			imgJT.setAttribute('width','17px');
////			imgJT.setAttribute('height','17px');
////			
////			var spanName=document.createElement("span");
////			spanName.setAttribute('translatable',"true");
////			var bElement=document.createElement("b");
////			bElement.innerHTML=fileTitle;
////			spanName.appendChild(bElement);
////	    //spanName.setAttribute('value',fileTitle);
////		td1.appendChild(imgJT);
////		td1.appendChild(spanName);
////		
////		var td2=document.createElement("td");
////		td2.setAttribute("width","100px");
////		td2.setAttribute("align","center");
////		td2.setAttribute("colspan",'2');
////			var input=document.createElement('input');
////			input.setAttribute('type',"button");
////			input.setAttribute('id','btnZongZhang');
////			input.setAttribute('name','btnZongZhang');
////			input.setAttribute('value','导出数据');
////			input.setAttribute('onclick','printZongZhang()');
////		td2.appendChild(input);
////	zTR.appendChild(td1);
////	zTR.appendChild(td2);
////	
////	return zTR;
//}