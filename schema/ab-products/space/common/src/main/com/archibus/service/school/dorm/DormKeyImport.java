package com.archibus.service.school.dorm;

import java.io.InputStream;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.ext.report.xls.XlsBuilder;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.service.school.JobBaseService;
import com.archibus.utility.ExceptionBase;

/**
 * @author Administrator
 * 
 */

public class DormKeyImport extends JobBaseService {
    
    DormKeyRecord keyRecord = new DormKeyRecord();
    
    public void dormKeysTransferIn(final String serverFileName, final String format,
            final InputStream inputStream) {
        this.log.info("钥匙数据");
        try {
            final XlsBuilder xlsBuilder = getXLSBuilder(serverFileName, format, inputStream);
            XlsBuilder.FileFormatType.fromString(format);
            if (xlsBuilder.getLastRowIndex() < 1) {
                xlsBuilder.getLastRowIndex();
                throw new ExceptionBase(String.format("导入文件表中没有数据，请检查!"));
            }
            
            this.status.setTotalNumber(xlsBuilder.getLastRowIndex() - 3);
            final List<String> fieldName = getFieldName(xlsBuilder);
            final List<HashMap<String, Object>> records = getRecords(xlsBuilder, fieldName);
            
            //
            dormKeysImport(records);
            
            ContextStore.get().getEventHandlerContext();
            
            // printErrorRow();// 输出错误列表
        } catch (final ExceptionBase e) {
            System.out.println(e.toString());
        } catch (final Exception e) {
            System.out.println(e.toString());
        }
    }
    
    private void dormKeysImport(final List<HashMap<String, Object>> records) {
        
        this.log.info("正在导入房间钥匙数据……");
        int missed = 0;
        
        int index = 4;// 第五行开始是数据，因此从行号从5开始。
        for (final HashMap<String, Object> record : records) {
            String blName = "";
            String fl_id = "";
            String rm_id = "";
            // 钥匙总数
            String countAllKey = "";
            // 备用钥匙
            String countKeyBackup = "";
            index++;
            blName = record.get("bl_name").toString();
            final String blId = this.keyRecord.getBlId(blName);
            if (blId == "111") {
                this.status
                    .addPartialResult(new JobResult("第" + index + "行楼栋[" + blId + "]在系统中不存在"));
                missed++;
                continue;
            }
            
            fl_id = record.get("fl_id").toString();
            final String flId = this.keyRecord.getFlId(blId, fl_id);
            if (flId != null && flId != "") {
                if (flId == "111") {
                    this.status.addPartialResult(new JobResult("第" + index + "行楼层[" + flId
                            + "]在系统中不存在"));
                    missed++;
                    continue;
                }
            }
            
            rm_id = record.get("rm_id").toString();
            final String rmId = this.keyRecord.getRmId(blId, flId, rm_id);
            if (rmId != null && rmId != "") {
                if (rmId == "111") {
                    this.status.addPartialResult(new JobResult("第" + index + "行房间[" + rmId
                            + "]在系统中不存在"));
                    missed++;
                    continue;
                }
            }
            
            countAllKey = record.get("count_all_key").toString();
            countKeyBackup = record.get("count_key_backup").toString();
            
            // // 更新预算的预算总额
            if (!blId.equals("") && !flId.equals("") && !rmId.equals("")) {
                try {
                    this.keyRecord.updateKeys(blId, flId, rmId, countAllKey, countKeyBackup);
                } catch (final Exception e) {
                    this.status.addPartialResult(new JobResult("更新 " + blId + "|" + flId + "|"
                            + rmId + " 房间钥匙失败！"));
                }
            }
            
            this.status.incrementCurrentNumber();
        }
        /*
         * if (!budget_id.equals("")) { try { this.equipmentBudget.updateEqBudget(budget_id); }
         * catch (final Exception e) { this.status.addPartialResult(new JobResult(dvId + " 预算 " +
         * budget_id + " 导入失败!")); } }
         */
        if (missed > 0) {
            this.status.setMessage(missed + "条记录未能正确导入，详情请查看日志记录。");
        }
    }
    
}
