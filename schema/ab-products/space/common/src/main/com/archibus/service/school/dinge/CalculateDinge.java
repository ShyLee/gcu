package com.archibus.service.school.dinge;

import java.util.List;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.StringUtil;

public class CalculateDinge extends EventHandlerBase {

    /**
     * update em set dingejibie_id; refactor by kevin 2011-03-23
     */
    public static void updateDingeJibieForEm() {

        // String sql =
        // "update em set dingejibie_id=(select dj.dingejibie_id from sc_dinge_jibie dj where em.gangweijibie_id =  dj.gangweijibie_id and em.zhic_bz_id= dj.zhic_bz_id)";
        // SqlUtils.executeUpdate("em", sql);
        new FieldFormula("sc_dinge_jibie", "em").calculate("em.dingejibie_id",
            "sc_dinge_jibie.dingejibie_id");
        /*
         * UPDATE em SET em.dingejibie_id = ( SELECT NVL(sc_dinge_jibie.dingejibie_id, 0) FROM
         * sc_dinge_jibie,em a_inner WHERE a_inner.gangweijibie_id = sc_dinge_jibie.gangweijibie_id
         * AND a_inner.zhic_bz_id = sc_dinge_jibie.zhic_bz_id AND a_inner.em_id = em.em_id )
         */
    }

    /**
     * Update dv table 如果sc_de_params.is_active激活则计算此定额面积总值，否则不计算
     */
    public static void calculateAreaByDingE() {
        // Define dataSource for sc_de_params table

        final DataSource scDeParamsDS = DataSourceFactory.createDataSourceForFields("sc_de_params",
            new String[] { "bu_id", "para_name", "is_active" });
        final String[] restrictionValue = new String[] { "教学机构.教职工定额", "教学机构.房屋类型定额",
                "教学机构.科研项目定额", "教学机构.学生定额", "教学机构.重点单位补贴定额", "行政部门.教职工定额", "行政部门.房屋类型定额" };

        // clear dinge area in the dv table
        clearDingeArea();

        for (int i = 0; i < restrictionValue.length; i++) {
            final String[] buIdAndparamsName = restrictionValue[i].split("\\.");
            final DataRecord paramsRecord = scDeParamsDS.getRecord("bu_id='" + buIdAndparamsName[0]
                    + "' and para_name='" + buIdAndparamsName[1] + "'");
            int isActive;

            if (StringUtil.notNullOrEmpty(paramsRecord)) {
                isActive = paramsRecord.getInt("sc_de_params.is_active");
            } else {
                continue;
            }

            switch (i) {
            // 教学机构.教职工定额
            case 0: {
                if (isActive == 1) {
                    // calculateTeacherEmployeeDingEArea(buIdAndparamsName[0]);
                    calculateTeacherEmpDingEArea();
                }
                break;
            }
                // 教学机构.房屋类型定额
            case 1: {
                if (isActive == 1) {
                    calculateRoomTypeDingEArea(buIdAndparamsName[0]);
                }
                break;
            }
                // 教学机构.科研项目定额
            case 2: {
                if (isActive == 1) {
                    calculateKeYanDingEArea();
                }
                break;
            }
                // 教学机构.学生定额
            case 3: {
                if (isActive == 1) {
                    calculateStudentDingEArea();
                }
                break;
            }
                // 教学机构.重点单位补贴定额
            case 4: {
                if (isActive == 1) {
                    // calculateZhongDianDWBuTieDingEArea();
                }
                break;
            }
                // 行政部门.教职工定额
            case 5: {
                if (isActive == 1) {
                    // calculateTeacherEmployeeDingEArea(buIdAndparamsName[0]);
                    calculateTeacherEmpDingEArea();
                }
                break;
            }
                // 行政部门.房屋类型定额
            case 6: {
                if (isActive == 1) {
                    calculateRoomTypeDingEArea(buIdAndparamsName[0]);
                }
                break;
            }
            }
        }

        // set the total dinge area
        calculateDingeAreaTotal();
    }

    private static void clearDingeArea() {
        String sql = "update dv set area_dinge_total=0.0,area_rm_gonggong=0.0,area_comn_rm=0.0,area_project_rm=0.0,area_student_paper_rm=0.0,area_comn_gp=0.0";
        SqlUtils.executeUpdate("dv", sql);
        SqlUtils.commit();
    }

    /**
     * 
     */
    private static void calculateDingeAreaTotal() {
        String sql = "update dv set area_dinge_total=k_xueshenglunwen*(area_rm_gonggong + area_comn_rm + area_project_rm + area_student_paper_rm + area_comn_gp)";
        SqlUtils.executeUpdate("dv", sql);
        SqlUtils.commit();
    }

