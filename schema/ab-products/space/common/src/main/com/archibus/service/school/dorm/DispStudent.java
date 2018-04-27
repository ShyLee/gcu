package com.archibus.service.school.dorm;

import java.io.InputStream;
import java.util.*;

import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.importexport.filebuilder.ImportExportFileBase;
import com.archibus.ext.report.xls.XlsBuilder;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.ExceptionBase;

public class DispStudent extends DormTransfer {
    public void insertDispNewData(final String stu_no, final String mark, final String disp_main,
            final String disp_detail, final String date_disp, final String comments) {
        
        final String sql =
                "insert into sc_stu_disp_log (stu_no,stu_name,stu_sex,stu_in_year,dv_id,pro_id,bl_id,fl_id,rm_id,mark,disp_main,disp_detail,date_disp,comments) select stu_no,stu_name,stu_sex,stu_in_year,dv_id,pro_id,bl_id,fl_id,rm_id,'"
                        + mark
                        + "','"
                        + disp_main
                        + "','"
                        + disp_detail
                        + "',to_date('"
                        + date_disp
                        + "','yyyy-MM-dd'),'"
                        + comments
                        + "' from sc_student where stu_no='" + stu_no + "'";
        SqlUtils.executeUpdate("sc_stu_disp_log", sql);
        SqlUtils.commit();
        
    }
    
