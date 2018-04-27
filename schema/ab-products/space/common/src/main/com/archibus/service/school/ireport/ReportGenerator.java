package com.archibus.service.school.ireport;

import java.io.File;
import java.sql.Date;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.export.*;
import net.sf.jasperreports.engine.export.ooxml.JRDocxExporter;
import net.sf.jasperreports.engine.util.JRLoader;

import com.archibus.context.*;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;

/**
 * PmWorkOrderGenerator - Long running job that generates Preventive Maintenance work orders and
 * work requests.
 * 
 * <p>
 * History:
 * <li>Initial implementation for PM release 1.
 * <li>Modified implementation for PM release 2 new functionality: enforce SLA. By llj.
 * 
 * @author llj
 */
public class ReportGenerator extends JobBase {
    
    private final String name;
    
    private final String fileType;
    
    private String fileName;
    
    private HashMap m_map = null;
    
    private String sub_reports = "";
    
    private final String MESSAGE_Ireport = "报表";
    
    private final char spearatorchar = File.separatorChar;
    
    public ReportGenerator(final String name, final String type, final HashMap map) {
        this.name = name;
        this.fileType = type;
        if (map.get("subReports") != null) {
            this.sub_reports = (String) map.get("subReports");
            map.remove("subReports");
            
            // 如果用到子报表，定义父报表中的子报表文件夹参数
            final String ireportFile =
                    ContextStore.get().getWebAppPath().toString() + this.spearatorchar + "reports"
                            + this.spearatorchar;
            map.put("SUBREPORT_DIR", ireportFile);
        }
        this.m_map = map;
    }
    
    /**
     * Runs the work order generation process.
     */
    @Override
    public void run() {
        
        String fileUrl = "";
        try {
            if (this.fileType.equals("1")) {
                
                fileUrl = createIreport(this.name, "7777777");
                
            } else if (this.fileType.equals("0")) {
                fileUrl = createXLS(this.name, "JJJJJ");
            } else {
                fileUrl = createDocx(this.name, "DDDDDD");
            }
        } catch (final Exception e) {
            
            e.printStackTrace();
            
        }
        this.status.setCurrentNumber(100);
        this.status.setCode(JobStatus.JOB_COMPLETE);
        
        this.status.setResult(new JobResult(this.MESSAGE_Ireport, this.fileName, fileUrl));
        
    }
    
    /**
     * 功能：生产pdf的报表
     * 
     * @param filename 文件名字。
     * @param name 报表参数
     */
    public String createIreport(final String filename, final String name) throws Exception {
        String fileUrl = "";
        final MyDatabase my = new MyDatabase();
        final java.sql.Connection conn = my.getConnection();
        try {
            ContextStore.get().getEventHandlerContext();
            // 组合文件名字
            final Date currentDate = new Date(System.currentTimeMillis());
            final SimpleDateFormat dateFormat = new SimpleDateFormat();
            dateFormat.applyPattern("yyyy-MM-dd-HHmmss");
            dateFormat.format(currentDate);
            // final String filenamefinal = filename + "_" + dateString + ".pdf";
            final String filenamefinal = filename + ".pdf";
            this.fileName = filenamefinal;
            final Context contextfile = ContextStore.get();
            fileUrl = contextfile.getContextPath() + "/reportsFile/" + filenamefinal;
            
            // 定位到C://archibus
            final String ireportFile =
                    ContextStore.get().getWebAppPath().toString() + this.spearatorchar + "reports"
                            + this.spearatorchar;
            
            final String xmlFileName = ireportFile + filename + ".jrxml";
            
            final String jasperFileName = ireportFile + filename + ".jasper";
            final String printFileName = ireportFile + filename + ".jrprint";
            JasperCompileManager.compileReportToFile(xmlFileName);
            
            // 如果存在子报表就去编译它们
            if (this.sub_reports != "") {
                final String[] subReports = this.sub_reports.split(",");
                for (final String subname : subReports) {
                    JasperCompileManager.compileReportToFile(ireportFile + subname + ".jrxml");
                }
            }
            
            this.status.setCurrentNumber(50);
            // 用数据填充报表
            JasperFillManager.fillReportToFile(jasperFileName, this.m_map, conn);
            final java.io.File sourceFile = new java.io.File(printFileName);
            JRLoader.loadObject(sourceFile);
            final String ireportPDF =
                    ContextStore.get().getWebAppPath().toString() + this.spearatorchar
                            + "reportsFile" + this.spearatorchar + filenamefinal;
            
            JasperRunManager.runReportToPdfFile(jasperFileName, ireportPDF, this.m_map, conn);
            
            // my.close(conn);
        } catch (final JRException e) {
            System.out.println("********************************************");
            e.printStackTrace();
            throw new Exception(e.toString());
        } catch (final Throwable e) {
            throw new Exception(e.toString());
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (final Exception e) {
                throw new Exception(e.toString());
            }
        }
        return fileUrl;
        
    }
    