    /**
     * Update 教职工定额面积--使用定额矩阵
     */
    private static void calculateTeacherEmployeeDingEArea(String buId) {
        // 将em表中的em.area_chargable设置成和定额级别（sc_dinge_jibie.dingejibie_id）相等的定额面积（sc_dinge_jibie.area）
        String sql = "update em set em.area_chargable = (select distinct d.area from sc_dinge_jibie d where d.dingejibie_id = em.dingejibie_id)  where em.dingejibie_id is not null";
        SqlUtils.executeUpdate("em", sql);
        // SUM areas of AREA_CHARGABLE from em.AREA_CHARGABLE to dv.area_rm_gonggong
        // update 教职工定额面积 以部门分组求定额面积总数

        final String sqlupdateDv = "UPDATE dv SET dv.area_rm_gonggong = (SELECT NVL(SUM(em.area_chargable), 0) FROM dv o_inner, em WHERE o_inner.dv_id = dv.dv_id AND o_inner.dv_id = em.dv_id) where  dv.bu_id = '"
                + buId + "'";

        SqlUtils.executeUpdate("dv", sqlupdateDv);
        SqlUtils.commit();
    }

    /**
     * Update 教职工定额面积--按照“教师、专技、管理、工人”四类定额
     */
    private static void calculateTeacherEmpDingEArea() {

        String sqlupdateDv = "UPDATE dv SET dv.area_rm_gonggong = (count_teacher*area_teacher+count_zhuanji*area_zhuanji +count_gongren*area_gongren+count_ganbu*area_ganbu) where bu_id like '%教学%'";

        SqlUtils.executeUpdate("dv", sqlupdateDv);
        SqlUtils.commit();

        sqlupdateDv = "UPDATE dv SET dv.area_rm_gonggong = (count_teacher+count_zhuanji +count_gongren+count_ganbu)*area_jiguan_std where bu_id not like '%教学%'";
        SqlUtils.executeUpdate("dv", sqlupdateDv);
        SqlUtils.commit();
    }

    /**
     * Update 房屋类型定额
     */
    private static void calculateRoomTypeDingEArea(String buId) {

        // update 房屋类型定额
        // Select t.dv_id,sum(t.area_dinge) from sc_de_dv_rmtype t group by t.dv_id
        // 写入dv.area_comn_rm

        final String sqlUpdateRmTypeArea = "UPDATE dv SET dv.area_comn_rm = (SELECT NVL(SUM(sc_de_dv_rmtype.area_dinge), 0) FROM dv o_inner, sc_de_dv_rmtype WHERE o_inner.dv_id = dv.dv_id AND o_inner.dv_id = sc_de_dv_rmtype.dv_id) where  dv.bu_id = '"
                + buId + "'";
        SqlUtils.executeUpdate("dv", sqlUpdateRmTypeArea);
        SqlUtils.commit();

    }

    /**
     * Update 科研项目经费定额
     */
    public static void calculateKeYanDingEArea() {

        // 科研项目经费定额
        // select dv.dv_id, (select dv.RESEARCH_FUND/d.fund_std from sc_de_res_fund_std d
        // where d.subject_cat =dv.subject_cat) as area_project_rm from dv where dv.bu_id='教学科研'
        // 写入dv. area_project_rm

        final DataSource scDeResFundStdDS = DataSourceFactory.createDataSourceForFields(
            "sc_de_res_fund_std", new String[] { "subject_cat", "fund_std" });
        final DataSource dvDS = DataSourceFactory.createDataSourceForFields("dv", new String[] {
                "bu_id", "dv_id", "area_project_rm", "research_fund", "subject_cat" });

        List<DataRecord> dvRecords = null;
        dvRecords = dvDS.getRecords("dv.bu_id = '教学机构' and dv.subject_cat is not null ");
        for (DataRecord dvRecord : dvRecords) {

            String dvSubjectCat = dvRecord.getString("dv.subject_cat");
            double dvResearchFund = Double.parseDouble(dvRecord.getValue("dv.research_fund")
                .toString());

            DataRecord scDeResFundStdRecord = null;
            scDeResFundStdRecord = scDeResFundStdDS.getRecord("sc_de_res_fund_std.subject_cat = '"
                    + dvSubjectCat + "'");
            if (StringUtil.notNullOrEmpty(scDeResFundStdRecord)) {
                double scDeResFundStdFundStd = Double.parseDouble(scDeResFundStdRecord.getValue(
                    "sc_de_res_fund_std.fund_std").toString());
                double areaProjectRm = dvResearchFund / scDeResFundStdFundStd;
                dvRecord.setValue("dv.area_project_rm", areaProjectRm);
                dvDS.saveRecord(dvRecord);
            }
        }
    }

