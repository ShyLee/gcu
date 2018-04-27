function createXHR(){
	var request=false;
	
	//window对象中有XMLHttpRequest存在就是非IE，包括（IE7，IE8）
	if(window.XMLHttpRequest){
		request=new XMLHttpRequest();

		if(request.overrideMimeType){
			request.overrideMimeType("text/xml");
		}
	

	//window对象中有ActiveXObject属性存在就是IE
	}else if(window.ActiveXObject){
		
		var versions=['Microsoft.XMLHTTP', 'MSXML.XMLHTTP', 'Msxml2.XMLHTTP.7.0','Msxml2.XMLHTTP.6.0','Msxml2.XMLHTTP.5.0', 'Msxml2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP'];

		for(var i=0; i<versions.length; i++){
				try{
					request=new ActiveXObject(versions[i]);

					if(request){
						return request;
					}
				}catch(e){
					request=false;
				}
		}
	}
	return request;
}

function addEventHandler(obj,eventName,fun,param){
    var fn = fun;
    if(param)
    {
        fn = function(e)
        {
            fun.call(window, param);  //继承监听函数,并传入参数以初始化;
        }
    }
    if(obj.attachEvent){
        obj.attachEvent('on'+eventName,fn);
    }else if(obj.addEventListener){
        obj.addEventListener(eventName,fn,false);
    }else{
        obj["on" + eventName] = fn;
    }
}




View.createController("fileuploadController", {
	afterInitialDataFetch:function(){
	}
	,
    fileupload_afterRefresh:function(){
        this.fileupload.gridRows.each(function(row){
            var record = row.getRecord();
			var downLink=record.getValue('ts_doc_center.doc_download');
			var downName=record.getValue('ts_doc_center.doc_name');
			var docId=record.getValue('ts_doc_center.doc_id');
	    	var cellElement = document.createElement('td');
			//var aElement=document.createElement('a');
			//aElement.target="self";
			var param={'downLink':downLink,'name':downName};
			
			//对每个按钮注册点击事件
			//addEventHandler(aElement,'click',download,param);
			
			var imgElement=document.createElement('img');
			imgElement.src="/archibus/schema/ab-products/space/inv/sch/fileDownLoad/img/ab-icon-download.png";
			//aElement.appendChild(imgElement);
			addEventHandler(imgElement,'click',download,param);
			
			//var aElement2=document.createElement('a');
			var imgElement2=document.createElement('img');
			imgElement2.src="/archibus/schema/ab-products/space/inv/sch/fileDownLoad/img/ab-icon-task-cancel.png";
			//aElement2.appendChild(imgElement2);
			var param2={'downLink':downLink,'name':deleteFileOnServer,'docId':docId};
			addEventHandler(imgElement2,'click',deleteFileOnServer,param2);
			
			
			cellElement.appendChild(imgElement);
			cellElement.appendChild(imgElement2);
			//cellElement.appendChild(addElement);
	        row.dom.appendChild(cellElement);
        });
    }
	
})


function download(param){
	var iframe = document.createElement("iframe");
	iframe.style.display="none";
	iframe.name="hiddentAreaForDownLoad";
	iframe.id="hiddentAreaForDownLoad";
	var downForm = document.createElement("form");
	
	downForm.style.display="none";
	downForm.action = "/archibus/schema/ab-products/space/inv/sch/fileDownLoad/jsp/FileDownLoad.jsp";
	downForm.target="hiddentAreaForDownLoad";
	downForm.method="post";
	downForm.id="downloadForm";
	downForm.name="downloadForm";
	
	var fileName = document.createElement("input");
	fileName.value = param.name;
	fileName.name = "name";
	
	var fileDownLink = document.createElement("input");
	fileDownLink.value = param.downLink;
	fileDownLink.name = "downLink";
	
	downForm.appendChild(fileName);
	downForm.appendChild(fileDownLink);

	document.body.appendChild(iframe);
	document.body.appendChild(downForm);
	
	//主要解决IE请求链接在新窗口打开问题
	document.getElementById('hiddentAreaForDownLoad').contentWindow.name = 'hiddentAreaForDownLoad'; 
	downForm.submit();
}

function deleteFileOnServer(param){
    View.confirm("您确定要删除吗？", function(button){
		if (button == 'yes') {
			var iframe = document.createElement("iframe");
	iframe.style.display="none";
	iframe.name="hiddentAreaForDelete";
	iframe.id="hiddentAreaForDelete";
	var deleteForm = document.createElement("form");
	
	deleteForm.style.display="none";
	deleteForm.action = "/archibus/schema/ab-products/space/inv/sch/fileDownLoad/jsp/DeleteFile.jsp";
	deleteForm.target="hiddentAreaForDelete";
	deleteForm.method="post";
	deleteForm.id="deleteForm";
	deleteForm.name="deleteForm";
	
	var fileName = document.createElement("input");
	fileName.value = param.name;
	fileName.name = "name";
	
	var fileDownLink = document.createElement("input");
	fileDownLink.value = param.downLink;
	fileDownLink.name = "downLink";
	
	var targetId = document.createElement("input");
	targetId.value = param.docId;
	targetId.name = "docId";
	
	deleteForm.appendChild(fileName);
	deleteForm.appendChild(fileDownLink);
	deleteForm.appendChild(targetId);
	
	document.body.appendChild(iframe);
	document.body.appendChild(deleteForm);
	
	//主要解决IE请求链接在新窗口打开问题
	document.getElementById('hiddentAreaForDelete').contentWindow.name = 'hiddentAreaForDelete'; 
	deleteForm.submit();
	setTimeout(afterDeleteFile,2000);
		}
	});
	
	function afterDeleteFile(){
				View.panels.get('fileupload').refresh();
		}
	
}