    /**
     * 功能：生产docx的报表
     * 
     * @param filename 文件名字。
     * @param name 报表参数
     * @throws Exception
     */
    public String createDocx(final String filename, final String name) throws Exception {
        String fileUrl = "";
        final MyDatabase my = new MyDatabase();
        // 组合文件名字
        final java.sql.Connection conn = my.getConnection();
        try {
            final Date currentDate = new Date(System.currentTimeMillis());
            final SimpleDateFormat dateFormat = new SimpleDateFormat();
            dateFormat.applyPattern("yyyy-MM-dd-HHmmss");
            dateFormat.format(currentDate);
            // final String filenamefinal = filename + "_" + dateString + ".docx";
            final String filenamefinal = filename + ".docx";
            this.fileName = filenamefinal;
            final Context contextfile = ContextStore.get();
            fileUrl = contextfile.getContextPath() + "/reportsFile/" + filenamefinal;
            final String ireportFile =
                    contextfile.getWebAppPath().toString() + this.spearatorchar + "reports"
                            + this.spearatorchar;
            final String xmlFileName = ireportFile + filename + ".jrxml";
            
            final String jasperFileName = ireportFile + filename + ".jasper";
            final String printFileName = ireportFile + filename + ".jrprint";
            
            new File(jasperFileName);
            
            final JRAbstractExporter exporter = new JRDocxExporter(); // 可以替换成不同的文件类型
            JasperCompileManager.compileReportToFile(xmlFileName);
            
            // 如果存在子报表就去编译它们
            if (this.sub_reports != "") {
                final String[] subReports = this.sub_reports.split(",");
                for (final String subname : subReports) {
                    JasperCompileManager.compileReportToFile(ireportFile + subname + ".jrxml");
                }
            }
            
            JasperFillManager.fillReportToFile(jasperFileName, this.m_map, conn);
            final java.io.File sourceFile = new java.io.File(printFileName);
            final JasperPrint jasperPrint = (JasperPrint) JRLoader.loadObject(sourceFile);
            exporter.setParameter(JRExporterParameter.JASPER_PRINT, jasperPrint);//
            // 如果你已经有了jasper_print对象,你可以压缩后将其输出
            
            final String ireportDOC =
                    ContextStore.get().getWebAppPath().toString() + this.spearatorchar
                            + "reportsFile" + this.spearatorchar + filenamefinal;
            // 保存的文件；
            final java.io.File saveFile = new java.io.File(ireportDOC);
            exporter.setParameter(JRExporterParameter.CHARACTER_ENCODING, "GB2312");//
            
            // 要把报表输出到的文件
            exporter.setParameter(JRExporterParameter.OUTPUT_FILE, saveFile);
            exporter.exportReport();
            
        } catch (final JRException e) {
            System.out.println("********************************************");
            e.printStackTrace();
            throw new Exception(e.toString());
        } catch (final Throwable e) {
            throw new Exception(e.toString());
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (final Exception e) {
                throw new Exception(e.toString());
            }
        }
        
        return fileUrl;
    }
    
