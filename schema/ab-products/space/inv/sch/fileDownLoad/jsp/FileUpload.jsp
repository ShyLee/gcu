<!-- 
@author zhaoyongli
 -->

<%@ page language="java" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*"%>
<%@ page import="com.archibus.context.ContextStore"%>
<%@ page import="java.io.*"%>
<%@ page import="java.util.*"%>
<%@ page import="javax.servlet.*"%>
<%@ page import="javax.servlet.http.*"%>
<%@ page import="com.archibus.utility.FileCopy"%>
<%@ page import="org.apache.commons.fileupload.FileItem"%>
<%@ page import="org.apache.commons.fileupload.FileUploadException"%>
<%@ page import="org.apache.commons.fileupload.disk.DiskFileItemFactory"%>
<%@ page import="org.apache.commons.fileupload.servlet.ServletFileUpload"%>
<%@ page import="com.archibus.service.school.SaveUploadFileItem"%>

<%
request.setCharacterEncoding("UTF-8");
String path=null;
String tempPath = getServletContext().getRealPath("/projects/temp");
//声明disk
DiskFileItemFactory disk = new DiskFileItemFactory();
disk.setSizeThreshold(1024*1024);
disk.setRepository(new File(tempPath));
//声明解析requst的servlet
ServletFileUpload up = new ServletFileUpload(disk);
String hint="";
Map<String,String> mm = new HashMap<String, String>();
try{
	//解析requst
	List<FileItem> list = up.parseRequest(request);
	//声明一个list<map>封装上传的文件的数据
	
	for(FileItem file:list){ 
		
		if(file.isFormField()){ 
			String key= file.getFieldName();//<input type="text" name="desc">=desc
			String value = file.getString("UTF-8");//默认以ISO方式读取数据
			System.err.println(key + "="+value);
			if(key.equals("pk")){
				mm.put("pk",value);
			}
			if(key.equals("uploader")){
				mm.put("uploader",value);
			}
			if(key.equals("desc")){
				mm.put("desc",value);
			}
			
			if(key.equals("filetype")){
				mm.put("filetype",value);
			}
			
			if(key.equals("tableName")){
				mm.put("tableName",value);
			}
		}else{
			
			//获取文件名
			String fileName = file.getName();
			fileName = fileName.substring(fileName.lastIndexOf("\\")+1);
			String extName = fileName.substring(fileName.lastIndexOf("."));//.jpg
			//UUID
			String uuid = UUID.randomUUID().toString().replace("-", "");
			//新名称
			String newName = uuid+extName;
			
			//第一步：获取新名称的hashcode
			int code = newName.hashCode();
			//第二步：获取后一位做为第一层目录
			String dir1 = 
					Integer.toHexString(code & 0xf);
			//获取第二层的目录
			String dir2 = 
					Integer.toHexString((code>>4)&0xf);
			String savePath = dir1+File.separator+dir2;
			//组成保存的目录
			path=getServletContext().getRealPath("/projects/upload/"+savePath);
			//判断目录是否存在
			File f = new File(path);
			if(!f.exists()){
				//创建目录
				f.mkdirs();
			}


			String fileType = file.getContentType();
			
			InputStream in = file.getInputStream();
			int size = in.available();
			//使用工具类
			FileCopy.copy(in,new File(path+File.separator+newName)); 
			// 提供下载project/upload/的相对路径 
			mm.put("fileDownload",savePath+File.separator+newName);
			mm.put("fileName",fileName);
			mm.put("fileType",extName);
			mm.put("fileCodedName",newName);
  			file.delete(); 
		}
	}
	//todo
	hint="上传成功";
	SaveUploadFileItem suf=new SaveUploadFileItem();
	suf.save(mm);
	
}catch(Exception e){
	//request.setAttribute("hint","上传失败");
	hint="上传失败";
	e.printStackTrace();
}

%>
 <script type="text/javascript">//<![CDATA[
            window.onload = function () {
            	  var str="<%=hint%>";
            	  window.parent.afterUploadFile(str);        
            }
        //]]>
 
 
 
 
 </script>     