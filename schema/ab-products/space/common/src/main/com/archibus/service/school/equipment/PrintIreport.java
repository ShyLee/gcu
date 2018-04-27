package com.archibus.service.school.equipment;

import java.io.*;
import java.util.*;

import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.util.JRLoader;

import org.apache.commons.collections.map.HashedMap;

public class PrintIreport {
    public static int print() {
        final int result = 0;// 操作状态，0代表操作成功，1代表操作失败
        JasperPrint print = null;
        try {
            
            final InputStream is = new FileInputStream("F:\\archibus\\reports\\wjmReport.jasper");
            
            final JasperReport jasperReport = (JasperReport) JRLoader.loadObject(is);
            
            new HashMap<String, String>();
            
            final Map params = new HashedMap();
            
            params.put("eqName", "超级计算机设备");
            params.put("eqStd", "75S0132");
            
            // parameters1.put("MyDatasource", new JRBeanCollectionDataSource(chatListsub));
            
            print = JasperFillManager.fillReport(jasperReport, params,
            
            new JREmptyDataSource());
            
            JasperExportManager.exportReportToPdfFile(print, "F:\\archibus\\reports\\外经贸调转单.pdf");
            
        } catch (final Exception ex) {
            
            ex.printStackTrace();
            
        }
        
        return result;
    }
}