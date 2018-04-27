package com.archibus.service.school.dinge;

import java.math.*;
import java.util.*;

import com.archibus.app.reservation.util.DataSourceUtils;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.DataSource.RecordHandler;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;

public class DingeHandler extends EventHandlerBase implements RecordHandler {
    private DataSource ds;
    
    public DingeHandler() {
        this.ds = getMainDataSoure();
        
    }
    
    public void updateDingeArea(JobStatus status) {
        status.setResult(new JobResult("Update Dinge Area"));
        status.setTotalNumber(100);
        this.ds.queryRecords(this);
        status.setCurrentNumber(100);
    }
    
    private DataSource getMainDataSoure() {
        DataSource datasource =
                DataSourceFactory.createDataSource().addTable("sc_ts_dv_dinge").addField("dv_id")
                    .addField("count_bk").addField("count_term_bk").addField("count_yjs")
                    .addField("count_lxs").addField("count_bs").addField("count_bsh")
                    .addField("count_em_jb").addField("count_rb").addField("hours_je1")
                    .addField("hours_je2").addField("hours_je3").addField("k1").addField("k2")
                    .addField("jda").addField("rga").addField("za").addField("formula_id")
                    .addField("ta").addField("zca").addField("yza").addField("money_ygf")
                    .addField("money_yjf").addSort("dv_id");
        return datasource;
    }
    
    /**
     * 更新单位定额面就、用房金额
     * 
     * @param dv_id
     * @param record
     */
    public void updateDingeAreaByDv(String dv_id, DataRecord record) {
        String dvId = dv_id;
        String formulaId = record.getValue("sc_ts_dv_dinge.formula_id").toString();
        double b = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_bk").toString());
        double b1 = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_term_bk").toString());
        double m = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_yjs").toString());
        double f = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_lxs").toString());
        double d = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_bs").toString());
        double pd = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_bsh").toString());
        double jb = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_em_jb").toString());
        double rb = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_rb").toString());
        double je1 = Double.parseDouble(record.getValue("sc_ts_dv_dinge.hours_je1").toString());
        double je2 = Double.parseDouble(record.getValue("sc_ts_dv_dinge.hours_je2").toString());
        double je3 = Double.parseDouble(record.getValue("sc_ts_dv_dinge.hours_je3").toString());
        double k1 = Double.parseDouble(record.getValue("sc_ts_dv_dinge.k1").toString());
        double k2 = Double.parseDouble(record.getValue("sc_ts_dv_dinge.k2").toString());
        double jda = Double.parseDouble(record.getValue("sc_ts_dv_dinge.jda").toString());
        double rga = Double.parseDouble(record.getValue("sc_ts_dv_dinge.rga").toString());
        double za = Double.parseDouble(record.getValue("sc_ts_dv_dinge.za").toString());
        
        double zca = Double.parseDouble(record.getValue("sc_ts_dv_dinge.zca").toString());
        double yza = Double.parseDouble(record.getValue("sc_ts_dv_dinge.yza").toString());
        double ygf = Double.parseDouble(record.getValue("sc_ts_dv_dinge.money_ygf").toString());
        double yjf = Double.parseDouble(record.getValue("sc_ts_dv_dinge.money_yjf").toString());
        
        double ta = this.getAreaByDvId(dvId);
        List<Double> list = new ArrayList<Double>();
        // 正常院系用房定额核算公式
        if (formulaId.equals("AA")) {
            list =
                    this.calculateAreaA1(jb, rb, k1, k2, je1, je2, je3, b, m, f, d, pd, jda, rga,
                        za);
        } else if (formulaId.equals("AA1")) {// 建筑学院 用房定额核算公式
            list =
                    this.calculateAreaA1(jb, rb, k1, k2, je1, je2, je3, b, m, f, d, pd, jda, rga,
                        za);
        } else if (formulaId.equals("AA2")) {// 人文、经管、外语等院系定额核算公式
            list =
                    this.calculateAreaA2(jb, rb, k1, k2, je1, je2, je3, b, m, f, d, pd, jda, rga,
                        za, b1);
        }
        double aa = list.get(0);
        double ra = list.get(1);
        double rza = list.get(2);
        double ja = list.get(3);
        double jla = list.get(4);
        double jea = list.get(5);
        double ba = list.get(6);
        za = list.get(7);
        double a = DataSourceUtils.round2(sub(ta, aa));
        double a1 = 0;
        double a2 = 0;
        if (a < 0) {
            a1 = 0;
            a2 = 0;
        } else {
            if (a <= aa * 0.2) {
                a1 = a;
                a2 = 0;
            } else {
                a1 = DataSourceUtils.round2(mul(aa, 0.2));
                a2 = DataSourceUtils.round2(sub(a, a1));
            }
        }
        this.updateArea(dvId, aa, ba, za, ja, jea, jla, ra, rza, a, a1, a2);
        this.updateMoney(ra, a1, a2, zca, ta, yza, ygf, yjf, dvId);
    }
    