    /**
     * 功能：生产xls的报表
     * 
     * @param filename 文件名字。
     * @param name 报表参数
     * @throws Exception
     */
    public String createXLS(final String filename, final String name) throws Exception {
        String fileUrl = "";
        final MyDatabase my = new MyDatabase();
        // 组合文件名字
        final java.sql.Connection conn = my.getConnection();
        try {
            
            final Date currentDate = new Date(System.currentTimeMillis());
            final SimpleDateFormat dateFormat = new SimpleDateFormat();
            dateFormat.applyPattern("yyyy-MM-dd-HHmmss");
            dateFormat.format(currentDate);
            // final String filenamefinal = filename + "_" + dateString + ".xlsx";
            // final String filenamefinal = filename + "_" + dateString + ".xls";
            final String filenamefinal = filename + ".xls";
            this.fileName = filenamefinal;
            final Context contextfile = ContextStore.get();
            fileUrl = contextfile.getContextPath() + "/reportsFile/" + filenamefinal;
            
            final String ireportFile =
                    contextfile.getWebAppPath().toString() + this.spearatorchar + "reports"
                            + this.spearatorchar;
            final String xmlFileName = ireportFile + filename + ".jrxml";
            
            final String jasperFileName = ireportFile + filename + ".jasper";
            final String printFileName = ireportFile + filename + ".jrprint";
            final JRXlsExporter xls_exporter = new JRXlsExporter();
            // HashMap params = new HashMap(); // 建立参数表
            JasperCompileManager.compileReportToFile(xmlFileName);
            
            // 如果存在子报表就去编译它们
            if (this.sub_reports != "") {
                final String[] subReports = this.sub_reports.split(",");
                for (final String subname : subReports) {
                    JasperCompileManager.compileReportToFile(ireportFile + subname + ".jrxml");
                }
            }
            
            JasperFillManager.fillReportToFile(jasperFileName, this.m_map, conn);
            final java.io.File sourceFile = new java.io.File(printFileName);
            final JasperPrint jasperPrint = (JasperPrint) JRLoader.loadObject(sourceFile);
            
            // 设置xls报表的属性
            xls_exporter.setParameter(JRExporterParameter.JASPER_PRINT, jasperPrint);//
            // 如果你已经有了jasper_print对象,你可以压缩后将其输出
            
            final String ireportXLS =
                    ContextStore.get().getWebAppPath().toString() + this.spearatorchar
                            + "reportsFile" + this.spearatorchar + filenamefinal;
            // 保存的文件；
            final java.io.File saveFile = new java.io.File(ireportXLS);
            xls_exporter.setParameter(JRExporterParameter.CHARACTER_ENCODING, "GB2312");//
            // 设置报表的字符集
            xls_exporter
                .setParameter(JRXlsExporterParameter.IS_WHITE_PAGE_BACKGROUND, Boolean.TRUE);//
            // 报表的背景颜色是否为白色还是其他颜色
            xls_exporter.setParameter(JRXlsExporterParameter.IS_ONE_PAGE_PER_SHEET, Boolean.FALSE);// 是否把一个报表页面写在不同的工作簿里
            xls_exporter
                .setParameter(JRXlsExporterParameter.IS_FONT_SIZE_FIX_ENABLED, Boolean.TRUE);//
            // 标志文字大小是否适应单元格的高度
            xls_exporter.setParameter(JRXlsExporterParameter.IS_REMOVE_EMPTY_SPACE_BETWEEN_ROWS,
                Boolean.TRUE);// 是否去除行间的空白
            
            // 要把报表输出到的文件
            xls_exporter.setParameter(JRExporterParameter.OUTPUT_FILE, saveFile);
            xls_exporter.exportReport();// 导出
            
        } catch (final Exception e) {
            throw new Exception(e.toString());
            
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (final Throwable e) {
                throw new Exception(e.toString());
            }
        }
        return fileUrl;
    }
    
}
