<%@page language="java" pageEncoding="UTF-8"%>
<%@ page import="java.util.*" %>
<%@ page import="java.net.*" %>
<%@ page import="java.lang.String"%>
<%@ page import="java.io.*"%>
<%@ page import="java.util.*"%>
<%@ page import="javax.servlet.*"%>
<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+ path + "/";
%>
<%
	//关于文件下载时采用文件流输出的方式处理：
	//加上response.reset()，并且所有的％>后面不要换行，包括最后一个；
	request.setCharacterEncoding("UTF-8");
	response.setCharacterEncoding("UTF-8");
	response.reset();//可以加也可以不加
	String name = request.getParameter("name");
	String downLink=request.getParameter("downLink");
	
	String filedownload =request.getRealPath("/projects/upload/"+downLink);
    String extName=name.substring(name.lastIndexOf(".") + 1);
	
	response.setContentType("application/octet-stream");
	
	String filedisplay=URLEncoder.encode(name, "UTF-8");
	if(request.getHeader("USER-AGENT").toLowerCase().indexOf("firefox")>=0){
		String local=request.getLocale().toString();
		filedisplay=new String(name.getBytes("UTF-8"),"ISO8859-1");
	}
	response.addHeader("Content-Disposition", "attachment;filename="
			+ filedisplay );
	java.io.OutputStream outp = null;
	java.io.FileInputStream in = null;
	try {
		outp = response.getOutputStream();
		in = new FileInputStream(filedownload);

		byte[] b = new byte[1024];
		int i = 0;

		while ((i = in.read(b)) > 0) {
			outp.write(b, 0, i);
		}
		outp.flush();
		out.clear();
		out = pageContext.pushBody();
	} catch (Exception e) {
		e.printStackTrace();
	} finally {
		if (in != null) {
			in.close();
			in = null;
		}
		//这里不能关闭  
		//if(outp != null)
		//{
		//outp.close();
		//outp = null;
		//}
	}
%>