    /**
     * 更新所有院系的定额面积、用房金额
     */
    public boolean handleRecord(DataRecord record) {
        String dvId = record.getValue("sc_ts_dv_dinge.dv_id").toString();
        String formulaId = record.getValue("sc_ts_dv_dinge.formula_id").toString();
        double b = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_bk").toString());
        double b1 = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_term_bk").toString());
        double m = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_yjs").toString());
        double f = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_lxs").toString());
        double d = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_bs").toString());
        double pd = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_bsh").toString());
        double jb = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_em_jb").toString());
        double rb = Double.parseDouble(record.getValue("sc_ts_dv_dinge.count_rb").toString());
        double je1 = Double.parseDouble(record.getValue("sc_ts_dv_dinge.hours_je1").toString());
        double je2 = Double.parseDouble(record.getValue("sc_ts_dv_dinge.hours_je2").toString());
        double je3 = Double.parseDouble(record.getValue("sc_ts_dv_dinge.hours_je3").toString());
        double k1 = Double.parseDouble(record.getValue("sc_ts_dv_dinge.k1").toString());
        double k2 = Double.parseDouble(record.getValue("sc_ts_dv_dinge.k2").toString());
        double jda = Double.parseDouble(record.getValue("sc_ts_dv_dinge.jda").toString());
        double rga = Double.parseDouble(record.getValue("sc_ts_dv_dinge.rga").toString());
        double za = Double.parseDouble(record.getValue("sc_ts_dv_dinge.za").toString());
        
        double zca = Double.parseDouble(record.getValue("sc_ts_dv_dinge.zca").toString());
        double yza = Double.parseDouble(record.getValue("sc_ts_dv_dinge.yza").toString());
        double ygf = Double.parseDouble(record.getValue("sc_ts_dv_dinge.money_ygf").toString());
        double yjf = Double.parseDouble(record.getValue("sc_ts_dv_dinge.money_yjf").toString());
        
        double ta = this.getAreaByDvId(dvId);
        List<Double> list = new ArrayList<Double>();
        // 正常院系用房定额核算公式
        if (formulaId.equals("AA")) {
            list =
                    this.calculateAreaAA(jb, rb, k1, k2, je1, je2, je3, b, m, f, d, pd, jda, rga,
                        za);
        } else if (formulaId.equals("AA1")) {// 建筑学院 用房定额核算公式
            list =
                    this.calculateAreaA1(jb, rb, k1, k2, je1, je2, je3, b, m, f, d, pd, jda, rga,
                        za);
        } else if (formulaId.equals("AA2")) {// 人文、经管、外语等院系定额核算公式
            list =
                    this.calculateAreaA2(jb, rb, k1, k2, je1, je2, je3, b, m, f, d, pd, jda, rga,
                        za, b1);
        }
        double aa = list.get(0);
        double ra = list.get(1);
        double rza = list.get(2);
        double ja = list.get(3);
        double jla = list.get(4);
        double jea = list.get(5);
        double ba = list.get(6);
        za = list.get(7);
        double a = DataSourceUtils.round2(sub(ta, aa));
        double a1 = 0;
        double a2 = 0;
        if (a < 0) {
            a1 = 0;
            a2 = 0;
        } else {
            if (a <= aa * 0.2) {
                a1 = a;
                a2 = 0;
            } else {
                a1 = DataSourceUtils.round2(mul(aa, 0.2));
                a2 = DataSourceUtils.round2(sub(a, a1));
            }
        }
        this.updateArea(dvId, aa, ba, za, ja, jea, jla, ra, rza, a, a1, a2);
        this.updateMoney(ra, a1, a2, zca, ta, yza, ygf, yjf, dvId);
        return true;
    }
    
