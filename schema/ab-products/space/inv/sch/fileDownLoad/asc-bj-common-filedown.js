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
