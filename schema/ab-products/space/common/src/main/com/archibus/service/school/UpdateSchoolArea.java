package com.archibus.service.school;

import java.math.*;

import com.archibus.datasource.*;
import com.archibus.eventhandler.EventHandlerBase;

public class UpdateSchoolArea extends EventHandlerBase {
    
    /**
     * The interface function,
     */
    public static void updateArea() {
        
        // update area of Location
        calculateGros();
        calculateAreaShiYong();
        
        // update gongtanlv
        calculateBlRates();
        
        // update the area and count room for rmcat
        updateRmcatArea();
        
        calculateDivisions();
        calculateDepartment();
        calculateBu();
        
        // 计算房间的建筑面积
        calculateAreaRoomJianzhu();
    }
    
    private static void calculateDepartment() {
        // COUNT area_rm of room in each dp
        new FieldOperation("dp", "rm").setAssignedRestriction(
            "rm.dp_id in('21','22') and rm.dv_id not in('03','06','39')").calculate("dp.area_rm",
            "SUM", "rm.area");
        
        // COUNT area_jianzhu of room in each dp
        new FieldOperation("dp", "rm").setAssignedRestriction(
            "rm.dp_id in('21','22') and rm.dv_id not in('03','06','39')").calculate(
            "dp.area_jianzhu", "SUM", "rm.area_comn_rm");
    }
    
    /**
     * SUM gross areas
     */
    private static void calculateGros() {
        // Sum EXTERNAL and INTERNAL gross areas from GROS to FL
        new FieldOperation("fl", "gros").setAssignedRestriction("gros.gros_type='EXT'").calculate(
            "fl.area_gross_ext", "SUM", "gros.area");
        
        new FieldOperation("fl", "gros").setAssignedRestriction("gros.gros_type='INT'").calculate(
            "fl.area_gross_int", "SUM", "gros.area");
        
        // Calculate EXTERIOR WALL area in FL
        new FieldFormula("fl").setAssignedRestriction("fl.area_gross_ext <> 0").calculate(
            "fl.area_ext_wall", "fl.area_gross_ext - fl.area_gross_int");
        new FieldFormula("fl").setAssignedRestriction("fl.area_gross_ext = 0").calculate(
            "fl.area_ext_wall", "0");
        
        // Sum EXTERNAL, INTERNAL, and EXT. WALL area from FL to BL
        new FieldOperation("bl", "fl")
            .addOperation("bl.area_gross_ext", "SUM", "fl.area_gross_ext")
            .addOperation("bl.area_gross_int", "SUM", "fl.area_gross_int")
            .addOperation("bl.area_ext_wall", "SUM", "fl.area_ext_wall").calculate();
        
        // Sum EXTERNAL, INTERNAL, and EXT. WALL area from BL to SITE
        new FieldOperation("site", "bl").setAssignedRestriction("bl.acc_type!='yxz'")
            .addOperation("site.area_gross_ext", "SUM", "bl.area_gross_ext")
            .addOperation("site.area_gross_int", "SUM", "bl.area_building_manual")
            .addOperation("site.area_ext_wall", "SUM", "bl.area_ext_wall")
            .addOperation("site.area_underground", "SUM", "bl.area_underground").calculate();
        
        // new FieldOperation("sc_school", "site").addOperation("sc_school.area_jianzhu", "SUM",
        // "site.area_gross_int");
    }
    