    /**
     * 计算正常院系用房使用的定额核算公式的定额面积
     * 
     * @param jb 教学等事业编制人数
     * @param rb 专职科研编制人数
     * @param k1 规模系数
     * @param k2 专业类型系数
     * @param je1 专业基础课实验生时数金额je1
     * @param je2 专业基础课实验生时数金额je2
     * @param je3 专业基础课实验生时数金额je3
     * @param b 本科生人数
     * @param m 硕士生人数
     * @param f 留学生人数
     * @param d 博士生人数
     * @param pd 博士后人数
     * @param jda 教学实验用房定额面积
     * @param rga 国家实验室用房定额
     * @param za 资料室定额面积
     * @return
     */
    private List<Double> calculateAreaAA(double jb, double rb, double k1, double k2, double je1,
            double je2, double je3, double b, double m, double f, double d, double pd, double jda,
            double rga, double za) {
        List<Double> list = new ArrayList<Double>();
        double ba = DataSourceUtils.round2(mul(mul(jb, Constants.BA_JB_DINGE), k1));
        double jea =
                DataSourceUtils.round2(mul(
                    mul(add(add(div(je1, 480), div(je2, 288)), div(je3, 144)),
                        Constants.JEA_LAB_DINGE), k2));
        double jla =
                DataSourceUtils.round2(mul(
                    add(add(mul(mul(b, add(div(1, 8), div(1, 75))), Constants.JLA_BK_DINGE_AREA),
                        mul(mul(add(m, f), div(2, 3)), Constants.JLA_SS_DINGE_AREA)),
                        mul(mul(d, div(3, 4)), Constants.JLA_BS_DINGE_AREA)
                                + mul(pd, Constants.JLA_BSH_DINGE_AREA)), k2));
        double ja = add(add(jea, jla), jda);
        double rza = DataSourceUtils.round2(mul(mul(rb, Constants.BA_RB_DINGE), k2));
        double ra = DataSourceUtils.round2(add(rga, rza));
        double aa = DataSourceUtils.round2(add(add(add(ba, za), ja), ra));
        list.add(aa);
        list.add(ra);
        list.add(rza);
        list.add(ja);
        list.add(jla);
        list.add(jea);
        list.add(ba);
        list.add(za);
        return list;
    }
    
