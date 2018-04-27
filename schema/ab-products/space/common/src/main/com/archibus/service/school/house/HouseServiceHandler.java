package com.archibus.service.school.house;

import java.io.InputStream;
import java.util.*;

import com.archibus.datasource.SqlUtils;
import com.archibus.ext.importexport.filebuilder.ImportExportFileBase;
import com.archibus.ext.report.xls.XlsBuilder;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.service.school.JobBaseService;
import com.archibus.utility.ExceptionBase;

/**
 * House Rent Check Service
 * 
 * @author ZhaoYongLi
 */
public class HouseServiceHandler extends JobBaseService {
    List<String> yearMonth = new ArrayList<String>();
    
    /**
     * check the difference between actual rent and calculate rent , and sign these records
     * 
     * @param yearmonth
     * @param serverFileName
     * @param format
     * @param inputStream
     */
    public void checkDiffOfActualAndCalculateRent(final String yearmonth,
            final String serverFileName, final String format, final InputStream inputStream) {
        try {
            final ImportExportFileBase xlsBuilder =
                    getXLSBuilderZzf(serverFileName, format, inputStream);
            XlsBuilder.FileFormatType.fromString(format);
            if (xlsBuilder.getLastRowIndex() < 1) {
                throw new ExceptionBase(String.format("导入文件表中没有数据，请检查!"));
            }
            this.status.setTotalNumber(xlsBuilder.getLastRowIndex());
            final List<String> fieldName = getFieldName(xlsBuilder);
            final List<HashMap<String, Object>> actualRecords =
                    getRecordsZzf(xlsBuilder, fieldName);
            
            // 检查文件中是否记录
            if (xlsBuilder.getLastRowIndex() < 1) {
                throw new ExceptionBase(String.format("导入文件表中没有数据，请检查!"));
            }
            String message = "";
            // 检查文件的月份与当前比较月份是否相同
            getYearMonths(actualRecords);
            message = checkYearMonth(yearmonth, this.yearMonth);
            if (message != "") {
                this.status.addPartialResult(new JobResult(message));
            } else {
                // 更新记录
                for (final HashMap<String, Object> map : actualRecords) {
                    updateAdjustRecord(map, yearmonth);
                }
            }
            
        } catch (final ExceptionBase e) {
            System.out.println(e.toString());
            return;
        } catch (final Exception e) {
            System.out.println(e.toString());
            return;
        }
    }
    
    private void getYearMonths(final List<HashMap<String, Object>> records) {
        for (final HashMap<String, Object> record : records) {
            this.iterateRecord(record);
        }
    }
    
    private void iterateRecord(final HashMap<String, Object> map) {
        final Iterator<Map.Entry<String, Object>> iter = map.entrySet().iterator();
        while (iter.hasNext()) {
            final Map.Entry<String, Object> entry = iter.next();
            final String key = entry.getKey();
            if (key.trim().equals("年月")) {
                final String formatyear = this.checkNumToString(entry.getValue());
                this.yearMonth.add(formatyear);
            }
        }
    }
    
    /*
     * 判断用户导入的文件中的年份时候符合 例如页面是201302，excel中就要是201302 checkAdjustYearmonth(页面年月参数，表中的数据参数)
     */
    private String checkYearMonth(final String yearmonth, final List<String> yearMonth) {
        this.log.info("正在检查前导入数据的月份是否匹配...");
        String message = "";
        if (null == yearMonth) {
            message = "当前导入文件的年月为空！";
        }
        for (final String str : yearMonth) {
            if (str.equals("") || null == str) {
                this.log.error("当前导入年月字段存在[空值]！");
                message = "当前导入文件年月存在[空值]！";
            }
            
            if (!yearmonth.equals(str)) {
                this.log.error("当前导入文件的年月字段[与检查年月不一致]！");
                message = "当前导入文件的年月字段[与检查年月不一致]！";
            }
        }
        return message;
    }
    
    private void updateAdjustRecord(final HashMap<String, Object> record, final String yearmonth) {
        final String em_id = checkNumToString(record.get("职工号"));
        final String daikou_rent = record.get("实际代扣房租金额").toString();
        
        final String year = getYear(yearmonth);
        final String month = getMonth(yearmonth);
        
        final StringBuffer sql = new StringBuffer();
        sql.append(" UPDATE sc_zzfrent_details SET sc_zzfrent_details.actual_payoff = '"
                + daikou_rent + "',is_check='2'");
        sql.append(" WHERE sc_zzfrent_details.em_id = '" + em_id + "' ");
        sql.append(" AND sc_zzfrent_details.year = '" + year + "' ");
        sql.append(" AND sc_zzfrent_details.month = '" + month + "' ");
        try {
            SqlUtils.executeUpdate("sc_zzfrent_details", sql.toString());
            SqlUtils.commit();
        } catch (final Exception e) {
            this.log.info("[SQL String]：" + sql.toString());
            this.log.error("更新代扣房租表失败！[message]:" + e.toString());
        }
    }
    
    private String getYear(final String year) {
        return year.substring(0, 4);
    }
    
    private String getMonth(final String month) {
        return month.substring(4, month.length());
    }
    
    private String checkNumToString(final Object obj) {
        final String str = obj.toString();
        final int index = str.indexOf(".");
        System.err.println(index);
        if (index != -1) {
            return str.substring(0, index);
        }
        return str;
    }
    
}