    /**
     * SUM Usable Area for FL,BL,SITE; Count numbers of floor in the building, this value is used
     * when calculate bl.gongtanlv
     */
    private static void calculateAreaShiYong() {
        // SUM Room Area from RM to FL
        new FieldOperation("fl", "rm").calculate("fl.area_usable", "SUM", "rm.area");
        
        // SUM Service area from RM to FL
        new FieldOperation("fl", "rm").setAssignedRestriction("rm.rm_cat='SERV'").calculate(
            "fl.area_serv", "SUM", "rm.area");
        
        new FieldFormula("fl").calculate("fl.area_rm", "fl.area_usable-fl.area_serv");
        
        // SUM Service Area from FL to BL
        new FieldOperation("bl", "fl").addOperation("bl.area_serv", "SUM", "fl.area_serv")
            .addOperation("bl.count_fl_ground", "COUNT", "fl.fl_id").calculate();
        
        // SUM room area from View--SC_VIEW_BLDVCAT to BL
        new FieldOperation("bl", "fl").calculate("bl.area_rm", "SUM", "fl.area_rm");
        
        // SUM room area from BL to SITE
        new FieldOperation("site", "bl").setAssignedRestriction("bl.acc_type!='yxz'")
            .addOperation("site.area_rm", "SUM", "bl.area_rm")
            .addOperation("site.area_serv", "SUM", "bl.area_serv").calculate();
        
        new FieldOperation("sc_school", "site")
            .addOperation("sc_school.area_shiyong", "SUM", "site.area_rm")
            .addOperation("sc_school.area_serv", "SUM", "site.area_serv").calculate();
        
        // Calculate common area of building
        new FieldFormula("bl").calculate("bl.area_bl_comn_gp",
            "bl.area_building_manual - bl.area_rm");
        
        new FieldOperation("site", "bl").setAssignedRestriction("bl.acc_type!='yxz'").calculate(
            "site.area_gp_comn", "SUM", "bl.area_bl_comn_gp");
        
        new FieldOperation("sc_school", "site").calculate("sc_school.area_comn", "SUM",
            "site.area_gp_comn");
        
        new FieldOperation("site", "bl").setAssignedRestriction("bl.acc_type!='yxz'").calculate(
            "site.area_jianzhu", "SUM", "bl.area_building_manual");
        
        new FieldOperation("sc_school", "site").calculate("sc_school.area_jianzhu", "SUM",
            "site.area_jianzhu");
    }
    
    /**
     * Calculate GongTanLv and share_serv_rate of BL
     */
    private static void calculateBlRates() {
        
        // Calculate GongTanLv of BL
        
        // new FieldFormula("bl").setAssignedRestriction(
        // "bl.count_fl_ground <> 0 and bl.area_building_manual <> 0").calculate("bl.gongtanlv",
        // "(bl.area_building_manual-bl.area_rm) / bl.area_building_manual");
        new FieldFormula("bl")
            .setAssignedRestriction(
                "bl.count_fl_ground <> 0 and bl.area_building_manual <> 0 and bl_id not in ('A01','A02','A03','A04','A05','A06', 'A07', 'A08', 'A09', 'A10','B01', 'B02', 'B03', 'B04', 'B05','B06', 'B07', 'B08')")
            .calculate("bl.gongtanlv",
                "(bl.area_building_manual-bl.area_rm) / bl.area_building_manual");
        
        // A1、A2、A3、A4、A5 计算一个公摊率
        final String sql1 =
                "update bl "
                        + "set gongtanlv = (select (sum(area_building_manual) - sum(area_rm)) /sum(area_building_manual) from bl where bl_id in ('A01', 'A02', 'A03', 'A04', 'A05'))"
                        + "where bl_id in ('A01', 'A02', 'A03', 'A04', 'A05')";
        SqlUtils.executeUpdate("bl", sql1);
        SqlUtils.commit();
        // A6、A7、A8、A9、A10 计算一个公摊率
        final String sql2 =
                "update bl "
                        + "set gongtanlv = (select (sum(area_building_manual) - sum(area_rm)) /sum(area_building_manual) from bl where bl_id in ('A06', 'A07', 'A08', 'A09', 'A10'))"
                        + "where bl_id in ('A06', 'A07', 'A08', 'A09', 'A10')";
        SqlUtils.executeUpdate("bl", sql2);
        SqlUtils.commit();
        // B1、B2、B3、B4、B5 计算一个公摊率
        final String sql3 =
                "update bl "
                        + "set gongtanlv = (select (sum(area_building_manual) - sum(area_rm)) /sum(area_building_manual) from bl where bl_id in ('B01', 'B02', 'B03', 'B04', 'B05'))"
                        + "where bl_id in ('B01', 'B02', 'B03', 'B04', 'B05')";
        SqlUtils.executeUpdate("bl", sql3);
        SqlUtils.commit();
        // B5、B6、B7计算一个公摊率
        final String sql4 =
                "update bl "
                        + "set gongtanlv = (select (sum(area_building_manual) - sum(area_rm)) /sum(area_building_manual) from bl where bl_id in ('B06', 'B07', 'B08'))"
                        + "where bl_id in ('B06', 'B07', 'B08')";
        SqlUtils.executeUpdate("bl", sql4);
        SqlUtils.commit();
        
        // Calculate share_serv_rate of BL
        new FieldFormula("bl").setAssignedRestriction(
            "bl.count_fl_ground <> 0 and bl.area_building_manual <> 0").calculate(
            "bl.share_serv_rate",
            "(bl.area_building_manual-bl.area_rm + bl.area_serv) / bl.area_building_manual");
        
        new FieldFormula("bl").setAssignedRestriction("bl.count_fl_ground = 0").calculate(
            "bl.share_serv_rate", "bl.gongtanlv");
    }
    