    /**
     * 计算建筑学院用房使用的定额核算公式的定额面积
     * 
     * @param jb 教学等事业编制人数
     * @param rb 专职科研编制人数
     * @param k1 规模系数
     * @param k2 专业类型系数
     * @param je1 专业基础课实验生时数金额je1
     * @param je2 专业基础课实验生时数金额je2
     * @param je3 专业基础课实验生时数金额je3
     * @param b 本科生人数
     * @param m 硕士生人数
     * @param f 留学生人数
     * @param d 博士生人数
     * @param pd 博士后人数
     * @param jda 教学实验用房定额面积
     * @param rga 国家实验室用房定额
     * @param za 资料室定额面积
     * @return
     */
    private List<Double> calculateAreaA1(double jb, double rb, double k1, double k2, double je1,
            double je2, double je3, double b, double m, double f, double d, double pd, double jda,
            double rga, double za) {
        List<Double> list = new ArrayList<Double>();
        double ba = DataSourceUtils.round2(mul(mul(jb, Constants.BA_JB_DINGE), k1));
        double jea = 0;
        double jla =
                DataSourceUtils.round2(add(
                    add(mul(b, Constants.JLA_BK_DINGE_AREA),
                        mul(add(m, f), Constants.JLA_SS_DINGE_AREA)),
                    mul(add(d, pd), Constants.JLA_BS_DINGE_AREA)));
        double ja = DataSourceUtils.round2(add(jla, jda));
        double rza = DataSourceUtils.round2(mul(mul(rb, Constants.BA_RB_DINGE), k2));
        double ra = DataSourceUtils.round2(add(rga, rza));
        double aa = DataSourceUtils.round2(add(add(add(ba, za), ja), ra));
        list.add(aa);
        list.add(ra);
        list.add(rza);
        list.add(ja);
        list.add(jla);
        list.add(jea);
        list.add(ba);
        list.add(za);
        return list;
    }
    
    /**
     * 计算人文、经管、外语学院用房使用的定额核算公式的定额面积
     * 
     * @param jb 教学等事业编制人数
     * @param rb 专职科研编制人数
     * @param k1 规模系数
     * @param k2 专业类型系数
     * @param je1 专业基础课实验生时数金额je1
     * @param je2 专业基础课实验生时数金额je2
     * @param je3 专业基础课实验生时数金额je3
     * @param b 本科生人数
     * @param m 硕士生人数
     * @param f 留学生人数
     * @param d 博士生人数
     * @param pd 博士后人数
     * @param jda 教学实验用房定额面积
     * @param rga 国家实验室用房定额
     * @param za 资料室定额面积
     * @param b1 本科毕业班人数
     * @return
     */
    private List<Double> calculateAreaA2(double jb, double rb, double k1, double k2, double je1,
            double je2, double je3, double b, double m, double f, double d, double pd, double jda,
            double rga, double za, double b1) {
        List<Double> list = new ArrayList<Double>();
        double ba = DataSourceUtils.round2(mul(mul(jb, Constants.BA_JB_DINGE), k1));
        double jea = 0;
        double jla =
                DataSourceUtils.round2(add(
                    add(mul(mul(sub(b, b1), div(3, 4)), 1), mul(mul(b1, div(1, 4)), 2)),
                    mul(add(add(add(m, f), d), pd), 3)));
        double ja = jla;
        double za1 = jla;
        double rza = DataSourceUtils.round2(mul(mul(rb, Constants.BA_S_RB_DINGE), k2));
        double ra = DataSourceUtils.round2(add(rga, rza));
        double aa = DataSourceUtils.round2(add(add(ba, ja), ra));
        list.add(aa);
        list.add(ra);
        list.add(rza);
        list.add(ja);
        list.add(jla);
        list.add(jea);
        list.add(ba);
        list.add(za1);
        return list;
    }
    
    /**
     * 根据单位动态获取对应的用房面积
     * 
     * @param dvId
     * @return
     */
    private double getAreaByDvId(String dvId) {
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String sql = "select area_rm  from dv  where dv.dv_id= '" + dvId + "'";
        List records = retrieveDbRecords(context, sql);
        double ta = 0;
        if (!records.isEmpty()) {
            Map recordMap = (Map) records.get(0);
            ta = Double.parseDouble(recordMap.get("area_rm").toString());
        }
        return ta;
        
    }
    
