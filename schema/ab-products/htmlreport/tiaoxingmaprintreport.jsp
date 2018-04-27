<!-- 
@author zhaoyongli

生成html 格式报表并打印
生成文件的命名规则:filename+当前时间的毫秒数  以避免重复
javascript 调用client端打印
 -->

<%@ page language="java" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*"%>
<%@ page import="com.archibus.context.ContextStore"%>
<%@ page import="java.io.*"%>
<%@ page import="java.util.*"%>
<%@ page import="javax.servlet.*"%>
<%@ page import="javax.servlet.http.*"%>
<%@ page import="net.sf.jasperreports.engine.*"%>
<%@ page import="net.sf.jasperreports.engine.util.JRLoader"%>
<%@ page import="net.sf.jasperreports.engine.JRException"%>
<%@ page import="net.sf.jasperreports.engine.JRRuntimeException"%>
<%@ page import="net.sf.jasperreports.engine.JasperFillManager"%>
<%@ page import="net.sf.jasperreports.engine.JasperPrint"%>
<%@ page import="net.sf.jasperreports.engine.JasperReport"%>
<%@ page import="net.sf.jasperreports.engine.JRExporterParameter"%>
<%@ page import="net.sf.jasperreports.engine.export.JRHtmlExporter"%>
<%@ page import="net.sf.jasperreports.j2ee.servlets.ImageServlet"%>
<%@ page import="java.net.URLDecoder"%>
<%@ page import="java.util.Random" %>
<%@ page import="net.sourceforge.barbecue.BarcodeImageHandler" %>
<%@ page import="net.sourceforge.barbecue.BarcodeException" %>
<%@ page import="net.sourceforge.barbecue.Barcode" %>
<%@ page import="net.sourceforge.barbecue.BarcodeFactory" %>
<%@ page import="javax.swing.*" %>

<%

    request.setCharacterEncoding("UTF-8");
    String filename = request.getParameter("xmlName");
    String eqId =request.getParameter("EQ_ID");
//     System.out.println("----------------------------------------------------");
    System.out.println(filename);
    //String DaLei =URLDecoder.decode(request.getParameter("DaLei"),"GBK");
    String fileFinalName="";
    ServletContext context = this.getServletConfig()
            .getServletContext();

    File reportFile = new File(context.getRealPath("/reports/"
            + filename + ".jrxml"));
    
    if (!reportFile.exists()) {
        throw new JRRuntimeException(
                filename
                        + ".jasper not found. The report design must be compiled first.");
    }
    Map parameters = new HashMap();
    parameters.put("EQ_ID", eqId);
    
    System.out.println(reportFile);
    JasperPrint jasperPrint = null;
    try {
        Connection conn = ContextStore.get().getDatabase().getPool()
                .getConnection().getConnection();
        
        String reportFileName = reportFile.getPath();
        JasperCompileManager.compileReportToFile(reportFile.getPath());
        String jasperFileName = context.getRealPath("/reports/" + filename + ".jasper");
        String printFileName = context.getRealPath("/reports/"  + filename + ".jrprint");
        
        JasperFillManager.fillReportToFile(jasperFileName, parameters, conn);
        
        java.io.File sourceFile = new java.io.File(printFileName);
        jasperPrint = JasperFillManager.fillReport(jasperFileName,
                parameters, conn);
    } catch (JRException e) {
        out.println(e);
        out.println("<html>");
        out.println("<head>");
        out.println("<title>JasperReports - Web Application Sample</title>");
        out.println("<link rel=\"stylesheet\" type=\"text/css\" href=\"../stylesheet.css\" title=\"Style\">");
        out.println("</head>");
        out.println("<body bgcolor=\"white\">");
        out.println("<span class=\"bnew\">JasperReports encountered this error :</span>");
        out.println("<pre>");
        out.println("</pre>");
        out.println("</body>");
        out.println("</html>");
        return;
    }

    if (jasperPrint != null) {
        JRHtmlExporter htmlExporter = new JRHtmlExporter();
        htmlExporter.setParameter(JRExporterParameter.JASPER_PRINT,
                jasperPrint);
         
         //最终生成的html文件 filename+rtrId+当前时间的毫秒数
          fileFinalName=filename+"_"+System.currentTimeMillis()+".html";
          String generateHtmlFilePath=context.getRealPath("/schema/ab-products/htmlreport/"+fileFinalName );
        htmlExporter
                .setParameter(
                        JRExporterParameter.OUTPUT_FILE_NAME,
                        generateHtmlFilePath);
        htmlExporter.exportReport();
    } else {
        response.setContentType("text/html");
        out.println("<html>");
        out.println("<head>");
        out.println("<title>JasperReports - Web Application Sample</title>");
        out.println("<link rel=\"stylesheet\" type=\"text/css\" href=\"../stylesheet.css\" title=\"Style\">");
        out.println("</head>");
        out.println("<body bgcolor=\"white\">");
        out.println("<span class=\"bold\">Empty response.</span>");
        out.println("</body>");
        out.println("</html>");
    }
%>
<script src="jquery-1.4.2.js" type="text/javascript">
</script>
<script type="text/javascript">
    jQuery(function() {
        jQuery('div').load(<%="'"+fileFinalName+"'"%>);
    });
    
    jQuery(function(){
        window.setTimeout(function(){
            window.print();
            window.opener=null;
            window.open('','_self');
            window.close();
        },1000); 
    
    });
</script>
<div></div>