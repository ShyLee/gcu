<%@page language="java" pageEncoding="UTF-8"%>
<%@ page import="java.util.*" %>
<%@ page import="java.net.*" %>
<%@ page import="java.lang.String"%>
<%@ page import="java.io.*"%>
<%@ page import="java.util.*"%>
<%@ page import="javax.servlet.*"%>
<%@ page import="com.archibus.service.school.SaveUploadFileItem"%>
<%
	//关于文件下载时采用文件流输出的方式处理：
	//加上response.reset()，并且所有的％>后面不要换行，包括最后一个；
	request.setCharacterEncoding("UTF-8");
	response.setCharacterEncoding("UTF-8");
	response.reset();//可以加也可以不加
	String name = request.getParameter("name");
	String downLink=request.getParameter("downLink");
	String docId=request.getParameter("docId");
	String hint="";
	String filedownload =request.getRealPath("/projects/upload/"+downLink);
	PrintWriter writer=response.getWriter();
 	try{
	File  file = new File(filedownload);  
	    // 路径为文件且不为空则进行删除  
	if (file.isFile() && file.exists()) {  
	       file.delete();  
	}  
	SaveUploadFileItem suf=new SaveUploadFileItem();
 	suf.delete(docId);
 	hint="删除成功";
 	}catch(Exception e){
 		hint="删除失败";
 		e.printStackTrace();
 	}
%>

 <script type="text/javascript">//<![CDATA[
            window.onload = function () {
            	  var str="<%=hint%>";
            	  window.parent.afterDeleteFile(str);        
            }
        //]]>
 </script>   

