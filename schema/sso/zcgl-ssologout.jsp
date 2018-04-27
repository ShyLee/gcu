<%@ page language="java" pageEncoding="UTF-8"%>
<%@ page language="java" import="com.archibus.service.school.sso.SSOServiceImpl"%>

<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+ path + "/";
	String userName = null;
	int returnCode = -1;
	
	userName="2014001";
// 	userName=request.getParameter("userName");
    	out.println(userName);
    if(userName=="" || userName==null){
    	response.sendRedirect("http://ids1.swu.edu.cn:81/amserver/UI/Login?goto=http%3A%2F%2Ffcgl.swu.edu.cn:8080%2Farchibus%2Fsso-logout.jsp");
    }
    try {
	    SSOServiceImpl sso = new SSOServiceImpl();
	    returnCode = sso.ssoLogin(userName);
	    out.println(returnCode);
	    
	    if(returnCode==1 || returnCode ==2){    
	    	String requestUrl=sso.getRedirectURL();
	        response.sendRedirect(requestUrl);
	    }else if ( returnCode==-2 || returnCode ==-1 ){			
			response.sendRedirect("schema/sso/noright.html");		
	    }
    } catch (Exception e) {
		e.printStackTrace();
	}

%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>ARCHIBUS SSO</title>

		<meta http-equiv="pragma" content="no-cache">
		<meta http-equiv="cache-control" content="no-cache">
		<meta http-equiv="expires" content="0">
		<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
		<meta http-equiv="description" content="This is my page">
	</head>
	<body>
	</body>
</html>