    /**
     * 加法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public static double add(double d1, double d2) {
        BigDecimal b1 = new BigDecimal(d1);
        BigDecimal b2 = new BigDecimal(d2);
        return b1.add(b2).doubleValue();
    }
    
    /**
     * 减法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public static double sub(double d1, double d2) {
        BigDecimal b1 = new BigDecimal(d1);
        BigDecimal b2 = new BigDecimal(d2);
        return b1.subtract(b2).doubleValue();
    }
    
    /**
     * 乘法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public static double mul(double d1, double d2) {
        BigDecimal b1 = new BigDecimal(d1);
        BigDecimal b2 = new BigDecimal(d2);
        return b1.multiply(b2).doubleValue();
    }
    
    /**
     * 除法运算
     * 
     * @param d1
     * @param d2
     * @return
     */
    public double div(double d1, double d2) {
        MathContext mc = new MathContext(6, RoundingMode.HALF_DOWN);
        BigDecimal b1 = new BigDecimal(d1);
        BigDecimal b2 = new BigDecimal(d2);
        return b1.divide(b2, mc).doubleValue();
    }
    
    /**
     * 
     * 更新定额面积
     * 
     * @param dvId 单位Id
     * @param aa 定额用房面积
     * @param ba 办公用房定额面积
     * @param za 资料室面积
     * @param ja 教学用房总面积
     * @param jea 教学实验用房定额面积
     * @param jla 学生论文用房定额面积
     * @param ra 科研用房定额面积
     * @param rza 专职科研用房定额面积
     * @param a 超定额面积
     * @param a1 <=定额20%的超定额面积
     * @param a2 >=定额20%的超定额面积
     */
    public void updateArea(String dvId, double aa, double ba, double za, double ja, double jea,
            double jla, double ra, double rza, double a, double a1, double a2) {
        String sql =
                "update sc_ts_dv_dinge SET aa=" + aa + " , ba=" + ba + ",za=" + za + ",ja=" + ja
                        + ",jea=" + jea + ",jla=" + jla + ",ra=" + ra + ",rza=" + rza + ",oa=" + a
                        + ",oa1=" + a1 + ",oa2=" + a2 + "    where dv_id=" + "'" + dvId + "'";
        SqlUtils.executeUpdate("sc_ts_dv_dinge", sql);
        SqlUtils.commit();
    }
    
    /**
     * 更新用房金额
     * 
     * @param ra 科研用房定额面积
     * @param a1 <=定额20%的超定额面积
     * @param a2 >=定额20%的超定额面积
     * @param zca 自筹建房面积
     * @param ta 现用房面积
     * @param yza 引资建房面积
     * @param ygf 返回的国家实验室客座补助用房金额
     * @param yjf 返回的基础科研补助用房金额
     * @param dvId 用房单位
     */
    public void updateMoney(double ra, double a1, double a2, double zca, double ta, double yza,
            double ygf, double yjf, String dvId) {
        double y1 = DataSourceUtils.round2(mul(mul(ra, 0.3), 365));
        double y2 = DataSourceUtils.round2(mul(mul(a1, 0.3), 365));
        double y3 = DataSourceUtils.round2(mul(mul(mul(a2, 0.3), 365), 2));
        double y = DataSourceUtils.round2(add(add(y1, y2), y3));
        double yh = 0;
        if (ta == 0) {
            yh = 0;
        } else {
            yh = DataSourceUtils.round2(mul(y, add(div(zca, ta), mul(div(yza, ta), 0.5))));
        }
        double ys = DataSourceUtils.round2(sub(y, yh));
        double y1_2f = DataSourceUtils.round2(div(sub(sub(sub(ys, y3), ygf), yjf), 2));
        double yf = 0;
        if (y1_2f <= 0) {
            yf = DataSourceUtils.round2(add(ygf, yjf));
        } else {
            yf = DataSourceUtils.round2(add(add(y1_2f, ygf), yjf));
        }
        double yy = DataSourceUtils.round2(sub(ys, yf));
        
        String sql =
                "update sc_ts_dv_dinge SET money_y1=" + y1 + " , money_y2=" + y2 + ",money_y3="
                        + y3 + ",money_y=" + y + ",yh=" + yh + ",ys=" + ys + ",y1_2f=" + y1_2f
                        + ",yf=" + yf + ",yy=" + yy + "   where dv_id=" + "'" + dvId + "'";
        SqlUtils.executeUpdate("sc_ts_dv_dinge", sql);
        SqlUtils.commit();
    }
}
