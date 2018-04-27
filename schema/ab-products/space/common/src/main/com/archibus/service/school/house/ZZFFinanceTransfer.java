package com.archibus.service.school.house;

import java.io.*;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.Context;
import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.datatransfer.DataTransferUtility;
import com.archibus.ext.importexport.filebuilder.ImportExportFileBase;
import com.archibus.ext.report.xls.XlsBuilder;
import com.archibus.jobmanager.JobBase;
import com.archibus.utility.*;

public class ZZFFinanceTransfer extends JobBase {
    
    protected Context context = null;
    
    protected final Logger log = Logger.getLogger(this.getClass());
    
    protected final List<String> errorData = new ArrayList<String>();
    
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
        for (int row = 3; row <= xlsBuilder.getLastRowIndex(); row++) {
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
            final Object field = xlsBuilder.getCellData(2, i);
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
    
    /**
     * 导入财务处反馈的代扣信息
     * 
     * 
     */
    public void financeFeedBackTransferIn(final String yearmonth, final String serverFileName,
            final String format, final InputStream inputStream) {
        try {
            // 1.读取导入的数据
            this.log.info("读取导入的数据...");
            final ImportExportFileBase xlsBuilder =
                    getXLSBuilder(serverFileName, format, inputStream);
            XlsBuilder.FileFormatType.fromString(format);
            if (xlsBuilder.getLastRowIndex() < 1) {
                throw new ExceptionBase(String.format("导入文件表中没有数据，请检查!"));
            }
            this.status.setTotalNumber(xlsBuilder.getLastRowIndex() - 2);
            final List<String> fieldName = getFieldName(xlsBuilder);
            final List<HashMap<String, Object>> xlsRecords = getRecords(xlsBuilder, fieldName);
            this.status.setCurrentNumber(30);
            // 2.查出当前月份所有财务处代扣的缴费项
            this.log.info("查出当前月份所有财务处代扣的缴费项...");
            final List<DataRecord> dbRecords = getFinanceFeesBuyMonth(yearmonth);
            this.status.setCurrentNumber(40);
            // 3.写入实缴金额
            recordActualPay(xlsRecords, dbRecords);
            this.status.setCurrentNumber(100);
            // printErrorRow();// 输出错误列表
        } catch (final ExceptionBase e) {
            System.out.println(e.toString());
        } catch (final Exception e) {
            System.out.println(e.toString());
        }
        
    }
    
    /**
     * 写入实缴金额
     * 
     * 1.存在xlsRecord的记录 按具体的实缴金额记录
     * 
     * 2. 不存在的记录默认扣款成功，更新实缴金额等于应缴金额
     * 
     * @param List<HashMap<String, Object>> xlsRecords,
     * @param List<DataRecord> dbRecords
     * 
     * */
    public void recordActualPay(final List<HashMap<String, Object>> xlsRecords,
            final List<DataRecord> dbRecords) {
        String em_id = null;
        String pay_actual = null;
        
        String emId = null;
        String feeId = null;
        // 1.存在xlsRecord的记录 按具体的实缴金额记录
        this.log.info("开始核对导入xls财务代扣记录...");
        for (final HashMap<String, Object> xlsRecord : xlsRecords) {
            em_id = xlsRecord.get("员工号").toString();
            em_id = em_id.substring(0, em_id.lastIndexOf('.'));
            pay_actual = xlsRecord.get("实缴金额").toString();
            
            for (final DataRecord dbRecord : dbRecords) {
                emId = dbRecord.getValue("sc_zzf_fee.em_id").toString();
                
                if (emId.equals(em_id)) {
                    feeId = dbRecord.getValue("sc_zzf_fee.fee_id").toString();
                    feeId = feeId.substring(0, feeId.lastIndexOf('.'));
                    final String sql =
                            "update sc_zzf_fee set sc_zzf_fee.pay_actual ='" + pay_actual
                                    + "' where sc_zzf_fee.fee_id ='" + feeId + "'";
                    this.log.info("[SQL String]：" + sql);
                    SqlUtils.executeUpdate("sc_zzf_fee", sql);
                    dbRecords.remove(dbRecord);
                    /* 目前我们需要确定 一条em_id只能拥有一条缴费项目，也就是说；同一个员工，在同一月只能有一条财务代扣的记录，如果有两天，此套管理逻辑便不适用 */
                    break;
                }
            }
        }
        
        // 2.不存在的记录默认扣款成功，更新实缴金额等于应缴金额
        this.log.info("不存在的记录默认扣款成功，更新实缴金额等于应缴金额...");
        String fee_ids = "";
        if (dbRecords.size() == 0) {
            SqlUtils.commit();
            return;
        }
        for (final DataRecord dbRecord : dbRecords) {
            
            feeId = dbRecord.getValue("sc_zzf_fee.fee_id").toString();
            feeId = feeId.substring(0, feeId.lastIndexOf('.'));
            fee_ids = fee_ids + feeId + ", ";
        }
        fee_ids = fee_ids.substring(0, fee_ids.length() - 2);
        final String sql =
                "update sc_zzf_fee set sc_zzf_fee.pay_actual = sc_zzf_fee.pay_ought where sc_zzf_fee.fee_id in ("
                        + fee_ids + ")";
        this.log.info("[SQL String]:" + sql);
        SqlUtils.executeUpdate("sc_zzf_fee", sql);
        
        SqlUtils.commit();
    }
    
    /**
     * 获取当前月份所有财务处代扣的缴费项
     * 
     * */
    public List<DataRecord> getFinanceFeesBuyMonth(final String yearmonth) {
        this.log.info("获取当前月份[" + yearmonth + "]下所有财务处代扣的缴费项目");
        // 从账户表获取当前账户余额
        final String sql =
                "SELECT fee_id,em_id,em_name,date_pay_begin,date_pay_end,pay_ought,pay_actual FROM sc_zzf_fee WHERE to_char(date_pay_begin,'yyyymm') = '"
                        + yearmonth
                        + "' AND sc_zzf_fee.card_id in (select card_id from sc_zzfcard where sc_zzfcard.payment_to = 'finance' and (sc_zzfcard.card_status = 'yrz' or sc_zzfcard.card_status = 'yxq'))";
        final String[] flds =
                new String[] { "fee_id", "em_id", "em_name", "date_pay_begin", "date_pay_end",
                        "pay_ought", "pay_actual" };
        this.log.info("[SQL String]:" + sql);
        final List<DataRecord> records = SqlUtils.executeQuery("sc_zzf_fee", flds, sql);
        return records;
    }
    
    private void printErrorRow() {
        this.log.info("正在检验错误……");
        final StringBuffer errorlog = new StringBuffer();
        final long allRows = this.status.getCurrentNumber();
        final int missedRows = this.errorData.size();
        final int finished = (int) allRows - missedRows;
        errorlog.append("导入的记录数:" + allRows);
        errorlog.append(" 共更新记录：" + finished);
        if (missedRows > 0) {
            for (final String row : this.errorData) {
                errorlog.append(" 错误行：" + row);
            }
        }
        this.log.error("errorlog:" + errorlog.toString());
        
    }
    
}
