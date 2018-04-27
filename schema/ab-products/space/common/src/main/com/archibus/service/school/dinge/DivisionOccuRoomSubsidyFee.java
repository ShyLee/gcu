package com.archibus.service.school.dinge;

import java.util.*;

import org.apache.log4j.Logger;
import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.Common;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.service.school.UpdateSchoolArea;
import com.archibus.service.school.tools.SchTools;
import com.archibus.utility.*;

public class DivisionOccuRoomSubsidyFee extends EventHandlerBase {
    
    protected static Logger Classlog = Logger.getLogger(DivisionOccuRoomSubsidyFee.class);
    
    /**
     * 
     */
    
    public static void calcDivisionMonthSubsidy() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // 1判断日期是否到了月末，因为是定时执行，没到月末，就不执行下面的代码
        final int year = DateTime.getYear(Utility.currentDate());
        final int month = Integer.parseInt(SchTools.getISOMonth());
        
        if (Classlog.isDebugEnabled()) {
            Classlog.debug("calcDivisionMonthSubsidy--" + year + "--" + month);
        }
        
        final Calendar c = Calendar.getInstance();
        if (todayIsCurMonthEnd(c)) {
            if (Classlog.isDebugEnabled()) {
                Classlog.debug("calcDivisionMonthSubsidy : today is the end day of current month");
            }
            // 2执行数据汇总程序（面积数据和数量数据）
            executeUpdateAreaAndCount();
            
            if (Classlog.isDebugEnabled()) {
                Classlog.debug("end executeUpdateAreaAndCount");
            }
            // 3创建主表记录，如有记录，则先删除掉
            createDvMonthSubsidyMain(year, month);
            
            if (Classlog.isDebugEnabled()) {
                Classlog.debug("end createDvMonthSubsidyMain");
            }
            // 4创建细表记录，如有记录，则先删除掉
            createDvMonthSubsidyDetail(context, year, month);
            
            if (Classlog.isDebugEnabled()) {
                Classlog.debug("end createDvMonthSubsidyDetail");
            }
            // 5根据细表记录，修改主表字段“补贴标准（加权平均），补贴金额”
            updateDvMonthSubsidyMain(year, month);
            
            if (Classlog.isDebugEnabled()) {
                Classlog.debug("end updateDvMonthSubsidyMain");
            }
        }
        