    /**
     * 学生违纪奖励批量导入
     * 
     * @param serverFileName
     * @param format
     * @param inputStream
     * @return
     * @throws ExceptionBase
     */
    public List<HashMap<String, Object>> importNewData(final String serverFileName,
            final String format, final InputStream inputStream) throws ExceptionBase {
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
            
            try {
                final boolean flag = insertNewData(map);
                if (!flag) {
                    FailRecords.add(map);
                }
                
            } catch (final ExceptionBase e) {
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
    
    public boolean insertNewData(final HashMap<String, Object> map) {
        final boolean flag = true;
        final String stu_no = map.get("stu_no").toString();
        final String stu_name_excel = map.get("stu_name").toString();
        String stu_name = "";
        String stu_in_year = "";
        String stu_sex = "";
        String stu_dv = "";
        String bl_id = "";
        String fl_id = "";
        String rm_id = "";
        Object bl_id_old = "";
        String stu_pro = "";
        if (stu_no != "") {
            final DataRecord record = getStuInfo(stu_no);
            if (record == null) {
                this.status.addPartialResult(new JobResult("学号[" + stu_no + "]在系统中不存在"));
                return false;
            }
            if (!record.toString().equals("")) {
                stu_name = record.getValue("sc_student.stu_name").toString();
                stu_in_year = record.getValue("sc_student.stu_in_year").toString();
                stu_sex = record.getValue("sc_student.stu_sex").toString();
                stu_dv = record.getValue("sc_student.dv_id").toString();
                stu_pro = record.getValue("sc_student.pro_id").toString();
                bl_id_old = record.getValue("sc_student.bl_id");
                if (bl_id_old == null) {
                    this.status.addPartialResult(new JobResult("学号[" + stu_no + "]的学生没有入住信息"));
                    return false;
                } else {
                    bl_id = bl_id_old.toString();
                }
                fl_id = record.getValue("sc_student.fl_id").toString();
                rm_id = record.getValue("sc_student.rm_id").toString();
                
                if (!stu_name.equals(stu_name_excel)) {
                    this.status.addPartialResult(new JobResult("学号[" + stu_no + "]的姓名["
                            + stu_name_excel + "]与系统中的不一致，系统中为[" + stu_name + "]"));
                    return false;
                }
            }
        } else {
            this.status.addPartialResult(new JobResult("学号[" + stu_no + "]在系统中不存在"));
            return false;
        }
        final String typeValue = map.get("disp_type").toString();
        String type = "0";
        if (typeValue.equals("违纪")) {
            type = "1";
        } else if (typeValue.equals("奖励")) {
            type = "2";
        }
        final String dispMainValue = map.get("disp_main").toString();
        final String disp_main = getDispMain(dispMainValue);
        final String disp_detail = map.get("disp_detail").toString();
        final String date_disp = map.get("disp_date").toString();
        final String comments = map.get("comments").toString();
        
        final StringBuffer sql = new StringBuffer();
        sql.append(" INSERT INTO sc_stu_disp_log (stu_no,stu_name,stu_sex,stu_in_year,dv_id,bl_id,fl_id,rm_id,pro_id,mark,disp_main,disp_detail,date_disp,comments) VALUES (");
        sql.append(" '" + stu_no + "',");
        sql.append(" '" + stu_name + "',");
        sql.append(" '" + stu_sex + "',");
        sql.append(" '" + stu_in_year + "',");
        sql.append(" '" + stu_dv + "',");
        sql.append(" '" + bl_id + "',");
        sql.append(" '" + fl_id + "',");
        sql.append(" '" + rm_id + "',");
        sql.append(" '" + stu_pro + "',");
        sql.append(" '" + type + "',");
        sql.append(" '" + disp_main + "',");
        sql.append(" '" + disp_detail + "',");
        sql.append(" to_date('" + date_disp + "','YYYY-MM-dd'),");
        sql.append(" '" + comments + "')");
        SqlUtils.executeUpdate("sc_stu_disp_log", sql.toString());
        SqlUtils.commit();
        return flag;
    }
    
    /**
     * 根据学生 学号 获取学生的其他基本信息：入学年份、姓名、性别、院系、专业
     * 
     * @param stuNo 学号
     * @return
     */
    public DataRecord getStuInfo(final String stuNo) {
        final String sql =
                "select stu_no,stu_in_year,stu_name,stu_sex,dv_id,bl_id,fl_id,rm_id,pro_id from sc_student where stu_no='"
                        + stuNo + "'";
        final String[] flds =
                { "stu_no", "stu_in_year", "stu_name", "stu_sex", "dv_id", "bl_id", "fl_id",
                        "rm_id", "pro_id" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_student", flds, sql);
        DataRecord record = new DataRecord();
        if (records.size() != 0) {
            record = records.get(0);
            return record;
        } else {
            return null;
        }
        
    }
    
    public String getDispMain(final String dispMainValue) {
        final String sql =
                "select disp_main from sc_stu_disp_main where disp_name like '%" + dispMainValue
                        + "%'";
        final String[] flds = { "disp_main" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_stu_disp_main", flds, sql);
        String dispMain = "";
        if (records.size() > 0 && records.size() < 2) {
            dispMain = records.get(0).getValue("sc_stu_disp_main.disp_main").toString();
        }
        return dispMain;
    }
    
    /*
     * 不熄灯批量导入
     */
    
    public List<HashMap<String, Object>> importNewLightData(final String serverFileName,
            final String format, final InputStream inputStream) throws ExceptionBase {
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
            
            try {
                final boolean flag = insertNewLightData(map);
                if (!flag) {
                    FailRecords.add(map);
                }
                
            } catch (final ExceptionBase e) {
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
    
    public boolean insertNewLightData(final HashMap<String, Object> map) {
        final boolean flag = true;
        final String fl_id_excel = map.get("fl_id").toString();
        
        final String nameExcel = map.get("name").toString();
        final DataRecord blRecord = getBlNo(nameExcel);
        if (blRecord == null) {
            this.status.addPartialResult(new JobResult("宿舍楼[" + nameExcel + "]不存在"));
            return false;
        }
        final String bl_id_excel = blRecord.getValue("bl.bl_id").toString();
        
        final String rm_id = map.get("rm_id").toString();
        String stu_in_year = "";
        String bl_id = "";
        String fl_id = "";
        String dv_id = "";
        if (rm_id != "") {
            final DataRecord record = getRmInfo(rm_id, bl_id_excel, fl_id_excel);
            if (!(record == null)) {
                bl_id = record.getValue("rm.bl_id").toString();
                fl_id = record.getValue("rm.fl_id").toString();
                
                final Object dv_id_last = record.getValue("rm.dv_id");
                if (dv_id_last != null) {
                    dv_id = dv_id_last.toString();
                } else {
                    this.status.addPartialResult(new JobResult("宿舍楼-楼层-房间号为[" + bl_id_excel + "-"
                            + fl_id_excel + "-" + rm_id + "]的院系不存在"));
                    return false;
                }
                
                if (!bl_id_excel.equals(bl_id)) {
                    this.status.addPartialResult(new JobResult("宿舍楼[" + nameExcel + "]的id["
                            + bl_id_excel + "]与系统中的不符，应该为[" + bl_id + "]"));
                    return false;
                }
                final Object stu_in_year_last = record.getValue("rm.stu_in_year");
                if (stu_in_year_last != null) {
                    stu_in_year = stu_in_year_last.toString();
                } else {
                    this.status.addPartialResult(new JobResult("宿舍楼-楼层-房间号为[" + bl_id_excel + "-"
                            + fl_id_excel + "-" + rm_id + "]的年级不存在"));
                    return false;
                }
                
            } else if (record == null) {
                this.status.addPartialResult(new JobResult("宿舍楼-楼层-房间号为[" + bl_id_excel + "-"
                        + fl_id_excel + "-" + rm_id + "]的房间在系统中的不存在"));
                return false;
            }
            
        } else {
            return true;
        }
        final String dispMainValue = map.get("disp_main").toString();
        final String disp_main = getLightDispMain(dispMainValue);
        final String disp_detail = map.get("disp_detail").toString();
        final String date_disp = map.get("disp_date").toString();
        final String comments = map.get("comments").toString();
        
        final StringBuffer sql = new StringBuffer();
        sql.append(" INSERT INTO sc_stu_disp_log (stu_in_year,dv_id,bl_id,fl_id,rm_id,mark,disp_main,disp_detail,date_disp,comments) VALUES (");
        sql.append(" '" + stu_in_year + "',");
        sql.append(" '" + dv_id + "',");
        sql.append(" '" + bl_id + "',");
        sql.append(" '" + fl_id + "',");
        sql.append(" '" + rm_id + "',");
        sql.append(" '1',");
        sql.append(" '" + disp_main + "',");
        sql.append(" '" + disp_detail + "',");
        sql.append(" to_date('" + date_disp + "','YYYY-MM-dd'),");
        sql.append(" '" + comments + "')");
        SqlUtils.executeUpdate("sc_stu_disp_log", sql.toString());
        SqlUtils.commit();
        return flag;
    }
    
    /**
     * 根据学生 学号 获取学生的其他基本信息：入学年份、姓名、性别、院系、专业
     * 
     * @param stuNo 学号
     * @return
     */
    
    public DataRecord getRmInfo(final String rmId, final String blId, final String flId) {
        final String sql =
                "select bl_id,fl_id,dv_id,stu_in_year from rm where rm_id='" + rmId
                        + "' and fl_id='" + flId + "' and bl_id='" + blId + "'";
        final String[] flds = { "bl_id", "fl_id", "dv_id", "stu_in_year" };
        final List<DataRecord> records = SqlUtils.executeQuery("rm", flds, sql);
        DataRecord record = new DataRecord();
        if (records.size() != 0) {
            record = records.get(0);
            return record;
        } else {
            return null;
        }
        
    }
    
    public DataRecord getBlNo(final String name) {
        final String sql = "select bl_id from bl where name='" + name + "'";
        final String[] flds = { "bl_id" };
        final List<DataRecord> records = SqlUtils.executeQuery("bl", flds, sql);
        DataRecord record = new DataRecord();
        if (records.size() != 0) {
            record = records.get(0);
            return record;
        } else {
            return null;
        }
    }
    
    public String getLightDispMain(final String dispMainValue) {
        final String sql =
                "select disp_main from sc_stu_disp_main where disp_name like '%" + dispMainValue
                        + "%'";
        final String[] flds = { "disp_main" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_stu_disp_main", flds, sql);
        String dispMain = "";
        if (records.size() > 0 && records.size() < 2) {
            dispMain = records.get(0).getValue("sc_stu_disp_main.disp_main").toString();
        }
        return dispMain;
    }
    
}