    /**
     * Update 学生定额
     */
    private static void calculateStudentDingEArea() {
        // 写入dv.area_student_paper_rm
        new FieldFormula("dv")
            .setAssignedRestriction("dv.bu_id = '教学机构'")
            .calculate(
                "dv.area_student_paper_rm",
                "dv.count_benk*dv.area_benk + dv.count_shuos*dv.area_shuos + dv.count_bos * dv.area_bos + dv.count_zhuank*dv.area_zhuank + dv.COUNT_LIUXUES*dv.area_liuxues +dv.count_other*dv.area_other_rm");

    }

    /**
     * Update 重点单位补贴定额 View - dinge_subsidy_kri
     */
    private static void calculateZhongDianDWBuTieDingEArea() {

        // 重点单位补贴定额
        // select t.dv_id, sum((select (d.area *t.kri_count) from sc_de_kri_std d where d.kri_name
        // =t.kri_name))
        // as area_dinge_kri from sc_de_kristd_dv t ,dv
        // where t.dv_id=dv.dv_id
        // and dv.bu_id='教学科研' group by t.dv_id
        // 写入dv. area_comn_gp
        //
        new FieldFormula("dv").setAssignedRestriction("dv.bu_id = '教学机构'").calculate(
            "dv.area_comn_gp",
            "(select sk.area_dinge_kri from dinge_subsidy_kri sk where sk.dv_id=dv.dv_id)");

    }

    // 净使用面积--就是有偿使用面积
    /**
     * 净使用面积=各单位的实际使用面积-基础课实验室的一半-校外基地房屋使用面积
     */
    public static void calculateDivisionAreaNetShiYong() {
        String sql = "update dv set area_rm_net=area_rm";
        SqlUtils.executeUpdate("dv", sql);
        SqlUtils.commit();
        // 考虑到各单位实验室功能不易区分，因此各单位基础实验室面积均减半计量量使用面积。
        calculateNetAreaRmOfType("基础课实验室", 0.5);

        // 减去“校外基地”房屋使用面积--以该校区的名称作为关键字
        calculateDvRmAreaofXiaoWaiJiDi("校外基地");

    }

    /**
     * 为了各单位计算净使用面积1 -基础课实验室面积的一半
     * 
     * @param rmtype
     * @param rate
     */
    private static void calculateNetAreaRmOfType(String rmtype, double rate) {
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String sql = "update dv set dv.area_baselab="
                + " (select nvl(sum(rm.area),0) from rm,bl where rm.bl_id=bl.bl_id and bl.acc_type != 'yxz' and rm.dv_id=dv.dv_id and rm.rm_type= "

                + literal(context, rmtype) + ")";
        SqlUtils.executeUpdate("dv", sql);

        sql = "update dv set dv.area_rm_net=(dv.area_rm_net-(dv.area_baselab*" + rate + "))";
        SqlUtils.executeUpdate("dv", sql);
        SqlUtils.commit();

    }

    /**
     * 为了各单位计算净使用面积2 减去“校外基地”房屋使用面积
     */
    private static void calculateDvRmAreaofXiaoWaiJiDi(String siteName) {
        String sql = "update dv set dv.area_xwjd="
                + " (select nvl(sum(rm.area),0) as area_xiaowaijidi from rm,bl,site "
                + " where rm.bl_id=bl.bl_id and rm.dv_id=dv.dv_id and bl.acc_type != 'yxz' and bl.site_id=site.site_id and site.name like '"
                + siteName + "')";
        SqlUtils.executeUpdate("dv", sql);

        sql = "update dv set dv.area_rm_net=(dv.area_rm_net-dv.area_xwjd)";
        SqlUtils.executeUpdate("dv", sql);
        SqlUtils.commit();

    }

    /**
     * 计算使用单位资源占用费dv.fee_money
     */
    public static void calculateDivisionRmOccuFee() {
        // update dv set option1 = area_rm_net - area_dinge_total
        // update dv set fee_money=area_dinge_total*10 +option1*10*2 where option1>0
        // update dv set fee_money=area_rm_net*10 -option1*10*0.5 where option1<0
        // 获取参数
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        int fee_std = getParamDingeFeeStd(context);
        double over_rate = getParamOverFeeRate(context);
        double lack_rate = getParamLackFeeRate(context);

        String sql = "update dv set option1 = area_rm_net - area_dinge_total";
        SqlUtils.executeUpdate("dv", sql);
        sql = "update dv set fee_money=area_dinge_total*" + fee_std + " +option1*" + fee_std + "*"
                + over_rate + " where option1>0";
        SqlUtils.executeUpdate("dv", sql);
        sql = "update dv set fee_money=area_rm_net*" + fee_std + " -option1*" + fee_std + "*"
                + lack_rate + " where option1<0";
        SqlUtils.executeUpdate("dv", sql);
        SqlUtils.commit();

    }

    /**
     * get parameter sc_scmpref.dinge_fee_std
     * 
     * @param context
     * @return
     */
    private static int getParamDingeFeeStd(EventHandlerContext context) {
        Object prefRec = selectDbValue(context, "sc_scmpref", "dinge_fee_std", "");
        if (prefRec != null) {
            return Integer.parseInt(prefRec.toString());
        }
        return 10;
    }

