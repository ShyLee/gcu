/**
 * 
 */
package com.archibus.service.school.equipment;

import java.io.InputStream;
import java.text.SimpleDateFormat;
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
public class EquipmentImport extends JobBaseService {
    
    EquipmentBudget equipmentBudget = new EquipmentBudget();
    
    /**
     * 导入预算，输入xls文件 导入预算时的表格为预算项表
     */
    public void equipmentBudgetTransferIn(final String serverFileName, final String format,
            final InputStream inputStream) {
        this.log.info("预算导入");
        try {
            final XlsBuilder xlsBuilder = getXLSBuilder(serverFileName, format, inputStream);
            XlsBuilder.FileFormatType.fromString(format);
            if (xlsBuilder.getLastRowIndex() < 1) {
                xlsBuilder.getLastRowIndex();
                throw new ExceptionBase(String.format("导入文件表中没有数据，请检查!"));
            }
            this.status.setTotalNumber(xlsBuilder.getLastRowIndex());
            final List<String> fieldName = getFieldName(xlsBuilder);
            final List<HashMap<String, Object>> records = getRecords(xlsBuilder, fieldName);
            
            final Date date = new Date();
            final String year = new SimpleDateFormat("yyyy").format(date);
            
            // 先删除原有的本年度预算
            this.equipmentBudget.deleteEqBudget(year);
            
            //
            eqBudgetImport(year, records);
            
            ContextStore.get().getEventHandlerContext();
            
            // printErrorRow();// 输出错误列表
        } catch (final ExceptionBase e) {
            System.out.println(e.toString());
        } catch (final Exception e) {
            System.out.println(e.toString());
        }
    }
    
    private void eqBudgetImport(final String year, final List<HashMap<String, Object>> records) {
        
        this.log.info("正在导入" + year + "年年度预算数据……");
        int budget_no = Integer.parseInt(year + "0000");// 预算编号为YS+年份+0001开始共10位
        final int max_id = this.equipmentBudget.getLastBudgetId(year);
        if (max_id > 0) {
            budget_no = max_id;
        }
        String budget_id = "";// 预算ID
        budget_id = "YS" + budget_no;
        // final int item_no = budget_no * 10;
        int missed = 0;
        
        int index = 4;// 第五行开始是数据，因此从行号从5开始。
        for (final HashMap<String, Object> record : records) {
            String dvId = "";
            String dpId = "";
            String dp_id_new = "";
            String budget_item_name = "";
            String name = "";
            
            index++;
            dvId = record.get("单位名称").toString();
            final String dv_id_new = this.equipmentBudget.getDvId(dvId);
            if (dv_id_new == "111") {
                this.status
                    .addPartialResult(new JobResult("第" + index + "行单位[" + dvId + "]在系统中不存在"));
                missed++;
                continue;
            }
            // budget_id = record.get("预算编号").toString();
            name = record.get("预算名称").toString();
            budget_item_name = record.get("预算项名称").toString();
            if (budget_item_name == null || budget_item_name == "") {
                this.status.addPartialResult(new JobResult("第" + index + "行预算项名称为空，导入失败"));
                missed++;
                continue;
            }
            dpId = record.get("部门名称").toString();
            if (dpId != null && dpId != "") {
                dp_id_new = this.equipmentBudget.getDpId(dv_id_new, dpId);
                if (dp_id_new == "111") {
                    this.status.addPartialResult(new JobResult("第" + index + "行部门[" + dpId
                            + "]在系统中不存在"));
                    missed++;
                    continue;
                }
            }
            
            final boolean is_exit =
                    this.equipmentBudget.getBudgetIdExit(budget_id, dv_id_new, dp_id_new);
            if (is_exit) {
                // 如果当前的预算编码是否存在DB，存在则插入新的预算项，否则插入一条新预算。
                // 如果当前的单位名称等于上一条预算项的单位名称，则插入一条新预算项。
                budget_id = "YS" + budget_no;// 预算号不变
                try {
                    this.equipmentBudget.addEqBudgetItem(budget_id, record);
                } catch (final Exception e) {
                    this.status
                        .addPartialResult(new JobResult(dvId + " 预算项导入失败!(行号" + index + ")"));
                    missed++;
                }
                // 更新预算的预算总额
                if (!budget_id.equals("")) {
                    try {
                        this.equipmentBudget.updateEqBudget(budget_id);
                    } catch (final Exception e) {
                        this.status
                            .addPartialResult(new JobResult("更新 " + budget_id + " 预算总金额失败！"));
                    }
                }
                
            } else {
                // 如果单位的名称不等于上一条预算项的单位名称，则先插入一条预算，再插入预算项。
                // 此处先统计更新上一条预算。更新上一条预算的条件是存在上一条预算。
                budget_no++;// 插入新的预算编号
                budget_id = "YS" + budget_no;
                try {
                    this.equipmentBudget.addEqBudget(year, dv_id_new, dp_id_new, budget_id, name,
                        record);
                } catch (final Exception e) {
                    this.status.addPartialResult(new JobResult(dvId + " 预算导入失败!(系统中未找到该单位)"));
                }
                try {
                    this.equipmentBudget.addEqBudgetItem(budget_id, record);
                } catch (final Exception e) {
                    this.status.addPartialResult(new JobResult(dvId + " 预算项导入失败!(行号" + index
                            + ")，请检查单位和部门是否正确对应"));
                    missed++;
                }
                // 更新预算的预算总额
                if (!budget_id.equals("")) {
                    try {
                        this.equipmentBudget.updateEqBudget(budget_id);
                    } catch (final Exception e) {
                        this.status
                            .addPartialResult(new JobResult("更新 " + budget_id + " 预算总金额失败！"));
                    }
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
