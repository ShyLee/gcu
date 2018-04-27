package com.archibus.service.school.dorm;

import java.io.*;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.ext.datatransfer.DataTransferUtility;
import com.archibus.ext.importexport.filebuilder.ImportExportFileBase;
import com.archibus.ext.report.xls.XlsBuilder;
import com.archibus.jobmanager.JobBase;
import com.archibus.utility.*;

public class DormTransfer extends JobBase {
    protected final Logger log = Logger.getLogger(this.getClass());
    
    /**
     * 将XlsBuilder对象转换成对应的表格
     * 
     * @param xlsBuilder
     * @param fieldName
     * @return
     */
    protected List<HashMap<String, Object>> getRecords(final ImportExportFileBase xlsBuilder,
            final List<String> fieldName) {
        this.log.info("正在获取xls数据表中数据……");
        final List<HashMap<String, Object>> records = new ArrayList<HashMap<String, Object>>();
        for (int row = 4; row <= xlsBuilder.getLastRowIndex(); row++) {
            final HashMap<String, Object> record = new HashMap<String, Object>();
            for (int col = 0; col <= xlsBuilder.getLastColumnIndex(); col++) {
                final Object data = xlsBuilder.getCellData(row, col);
                if (data == null) {
                    record.put(fieldName.get(col), "");
                    this.log.info("导入的xls数据列中存在空值[Row]：" + row + "[Col]:" + col + "[FieldName]:"
                            + fieldName.get(col));
                } else {
                    record.put(fieldName.get(col), data.toString());
                }
            }
            records.add(record);
        }
        return records;
    }
    
    /**
     * 将XlsBuilder对象转换成对应的表格
     * 
     * @param xlsBuilder
     * @param fieldName
     * @return
     */
    protected List<HashMap<String, Object>> getRecordsByField(
            final ImportExportFileBase xlsBuilder, final List<String> fieldName) {
        this.log.info("正在获取xls数据表中数据……");
        final List<HashMap<String, Object>> records = new ArrayList<HashMap<String, Object>>();
        for (int row = 1; row <= xlsBuilder.getLastRowIndex(); row++) {
            final HashMap<String, Object> record = new HashMap<String, Object>();
            for (int col = 0; col <= xlsBuilder.getLastColumnIndex(); col++) {
                final Object data = xlsBuilder.getCellData(row, col);
                if (data == null) {
                    record.put(fieldName.get(col), "");
                    this.log.info("导入的xls数据列中存在空值[Row]：" + row + "[Col]:" + col + "[FieldName]:"
                            + fieldName.get(col));
                } else {
                    record.put(fieldName.get(col), data.toString());
                }
            }
            records.add(record);
        }
        return records;
    }
    
    /**
     * 获得列名
     * 
     * @param xlsBuilder
     * @return
     */
    protected List<String> getFieldName(final ImportExportFileBase xlsBuilder) {
        this.log.info("正在获取xls数据表中列名……");
        final List<String> fieldName = new ArrayList<String>();
        for (int i = 0; i <= xlsBuilder.getLastColumnIndex(); i++) {
            final Object field = xlsBuilder.getCellData(0, i);
            if (field == null) {
                fieldName.add("");
            } else {
                fieldName.add(field.toString());
            }
        }
        return fieldName;
    }
    
    /**
     * create xls object from input stream
     * 
     * @param serverFileName
     * @param format
     * @return
     */
    protected ImportExportFileBase getXLSBuilder(final String serverFileName, final String format,
            InputStream inputStream) {
        
        if (serverFileName.compareToIgnoreCase("null") != 0
                && StringUtil.notNullOrEmpty(serverFileName)) {
            DataTransferUtility.getFileStoredPath(serverFileName, "");
            FileInputStream fileInputStream = null;
            try {
                fileInputStream = new FileInputStream(serverFileName);
            } catch (final FileNotFoundException e) {
                throw new ExceptionBase(String.format(
                    "Unable to find the file [%s] on the server.", serverFileName));
            } finally {
                inputStream = fileInputStream;
            }
        }
        
        final XlsBuilder.FileFormatType fileFormatType =
                XlsBuilder.FileFormatType.fromString(format);
        final ImportExportFileBase xlsBuilder = new ImportExportFileBase(fileFormatType);
        xlsBuilder.open(inputStream, fileFormatType);
        return xlsBuilder;
    }
}