    /**
     * get parameter sc_scmpref.over_fee_rate
     * 
     * @param context
     * @return
     */
    private static double getParamOverFeeRate(EventHandlerContext context) {
        Object prefRec = selectDbValue(context, "sc_scmpref", "over_fee_rate", "");
        if (prefRec != null) {
            return Double.parseDouble(prefRec.toString());
        }
        return 2.0;
    }

    /**
     * get parameter sc_scmpref.lack_fee_rate
     * 
     * @param context
     * @return
     */
    private static double getParamLackFeeRate(EventHandlerContext context) {
        Object prefRec = selectDbValue(context, "sc_scmpref", "lack_fee_rate", "");
        if (prefRec != null) {
            return Double.parseDouble(prefRec.toString());
        }
        return 0.0;
    }

    /**
     * Update 设置sc_de_dv_rmtype表的默认值
     */
    public static void initialDvRmtypeRecords() {
        final String sqlScDeDvRmType = "insert into sc_de_dv_rmtype(bu_id,dv_id,rm_cat,rm_type) select t.bu_id,dv.dv_id,t.rm_cat,t.rm_type from sc_de_rmtype t, dv where t.bu_id=dv.BU_ID";
        SqlUtils.executeUpdate("sc_de_dv_rmtype", sqlScDeDvRmType);
        SqlUtils.commit();
    }

    /**
     * Update sc_de_dv_rmtype表的数据
     */
    public static void updateDeDvRmtypeRecords(DataRecord updatedRecord) {
        boolean isNewRecord = updatedRecord.isNew();
        String sqlScDeDvRmType;
        DataValue dataV_rmCat = updatedRecord.findField("sc_de_rmtype.rm_cat");
        DataValue dataV_rmType = updatedRecord.findField("sc_de_rmtype.rm_type");
        DataValue dataV_buId = updatedRecord.findField("sc_de_rmtype.bu_id");
        String newValue_buId = dataV_buId.getValue().toString();
        String oldValue_rmCat = dataV_rmCat.getOldValue().toString();
        String newValue_rmCat = dataV_rmCat.getValue().toString();
        String oldValue_rmType = dataV_rmType.getOldValue().toString();
        String newValue_rmType = dataV_rmType.getValue().toString();
        if (isNewRecord) {
            // 新增记录
            sqlScDeDvRmType = "insert into sc_de_dv_rmtype(bu_id,dv_id,rm_cat,rm_type) select '"
                    + newValue_buId + "',dv.dv_id,'" + newValue_rmCat + "','" + newValue_rmType
                    + "' from  dv where dv.BU_ID ='" + newValue_buId + "'";

        } else {
            // 修改记录
            sqlScDeDvRmType = "update sc_de_dv_rmtype set rm_cat='" + newValue_rmCat
                    + "',rm_type='" + newValue_rmType + "' where sc_de_dv_rmtype.rm_cat='"
                    + oldValue_rmCat + "' and rm_type='" + oldValue_rmType + "' ";

        }
        SqlUtils.executeUpdate("sc_de_dv_rmtype", sqlScDeDvRmType);
        SqlUtils.commit();

    }

    /*
     * 定义各类学生定额面积
     * 
     * 博士生2平米，硕士生1.5平米，本科生1平米
     * 
     * @param JSONObject record
     */
    public static void saveStudentDingEArea(String areaBenk, String areaShuos, String areaBos,
            String areaBosh, String areaZhuank, String areaLiuxues) {
        final String dvSql = "UPDATE dv SET area_benk='" + areaBenk + "', area_shuos='" + areaShuos
                + "'," + "area_bos='" + areaBos + "',area_bosh='" + areaBosh + "',area_zhuank='"
                + areaZhuank + "'," + "area_liuxues='" + areaLiuxues + "' where dv.bu_id='教学机构'";
        SqlUtils.executeUpdate("dv", dvSql);
        SqlUtils.commit();
    }

    /*
     * 定义 教职工定额面积
     * 
     * 教师和专技 每人12平米，管理和工人每人10平米
     * 
     * @param JSONObject record
     */
    public static void saveTeacherDingEArea(String areaTeacher, String areaZhuanJi,
            String areaGanbu, String areaGongren, String areaJiGuanStd) {
        final String dvSql = "UPDATE dv SET area_teacher='" + areaTeacher + "', area_zhuanji='"
                + areaZhuanJi + "'," + "area_ganbu='" + areaGanbu + "',area_gongren='"
                + areaGongren + "',area_jiguan_std='" + areaJiGuanStd + "'";
        SqlUtils.executeUpdate("dv", dvSql);
        SqlUtils.commit();
    }

}
