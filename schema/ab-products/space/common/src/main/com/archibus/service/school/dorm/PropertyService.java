package com.archibus.service.school.dorm;

import java.io.InputStream;
import java.util.*;

import com.archibus.datasource.SqlUtils;
import com.archibus.ext.importexport.filebuilder.ImportExportFileBase;
import com.archibus.ext.report.xls.XlsBuilder;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.ExceptionBase;

public class PropertyService extends DormTransfer {
    
    public void importNewData(final String serverFileName, final String format,
            final InputStream inputStream) {
        try {
            final ImportExportFileBase xlsBuilder =
                    getXLSBuilder(serverFileName, format, inputStream);
            
            XlsBuilder.FileFormatType.fromString(format);
            if (xlsBuilder.getLastRowIndex() < 1) {
                throw new ExceptionBase(String.format("导入文件表中没有数据，请检查!"));
            }
            this.status.setTotalNumber(xlsBuilder.getLastRowIndex());
            final List<String> fieldName = getFieldName(xlsBuilder);
            final List<HashMap<String, Object>> actualRecords = getRecords(xlsBuilder, fieldName);
            final List<HashMap<String, Object>> FailRecords =
                    new ArrayList<HashMap<String, Object>>();
            // 检查文件中是否记录
            if (xlsBuilder.getLastRowIndex() < 1) {
                throw new ExceptionBase(String.format("导入文件表中没有数据，请检查!"));
            }
            final int count = actualRecords.size();
            String message = "本次更新数据" + count + "条,更新失败的数据是第";
            final String message1 = "本次更新数据" + count + "条";
            for (int i = 0; i < actualRecords.size(); i++) {
                final HashMap<String, Object> map = actualRecords.get(i);
                
                try {
                    insertNewData(map);
                    
                } catch (final ExceptionBase e) {
                    FailRecords.add(map);
                    message = message + " " + (i + 1);
                }
            }
            message = message + "条";
            final int a = FailRecords.size();
            if (a > 0) {
                this.status.setMessage("导入失败的数据有" + a + "条");
                this.status.addPartialResult(new JobResult("消息： " + message));
            } else {
                this.status.addPartialResult(new JobResult("更新记录：" + message1));
            }
        } catch (final ExceptionBase e) {
            System.out.println(e.toString());
            return;
        } catch (final Exception e) {
            System.out.println(e.toString());
            return;
        }
        
    }
    
    public void insertNewData(final HashMap<String, Object> map) {
        final String identi_code = map.get("identi_code").toString();
        final String pro_name = map.get("pro_name").toString();
        final String pro_sex = map.get("pro_sex").toString();
        String proSex = "0";
        if (pro_sex.equals("男")) {
            proSex = "1";
        } else if (pro_sex.equals("2")) {
            proSex = "2";
        }
        final String proTypeValue = map.get("pro_type").toString();
        String pro_type = "";
        if (proTypeValue.equals("宿管员")) {
            pro_type = "1";
        } else if (proTypeValue.equals("清洁工")) {
            pro_type = "2";
        }
        // 1;在岗;2;休假;3;离职
        final String statusValue = map.get("status").toString();
        String status = "";
        if (statusValue.equals("在岗")) {
            status = "1";
        } else if (statusValue.equals("休假")) {
            status = "2";
        } else if (statusValue.equals("离职")) {
            status = "3";
        }
        final String date_work = map.get("date_work").toString();
        final String work_loc = map.get("work_loc").toString();
        final String work_performance = map.get("work_performance").toString();
        final String comments = map.get("comments").toString();
        
        final StringBuffer sql = new StringBuffer();
        sql.append(" INSERT INTO sc_stu_property (identi_code,pro_name,pro_sex,pro_type,date_work,status,work_loc,work_performance,comments) VALUES (");
        sql.append(" '" + identi_code + "',");
        sql.append(" '" + pro_name + "',");
        sql.append(" '" + proSex + "',");
        sql.append(" '" + pro_type + "',");
        sql.append(" to_date('" + date_work + "','yyyy-MM-dd'),");
        sql.append(" '" + status + "',");
        sql.append(" '" + work_loc + "',");
        sql.append(" '" + work_performance + "',");
        sql.append(" '" + comments + "')");
        SqlUtils.executeUpdate("sc_stu_property", sql.toString());
        SqlUtils.commit();
    }
}