    /**
     * Update rmcat area and room count from VIEW--SC_VIEW_BLDVCAT
     */
    private static void updateRmcatArea() {
        
        // SUM AREA and ROOM Count from SC_VIEW_BLDVCAT to RMCAT
        new FieldOperation("rmcat", "UIBE_RMCAT")
            .addOperation("rmcat.area", "SUM", "UIBE_RMCAT.area_shiyong")
            .addOperation("rmcat.area_jianzhu", "SUM", "UIBE_RMCAT.area_jianzhu")
            .addOperation("rmcat.tot_count", "SUM", "UIBE_RMCAT.count_rm").calculate();
        
        // SUM AREA and ROOM Count from RM to RMTYPE
        new FieldOperation("rmtype", "rm").addOperation("rmtype.area", "SUM", "rm.area")
            .addOperation("rmtype.tot_count", "COUNT", "rm.rm_id").calculate();
        
        // calculate area_avg
        new FieldFormula("rmcat").setAssignedRestriction("rmcat.tot_count <> 0").calculate(
            "rmcat.area_avg", "(rmcat.area) / rmcat.tot_count");
        
        new FieldFormula("rmtype").setAssignedRestriction("rmtype.tot_count <> 0").calculate(
            "rmtype.area_avg", "(rmtype.area) / rmtype.tot_count");
    }
    
    /**
     * update em.area_rm for emplyee's room change
     */
    public static void updateEmArea(final String blId, final String flId, final String rmId) {
        
        final String sql =
                " update em" + "                 set em.area_rm = (select (CASE"
                        + "                                            WHEN rm.count_em = 0 THEN"
                        + "                                             em.area_rm"
                        + "                                            else"
                        + "                                             rm.area"
                        + "                                          END) / (CASE"
                        + "                                            WHEN rm.count_em = 0 THEN"
                        + "                                             1"
                        + "                                            else"
                        + "                                             rm.count_em"
                        + "                                          END)"
                        + "                                     from rm"
                        + "                                    where rm.bl_id  = '" + blId + "'"
                        + "                                      and rm.fl_id  = '" + flId + "'"
                        + "                                      and rm.rm_id  = '" + rmId + "')";
        SqlUtils.executeUpdate("em", sql);
        SqlUtils.commit();
    }
    
