package com.archibus.service.school.dorm;

import java.io.InputStream;
import java.util.*;

import com.archibus.datasource.SqlUtils;
import com.archibus.ext.importexport.filebuilder.ImportExportFileBase;
import com.archibus.ext.report.xls.XlsBuilder;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.ExceptionBase;

public class ImportStudentService extends DormTransfer {
    
    public List<HashMap<String, Object>> importData(final String serverFileName,
            final String format, final InputStream inputStream) {
        
        final ImportExportFileBase xlsBuilder = getXLSBuilder(serverFileName, format, inputStream);
        
        XlsBuilder.FileFormatType.fromString(format);
        if (xlsBuilder.getLastRowIndex() < 1) {
            throw new ExceptionBase(String.format("导入文件表中没有数据，请检查!"));
        }
        this.status.setTotalNumber(xlsBuilder.getLastRowIndex());
        final List<String> fieldName = getFieldName(xlsBuilder);
        final List<HashMap<String, Object>> actualRecords = getRecords(xlsBuilder, fieldName);
        final List<HashMap<String, Object>> FailRecords = new ArrayList<HashMap<String, Object>>();
        
        // 检查文件中是否记录
        if (xlsBuilder.getLastRowIndex() < 1) {
            throw new ExceptionBase(String.format("导入文件表中没有数据，请检查!"));
        }
        final int count = actualRecords.size();
        String message = "本次更新数据" + count + "条";
        for (int i = 0; i < actualRecords.size(); i++) {
            final HashMap<String, Object> map = actualRecords.get(i);
            final String stu_no = map.get("stu_no").toString();
            final boolean flag1 = new CheckImportData().isExistedStu(stu_no);
            
            final boolean flag2 = this.updateStuInfo(map, stu_no, flag1);
            if (!flag2) {
                FailRecords.add(map);
            }
            
        }
        
        final int count_fail = FailRecords.size();
        final int count_succ = count - count_fail;
        if (count_fail > 0) {
            message = message + ",更新成功的数据有" + count_succ + "条,更新失败的数据有" + count_fail + "条";
            this.status.addPartialResult(new JobResult("消息： " + message));
        } else {
            this.status.addPartialResult(new JobResult("消息：" + message));
        }
        return FailRecords;
        
    }
    
    // 更新sc_student数据
    private boolean updateStuInfo(final HashMap<String, Object> map, final String stu_no,
            final boolean flag1) {
        final boolean flag2 = true;
        final String stu_name = map.get("stu_name").toString();
        final String year = map.get("stu_in_year").toString();
        final String stuSex = map.get("stu_sex").toString();
        String stu_sex = "0";
        if (stuSex.equals("男")) {
            stu_sex = "1";
        } else if (stuSex.equals("女")) {
            stu_sex = "2";
        }
        final String dv_name = map.get("stu_dv").toString();
        
        final String pro_name = map.get("stu_pro").toString();
        final String status = "1";
        /*
         * final String bl_id = map.get("bl_id").toString(); final String fl_id =
         * map.get("fl_id").toString(); final String rm_id = map.get("rm_id").toString();
         */
        final String phone = map.get("phone").toString();
        final String telephone = map.get("telephone").toString();
        final String comments = map.get("comments").toString();
        // 调用方法根据pro_name 取得pro_id,dv_id
        final CheckImportData cid = new CheckImportData();
        final String dv_id = cid.getDvId(dv_name);
        if (dv_id.equals("")) {
            this.status.addPartialResult(new JobResult("学生[" + stu_no + "]的院系[" + dv_name
                    + "]在系统中的不存在"));
            return false;
        }
        final String pro_id = cid.getProId(pro_name);
        if (pro_id.equals("")) {
            this.status.addPartialResult(new JobResult("学生[" + stu_no + "]的专业[" + pro_name
                    + "]在系统中的不存在"));
            return false;
        }
        final List recordsDvPro = cid.checkDvPro(pro_name, dv_name);
        if (!(recordsDvPro.size() > 0)) {
            this.status.addPartialResult(new JobResult("学生[" + stu_no + "]的院系[" + dv_name + "]和专业["
                    + pro_name + "]在系统中的不对应"));
            return false;
        }
        // 调用方法根据rm_id 取得bl_id,fl_id
        /*
         * final List recordsRm = cid.checkFlBlRm(bl_id, fl_id, rm_id); if (!(recordsRm.size() > 0))
         * { this.status.addPartialResult(new JobResult("学生[" + stu_no + "]的[宿舍楼-楼层-房间号]为[" + bl_id
         * + "-" + fl_id + "-" + rm_id + "]的房间在系统中的不存在")); return false; }
         */
        String sql = "";
        try {
            if (flag1) {
                sql =
                        "UPDATE sc_student SET stu_name='" + stu_name + "',stu_sex='" + stu_sex
                                + "',dv_id='" + dv_id + "',dv_name='" + dv_name + "',pro_id='"
                                + pro_id + "',pro_name='" + pro_name + "',stu_in_year='" + year
                                + "',telephone='" + telephone + "',phone='" + phone + "',status='"
                                + status + "',comments='" + comments + "' WHERE stu_no='" + stu_no
                                + "'";
                SqlUtils.executeUpdate("sc_student", sql);
            } else {
                sql =
                        "INSERT INTO sc_student(stu_no,stu_name,stu_sex,dv_id,dv_name,pro_id,pro_name,stu_in_year,telephone,phone,status,bl_id,fl_id,rm_id,comments) VALUES('"
                                + stu_no
                                + "','"
                                + stu_name
                                + "','"
                                + stu_sex
                                + "','"
                                + dv_id
                                + "','"
                                + dv_name
                                + "','"
                                + pro_id
                                + "','"
                                + pro_name
                                + "','"
                                + year
                                + "','"
                                + telephone
                                + "','"
                                + phone
                                + "','"
                                + status
                                + "','"
                                + comments + "')";
                SqlUtils.executeUpdate("sc_student", sql);
            }
        } catch (final Exception e) {
            this.log.info("[SC_STUDENT SQL String]：" + sql.toString());
            this.log.error("更新学生表失败！[message]:" + e.toString());
        }
        SqlUtils.commit();
        return flag2;
        
    }
    
}