        Classlog.info("calulateDvRmSubsidyMon rule called at " + new Date());
        
    }
    
    /**
     * 初始化使用单位每月补贴主表信息
     * 
     * @param year
     * @param month
     */
    private static void createDvMonthSubsidyMain(final int year, final int month) {
        // Step1 -- Delete the records of this month in the table sc_de_subsidy_dv_main
        String sql =
                "DELETE FROM sc_de_subsidy_dv_main d WHERE d.year=" + year + " AND d.month= "
                        + month;
        
        SqlUtils.executeUpdate("sc_de_subsidy_dv_main", sql);
        SqlUtils.commit();
        
        if (Classlog.isDebugEnabled()) {
            Classlog.debug("insertSql = [ " + sql + "]");
        }
        
        sql =
                "insert into sc_de_subsidy_dv_main(dv_id,year,month,area_dinge_total,area_rm_net,area_yuanshi) select dv_id, "
                        + year
                        + ","
                        + month
                        + ",area_dinge_total,area_rm_net,area_yuanshi from dv where not dv_id in('wu','school')";
        
        SqlUtils.executeUpdate("sc_de_subsidy_dv_main", sql);
        SqlUtils.commit();
        
        if (Classlog.isDebugEnabled()) {
            Classlog.debug("insertSql = [ " + sql + "]");
        }
    }
    
    /**
     * 
     * @param year
     * @param month
     */
    private static void createDvMonthSubsidyDetail(final EventHandlerContext context,
            final int year, final int month) {
        // Step1 -- Delete the records of this month in the table sc_de_subsidy_dv_detail
        final String sql =
                "DELETE FROM sc_de_subsidy_dv_detail d WHERE d.year=" + year + " AND d.month= "
                        + month;
        
        SqlUtils.executeUpdate("sc_de_subsidy_dv_detail", sql);
        SqlUtils.commit();
        
        if (Classlog.isDebugEnabled()) {
            Classlog.debug("insertSql = [ " + sql + "]");
        }
        
        // Step2 --
        final DataSource dvDS =
                DataSourceFactory.createDataSourceForFields("dv", new String[] { "dv_id",
                        "area_dinge_total", "area_rm_net", "area_yuanshi" });
        
        List<DataRecord> dvRecords = null;
        dvRecords = dvDS.getRecords(" not dv_id in('wu','school') ");
        for (final DataRecord dvRecord : dvRecords) {
            updateDvMonthSubsidyDetail(context, dvRecord, year, month);
        }
        
    }
    
    /**
     * 汇总该使用单位在各个建筑年代的补贴面积，补贴标准，补贴金额
     * 
     * @param dvRecord
     * @param year
     * @param month
     */
    private static void updateDvMonthSubsidyDetail(final EventHandlerContext context,
            final DataRecord dvRecord, final int year, final int month) {
        // 使用单位
        final String dv_id = dvRecord.getString("dv.dv_id");
        
        if (Classlog.isDebugEnabled()) {
            Classlog.debug("dv_id = [ " + dv_id + "]");
        }
        
        // 得出补贴面积=定额面积+院士等面积
        final Double area_butie =
                Double.parseDouble(dvRecord.getValue("dv.area_dinge_total").toString())
                        + Double.parseDouble(dvRecord.getValue("dv.area_yuanshi").toString());
        
        // 得出净使用面积
        final Double area_rm_net =
                Double.parseDouble(dvRecord.getValue("dv.area_rm_net").toString());
        
        if (Classlog.isDebugEnabled()) {
            Classlog.debug(dv_id + " Susidy Area = [ " + area_butie + "], net room area =["
                    + area_rm_net + "]");
        }
        
        // 得出净使用面积与补贴面积的差额
        final Double area_diff = area_rm_net - area_butie;
        
        final String sql =
                " select rm.dv_id, bl.option1 as subsidy_year,d.subsidy_std as subsidy_std, sum(rm.area) as area_shiyong "
                        + " from bl,rm,sc_de_subsidy_std d,dv where rm.bl_id=bl.bl_id and bl.option1 = d.bl_year "
                        + " and rm.dv_id = dv.dv_id and bl.acc_type!='yxz' and rm.dv_id="
                        + literal(context, dv_id)
                        + " group by rm.dv_id,bl.option1,d.subsidy_std  "
                        + " order by rm.dv_id,d.subsidy_std desc ";
        
        final JSONArray records = toJSONArray(retrieveDbRecords(context, sql));
        
        String insertSql = "";
        if (area_diff > 0) {
            // 如果实际使用面积大于补贴面积，则先补贴老建筑，即补贴年代依次为“60年代及以前”、“70年代”、“80年代”、“90年代”、“2000年及以后”，直到补贴面积补完为止。
            // 临时变量
            Double temp_area_butie = area_butie;
            
            for (int i = 0; i < records.length(); i++) {
                if (temp_area_butie == 0) {
                    // 退出循环
                    break;
                }
                
                final JSONObject dvBlYearRecord = records.getJSONObject(i);
                final Double area_shiyong_dv_years =
                        Double.parseDouble(dvBlYearRecord.getString("area_shiyong"));
                final int subsidy_std = dvBlYearRecord.getInt("subsidy_std");
                final String subsidyYear = dvBlYearRecord.getString("subsidy_year");
                
                // 如果剩余应补贴面积 大于等于 该使用单位在这个建筑年代的实际使用面积，则该建筑年代的补贴面积为实际使用面积
                if (Classlog.isDebugEnabled()) {
                    Classlog.debug("temp_area_butie = [ " + temp_area_butie
                            + "],area_shiyong_dv_years = [" + area_shiyong_dv_years + "]");
                }
                
                if (temp_area_butie >= area_shiyong_dv_years) {
                    insertSql =
                            "Insert into  sc_de_subsidy_dv_detail(dv_id,year,month,bl_year,subsidy_std,area_shiyong,area_butie,subsidy_money)"
                                    + " values("
                                    + literal(context, dv_id)
                                    + ","
                                    + year
                                    + ","
                                    + month
                                    + ","
                                    + literal(context, subsidyYear)
                                    + ","
                                    + subsidy_std
                                    + ","
                                    + area_shiyong_dv_years
                                    + ","
                                    + area_shiyong_dv_years
                                    + ","
                                    + area_shiyong_dv_years
                                    * subsidy_std + ")";
                    
                    SqlUtils.executeUpdate("sc_de_subsidy_dv_detail", insertSql);
                    SqlUtils.commit();
                    
                    if (Classlog.isDebugEnabled()) {
                        Classlog.debug("insertSql = [ " + insertSql + "]");
                    }
                    
                    // 更新临时变量
                    temp_area_butie = temp_area_butie - area_shiyong_dv_years;
                    
                } else {
                    // 如果剩余应补贴面积 小于 该使用单位在这个建筑年代的实际使用面积，则该建筑年代的补贴面积为剩余应补贴面积
                    insertSql =
                            "Insert into  sc_de_subsidy_dv_detail (dv_id,year,month,bl_year,subsidy_std,area_shiyong,area_butie,subsidy_money)"
                                    + " values("
                                    + literal(context, dv_id)
                                    + ","
                                    + year
                                    + ","
                                    + month
                                    + ","
                                    + literal(context, subsidyYear)
                                    + ","
                                    + subsidy_std
                                    + ","
                                    + area_shiyong_dv_years
                                    + ","
                                    + temp_area_butie + "," + temp_area_butie * subsidy_std + ")";
                    
                    SqlUtils.executeUpdate("sc_de_subsidy_dv_detail", insertSql);
                    SqlUtils.commit();
                    
                    if (Classlog.isDebugEnabled()) {
                        Classlog.debug("insertSql = [ " + insertSql + "]");
                    }
                    
                    // 更新临时变量
                    temp_area_butie = 0.0;
                    
                }
                
            }
        } else {
            // 如果实际使用面积小于补贴面积，则将dvBlYearRecords的记录全部写入sc_de_subsidy_dv_detail表，并
            // 将差额面积area_diff默认按照“80年代”补贴，及补贴标准为每平米每月10元
            // 补贴全部实际使用面积
            insertSql =
                    "Insert into  sc_de_subsidy_dv_detail (dv_id,year,month,bl_year,subsidy_std,area_shiyong,area_butie,subsidy_money)"
                            + " select  rm.dv_id,"
                            + year
                            + ","
                            + month
                            + ", bl.option1,d.subsidy_std, sum(rm.area) as area_shiyong, sum(rm.area) as area_butie, sum(rm.area) * subsidy_std"
                            + " from bl,rm,sc_de_subsidy_std d,dv where rm.bl_id=bl.bl_id and bl.option1 = d.bl_year "
                            + " and rm.dv_id = dv.dv_id and bl.acc_type!='yxz' and rm.dv_id="
                            + literal(context, dv_id)
                            + " group by rm.dv_id,bl.option1,d.subsidy_std "
                            + " order by rm.dv_id,d.subsidy_std desc ";
            
            SqlUtils.executeUpdate("sc_de_subsidy_dv_detail", insertSql);
            SqlUtils.commit();
            
            if (Classlog.isDebugEnabled()) {
                Classlog.debug("insertSql = [ " + insertSql + "]");
            }
            
            if (area_diff < 0) {
                final String defaultSubsidyYear = "80年代";
                
                if (Classlog.isDebugEnabled()) {
                    Classlog.debug("defaultSubsidyYear = [ " + defaultSubsidyYear + "]");
                }
                
                final int defaultSubsidyRate = getDefaultSubsidyRate(defaultSubsidyYear);
                final Double lack_subsidy_money = Math.abs(area_diff * defaultSubsidyRate);
                
                if (existsDvSubsidyData(context, dv_id, defaultSubsidyYear, year, month)) {
                    
                    final String updateSql =
                            " update sc_de_subsidy_dv_detail set area_butie=area_butie+"
                                    + Math.abs(area_diff) + ", subsidy_money=subsidy_money+"
                                    + lack_subsidy_money + ",is_lack_subsidy=1" + " where dv_id="
                                    + literal(context, dv_id) + " and year=" + year + " and month="
                                    + month + " and bl_year like '%" + defaultSubsidyYear + "%'";
                    
                    SqlUtils.executeUpdate("sc_de_subsidy_dv_detail", updateSql);
                    SqlUtils.commit();
                    
                    if (Classlog.isDebugEnabled()) {
                        Classlog.debug("updateSql = [ " + updateSql + "]");
                    }
                } else {
                    // 差额面积补贴
                    
                    insertSql =
                            " insert into sc_de_subsidy_dv_detail(dv_id,year,month,bl_year,subsidy_std,area_shiyong,area_butie,subsidy_money,is_lack_subsidy)"
                                    + " values("
                                    + literal(context, dv_id)
                                    + ","
                                    + year
                                    + ","
                                    + month
                                    + ","
                                    + literal(context, defaultSubsidyYear)
                                    + ","
                                    + defaultSubsidyRate
                                    + ",0,"
                                    + Math.abs(area_diff)
                                    + ","
                                    + lack_subsidy_money + ", 1)";
                    
                    SqlUtils.executeUpdate("sc_de_subsidy_dv_detail", insertSql);
                    SqlUtils.commit();
                    
                    if (Classlog.isDebugEnabled()) {
                        Classlog.debug("updateSql = [ " + insertSql + "]");
                    }
                }
            }
            
        }
        
    }
    
    /**
     * 
     * @param dvId
     * @param defaultSubsidyYear
     * @param year
     * @param month
     * @return
     */
    private static boolean existsDvSubsidyData(final EventHandlerContext context,
            final String dvId, final String defaultSubsidyYear, final int year, final int month) {
        final String sql =
                "select 1 from sc_de_subsidy_dv_detail where dv_id=" + literal(context, dvId)
                        + " and year=" + year + " and month=" + month + " and bl_year like '%"
                        + defaultSubsidyYear + "%'";
        final List records = retrieveDbRecords(context, sql);
        if (records.isEmpty()) {
            return false;
        } else {
            return true;
        }
    }
    
    /**
     * 更新sc_de_subsidy_dv_main数据表，“补贴标准（加权平均）”，“应得补贴数”
     * 
     * @param year
     * @param month
     */
    private static void updateDvMonthSubsidyMain(final int year, final int month) {
        // 应得补贴数
        String updateSql =
                "update sc_de_subsidy_dv_main set subsidy_money = (select nvl(sum(subsidy_money),0) from sc_de_subsidy_dv_detail d "
                        + " where d.dv_id =sc_de_subsidy_dv_main.dv_id "
                        + " and d.year= sc_de_subsidy_dv_main.year "
                        + " and d.month =sc_de_subsidy_dv_main.month)";
        
        SqlUtils.executeUpdate("sc_de_subsidy_dv_main", updateSql);
        SqlUtils.commit();
        
        if (Classlog.isDebugEnabled()) {
            Classlog.debug("update dv subsidy money:[" + updateSql + "]");
        }
        
        // 补贴标准（加权平均）--会发生
        updateSql =
                "update sc_de_subsidy_dv_main set subsidy_std = CASE WHEN ( area_dinge_total + area_yuanshi ) =0  "
                        + " THEN 0 ELSE subsidy_money/ ( area_dinge_total + area_yuanshi )  END where year="
                        + year + " and month=" + month;
        
        SqlUtils.executeUpdate("sc_de_subsidy_dv_main", updateSql);
        SqlUtils.commit();
        
        if (Classlog.isDebugEnabled()) {
            Classlog.debug("update dv subsidy standard:[" + updateSql + "]");
        }
        
    }
    
    /**
     * get the default subsidy rate from standard rate table
     * 
     * @param defaultSubsidyYear
     * @return
     */
    private static int getDefaultSubsidyRate(final String defaultSubsidyYear) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final Object subsidyStdRec =
                Common.getValue(context, "sc_de_subsidy_std", "subsidy_std", "bl_year like '%"
                        + defaultSubsidyYear + "%'");
        
        int defaultSubsidyRate = 10;
        if (subsidyStdRec != null) {
            defaultSubsidyRate = Integer.parseInt(subsidyStdRec.toString());
        }
        
        return defaultSubsidyRate;
    }
    
    /**
     * 计算使用单位的月度房产资源占用费 calcDivisionMonthPayFee
     */
    public static void calcDivisionMonthPayFee() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final int year = DateTime.getYear(Utility.currentDate());
        final int month = Integer.parseInt(SchTools.getISOMonth());
        
        if (Classlog.isDebugEnabled()) {
            Classlog.debug("calcDivisionMonthPayFee--" + year + "--" + month);
        }
        
        // 1判断日期是否到了月末，因为是定时执行，没到月末，就不执行下面的代码
        final Calendar c = Calendar.getInstance();
        if (todayIsCurMonthEnd(c)) {
            if (Classlog.isDebugEnabled()) {
                Classlog.debug("calcDivisionMonthPayFee : today is the end day of current month");
            }
            // 2执行数据汇总程序（面积数据和数量数据）
            executeUpdateAreaAndCount();
            
            if (Classlog.isDebugEnabled()) {
                Classlog.debug("end executeUpdateAreaAndCount");
            }
            
            // 3创建资源占用费细表数据sc_rmoccu_dv_fee_detail
            createDvMonthRmOccuFeeDetail(context, year, month);
            
            if (Classlog.isDebugEnabled()) {
                Classlog.debug("end createDvMonthRmOccuFeeDetail");
            }
            
            // 4判断时间是否是季度末，如果是才运行下面程序
            if (todayIsCurQuarterEnd(c)) {
                if (Classlog.isDebugEnabled()) {
                    Classlog
                        .debug("calcDivisionMonthPayFee : today is the end day of current quarter");
                }
                // 5创建sc_rmoccu_dv_fee_main 数据
                createDvQuarterRmOccuFeeData();
            }
        }
        
        Classlog.info("calulateDvRmOccuFeeMon rule called at " + new Date());
    }
    
    public static void executeUpdateAreaAndCount() {
        UpdateSchoolArea.updateArea();
        // UpdateSchoolCount.updateCount();
        CalculateDinge.calculateDivisionAreaNetShiYong();
    }
    
    /**
     * 创建资源占用费细表数据
     * 
     * @param context
     * @param year
     * @param month
     */
    private static void createDvMonthRmOccuFeeDetail(final EventHandlerContext context,
            final int year, final int month) {
        String sql =
                "DELETE FROM sc_rmoccu_dv_fee_detail WHERE year=" + year + " and month=" + month;
        SqlUtils.executeUpdate("sc_rmoccu_dv_fee_detail", sql);
        SqlUtils.commit();
        
        if (Classlog.isDebugEnabled()) {
            Classlog.debug("Delete the detail records of this month's room resource occu fee :["
                    + sql + "]");
        }
        
        final double dinge_fee_std =
                Double.parseDouble(Common.getValue(context, "sc_scmpref", "dinge_fee_std", "")
                    .toString());
        final double over_fee_std =
                Double.parseDouble(Common.getValue(context, "sc_scmpref", "over_fee_rate", "")
                    .toString()) * dinge_fee_std;
        sql =
                "Insert into sc_rmoccu_dv_fee_detail "
                        + "(dv_id,year,month,area_dinge_total,area_yuanshi,area_rm_net, dinge_fee_std , over_fee_std ,dinge_fee_money,over_fee_money )"
                        + " select dv_id,'"
                        + year
                        + "','"
                        + month
                        + "',area_dinge_total,area_yuanshi,area_rm_net,'"
                        + dinge_fee_std
                        + "','"
                        + over_fee_std
                        + "', (area_dinge_total+area_yuanshi)*"
                        + dinge_fee_std
                        + ",CASE WHEN (area_rm_net-(area_dinge_total+area_yuanshi)) >0 THEN (area_rm_net-(area_dinge_total+area_yuanshi)) * "
                        + over_fee_std + " ELSE 0  END FROM dv WHERE not dv_id in ('wu','school')";
        SqlUtils.executeUpdate("sc_rmoccu_dv_fee_detail", sql);
        SqlUtils.commit();
        
        if (Classlog.isDebugEnabled()) {
            Classlog.debug("Insert the detail records of this month's room resource occu fee :["
                    + sql + "]");
        }
    }
    
    /**
     * 判断当天是否为月末
     * 
     * @param c
     * @return
     */
    private static boolean todayIsCurMonthEnd(final Calendar c) {
        
        final int lastDay = c.getActualMaximum(Calendar.DAY_OF_MONTH);// 为月末
        final int now = c.get(Calendar.DAY_OF_MONTH);
        if (now == lastDay) {
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * 判断当天是否为季度末
     * 
     * @param c
     * @return
     */
    private static boolean todayIsCurQuarterEnd(final Calendar c) {
        final int month = Integer.parseInt(SchTools.getISOMonth());
        if (month == 3 || month == 6 || month == 9 || month == 12) {
            if (todayIsCurMonthEnd(c)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 创建sc_rmoccu_dv_fee_main 数据
     * 
     * @param context
     * @param year
     * @param month
     */
    public static void createDvQuarterRmOccuFeeData() {
        // EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final int year = DateTime.getYear(Utility.currentDate());
        final int month = Integer.parseInt(SchTools.getISOMonth());
        
        final int Qn = getQuarterByMonth(month);
        final String quarter = "Q" + Qn;
        final int[][] monthArr = { { 1, 2, 3 }, { 4, 5, 6 }, { 7, 8, 9 }, { 10, 11, 12 } };
        
        String sql =
                "DELETE FROM sc_rmoccu_dv_fee_main WHERE year=" + year + " and quarter='" + quarter
                        + "'";
        SqlUtils.executeUpdate("sc_rmoccu_dv_fee_main", sql);
        SqlUtils.commit();
        
        if (Classlog.isDebugEnabled()) {
            Classlog.debug("Delete the main record of this quarter's room resource occu fee :["
                    + sql + "]");
        }
        
        sql =
                " insert into sc_rmoccu_dv_fee_main (dv_id,year,quarter,dinge_fee_money,over_fee_money,fee_money_total,date_updated) "
                        + " select dv_id,year, '"
                        + quarter
                        + "',sum(dinge_fee_money) as dinge_fee_money, sum(over_fee_money) as over_fee_money,"
                        + "sum(dinge_fee_money+over_fee_money) as fee_money,sysdate "
                        + "from sc_rmoccu_dv_fee_detail where year='"
                        + year
                        + "' and month in ('"
                        + monthArr[Qn - 1][0]
                        + "', '"
                        + monthArr[Qn - 1][1]
                        + "','"
                        + monthArr[Qn - 1][2] + "') group by dv_id,year";
        SqlUtils.executeUpdate("sc_rmoccu_dv_fee_main", sql);
        SqlUtils.commit();
        
        if (Classlog.isDebugEnabled()) {
            Classlog.debug("Insert the main record of this quarter's room resource occu fee :["
                    + sql + "]");
        }
    }
    
    /**
     * 
     * @param month
     * @return
     */
    private static int getQuarterByMonth(final int month) {
        int Qn = 0;
        
        if (month >= 1 && month <= 3) {
            Qn = 1;
        } else if (month >= 4 && month <= 6) {
            Qn = 2;
        } else if (month >= 7 && month <= 9) {
            Qn = 3;
        } else if (month >= 10 && month <= 12) {
            Qn = 4;
        }
        
        return Qn;
    }
    
}