    /**
     * Update dv.count_rm,dv.area_rm,dv.area_jianzhu from view
     */
    private static void calculateDivisions() {
        new FieldOperation("dv", "sc_view_bldvcat")
            .addOperation("dv.area_rm", "SUM", "sc_view_bldvcat.area_shiyong")
            .addOperation("dv.area_jianzhu", "SUM", "sc_view_bldvcat.area_jianzhu").calculate();
        new FieldFormula("dv")
            .setAssignedRestriction(
                "dv.bu_id in (SELECT bu_id FROM bu WHERE bu_class = 'JXKY') AND dv.count_em_adjust !=0")
            .calculate("dv.area_avg_em", "(dv.area_rm) / dv.count_em_adjust");
        new FieldOperation("dv", "USMS_DVTYPE").setAssignedRestriction(
            "USMS_DVTYPE.type_name='办公室'").calculate("dv.area_comn_ocup", "SUM",
            "USMS_DVTYPE.area_shiyong");
        new FieldOperation("dv", "USMS_DVTYPE").setAssignedRestriction(
            "USMS_DVTYPE.type_name='会议室'").calculate("dv.area_conference", "SUM",
            "USMS_DVTYPE.area_shiyong");
        new FieldOperation("dv", "USMS_DVTYPE").setAssignedRestriction(
            "USMS_DVTYPE.type_name='教师工作室'").calculate("dv.area_comn_nocup", "SUM",
            "USMS_DVTYPE.area_shiyong");
    }
    
    /**
     * Update bu.count_rm,bu.area_rm,bu.area_jianzhu
     */
    private static void calculateBu() {
        new FieldOperation("bu", "sc_view_bldvcat")
            .addOperation("bu.area_rm", "SUM", "sc_view_bldvcat.area_shiyong")
            .addOperation("bu.area_jianzhu", "SUM", "sc_view_bldvcat.area_jianzhu").calculate();
        
        new FieldFormula("bu").setAssignedRestriction(
            "bu.bu_class = 'JXKY' AND bu.count_em_adjust !=0").calculate("bu.area_avg_em",
            "(bu.area_rm) / bu.count_em_adjust");
        
    }
    
    /**
     * 计算房间的建筑面积
     */
    private static void calculateAreaRoomJianzhu() {
        
        final String sql =
                "UPDATE rm" + " SET area_comn_rm =" + "  (SELECT NVL(rm.area/(" + "    CASE"
                        + "      WHEN (1-"
                        + "        (SELECT NVL(bl.gongtanlv,0) FROM bl WHERE rm.bl_id=bl.bl_id"
                        + "        )) =0" + "      THEN 1" + "      ELSE (1-"
                        + "        (SELECT NVL(bl.gongtanlv,0) FROM bl WHERE rm.bl_id=bl.bl_id"
                        + "        ))" + "    END), 0)" + "  FROM bl," + "    rm a_inner"
                        + "  WHERE a_inner.bl_id = bl.bl_id" + "  AND a_inner.bl_id   = rm.bl_id"
                        + "  AND a_inner.fl_id   = rm.fl_id" + "  AND a_inner.rm_id   = rm.rm_id"
                        + "  )";
        SqlUtils.executeUpdate("rm", sql);
        SqlUtils.commit();
        
    }
    
    /**
     * 加法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public static double add(final double d1, final double d2) {
        final BigDecimal b1 = new BigDecimal(d1);
        final BigDecimal b2 = new BigDecimal(d2);
        return b1.add(b2).doubleValue();
    }
    
    /**
     * 减法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public static double sub(final double d1, final double d2) {
        final BigDecimal b1 = new BigDecimal(d1);
        final BigDecimal b2 = new BigDecimal(d2);
        return b1.subtract(b2).doubleValue();
    }
    
    /**
     * 乘法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public static double mul(final double d1, final double d2) {
        final BigDecimal b1 = new BigDecimal(d1);
        final BigDecimal b2 = new BigDecimal(d2);
        return b1.multiply(b2).doubleValue();
    }
    
    /**
     * 除法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public double div(final double d1, final double d2) {
        final MathContext mc = new MathContext(6, RoundingMode.HALF_DOWN);
        final BigDecimal b1 = new BigDecimal(d1);
        final BigDecimal b2 = new BigDecimal(d2);
        return b1.divide(b2, mc).doubleValue();
    }
}
