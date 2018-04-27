package com.archibus.service.school.house;

import java.text.SimpleDateFormat;
import java.util.*;

import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.DataRecord;

public class CalcZzfRent {
    
    public void autoCalcRent() throws Exception {
        calcPaymentAuto();
    }
    
    public void calcPaymentAuto() throws Exception {
        final Date today = new Date();
        final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        final String todayStr = format.format(today);
        final String firstDay = ChylinDateUtils.getNMonthLaterFirstDay(todayStr, 0);
        final String yesterday = ChylinDateUtils.getNMonthLaterLastDay(firstDay, 0);
        
        final StringBuffer sql = new StringBuffer();
        sql.append(" SELECT card_id,date_pay_end ");
        sql.append(" FROM sc_zzf_fee ");
        sql.append(" WHERE date_pay_end = TO_DATE('" + yesterday + "','YYYY-mm-dd')");
        final String[] flds = new String[] { "card_id", "date_pay_end" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_zzf_fee", flds, sql.toString());
        // 当缴费项表中存在以上个月月末为缴费截止日期的项且不存在以这个月月首为起始日期的项时，计算这个月的缴费项。
        if (!records.isEmpty()) {
            for (final DataRecord record : records) {
                final String cardId = record.getValue("sc_zzf_fee.card_id").toString();
                final StringBuffer sqlBegin = new StringBuffer();
                sqlBegin.append(" SELECT card_id,date_pay_begin ");
                sqlBegin.append(" FROM sc_zzf_fee ");
                sqlBegin.append(" WHERE card_id = '" + cardId + "' AND date_pay_begin = TO_DATE('"
                        + firstDay + "','YYYY-mm-dd')");
                final String[] fldsBegin = new String[] { "card_id", "date_pay_begin" };
                final List<DataRecord> recordsBegin =
                        SqlUtils.executeQuery("sc_zzf_fee", fldsBegin, sqlBegin.toString());
                if (recordsBegin.isEmpty()) {
                    // 从card表读出合同不会变化的量：面积，周期
                    final StringBuffer sqlAll = new StringBuffer();
                    sqlAll
                        .append(" SELECT rent_period,money_one,money_two,rate_one,rate_two,area_lease,date_two_begin,date_two_end,date_checkout_ought,card_type,curr_rent_rate,card_status, ");
                    sqlAll.append(" date_checkout_ought_first FROM sc_zzfcard ");
                    sqlAll.append(" WHERE card_id = '" + cardId + "'");
                    final String[] fldsAll =
                            new String[] { "rent_period", "money_one", "money_two", "rate_one",
                                    "rate_two", "area_lease", "date_two_begin", "date_two_end",
                                    "date_checkout_ought", "card_type", "curr_rent_rate",
                                    "card_status", "date_checkout_ought_first" };
                    final List<DataRecord> recordsAll =
                            SqlUtils.executeQuery("sc_zzfcard", fldsAll, sqlAll.toString());
                    final DataRecord recordAll = recordsAll.get(0);
                    final double price =
                            Double.valueOf(recordAll.getValue("sc_zzfcard.curr_rent_rate")
                                .toString());
                    final String cardStatus =
                            recordAll.getValue("sc_zzfcard.card_status").toString();
                    final String cardType = recordAll.getValue("sc_zzfcard.card_type").toString();
                    final String dateEnd =
                            recordAll.getValue("sc_zzfcard.date_checkout_ought_first").toString();
                    final String period = recordAll.getValue("sc_zzfcard.rent_period").toString();
                    final double price1 =
                            Double.valueOf(recordAll.getValue("sc_zzfcard.money_one").toString());
                    final double price2 =
                            Double.valueOf(recordAll.getValue("sc_zzfcard.money_two").toString());
                    final double rate1 =
                            Double.valueOf(recordAll.getValue("sc_zzfcard.rate_one").toString());
                    final double rate2 =
                            Double.valueOf(recordAll.getValue("sc_zzfcard.rate_two").toString());
                    final double area =
                            Double.valueOf(recordAll.getValue("sc_zzfcard.area_lease").toString());
                    
                    // 续签表中存放了续签成功后的单价，优惠百分比等量。
                    final StringBuffer sqlYxq = new StringBuffer();
                    sqlYxq.append("SELECT money_one,money_two,rate_one,rate_two,date_end");
                    sqlYxq.append(" FROM sc_zzf_renew");
                    sqlYxq.append(" WHERE card_id = '" + cardId + "' AND to_date('" + todayStr
                            + "','yyyy-mm-dd') BETWEEN date_begin AND date_end");
                    final String[] fldsYxq =
                            new String[] { "money_one", "money_two", "rate_one", "rate_two",
                                    "date_end" };
                    final List<DataRecord> recordsYxq =
                            SqlUtils.executeQuery("sc_zzf_renew", fldsYxq, sqlYxq.toString());
                    
                    if (cardStatus.equals("yrz")
                            || (cardStatus.equals("yxq") && 0 == recordsYxq.size())) {
                        if (cardType.equals("0")) {// ‘0’表示教职工合同
                            String dateBegin2 = new String();
                            if (recordAll.getValue("sc_zzfcard.date_two_begin") != null) {
                                dateBegin2 =
                                        recordAll.getValue("sc_zzfcard.date_two_begin").toString();
                            }
                            employeePaymentHandle(firstDay, dateBegin2, dateEnd, period, price1,
                                price2, rate1, rate2, cardId, area);
                        } else {
                            othersPaymentHandle(firstDay, dateEnd, period, price, cardId, area);
                        }
                    } else if (cardStatus.equals("yxq") && 0 != recordsYxq.size()) {
                        final DataRecord recordYxq = recordsYxq.get(0);
                        final double priceYxq1 =
                                Double.valueOf(recordYxq.getValue("sc_zzf_renew.money_one")
                                    .toString());
                        final double priceYxq2 =
                                Double.valueOf(recordYxq.getValue("sc_zzf_renew.money_two")
                                    .toString());
                        final double rateYxq1 =
                                Double.valueOf(recordYxq.getValue("sc_zzf_renew.rate_oen")
                                    .toString());
                        final double rateYxq2 =
                                Double.valueOf(recordYxq.getValue("sc_zzf_renew.rate_two")
                                    .toString());
                        String dateEndYxq = recordYxq.getValue("sc_zzf_renew.date_end").toString();
                        if (cardType.equals("0")) {
                            String dateBegin2 = new String();
                            if (recordAll.getValue("sc_zzfcard.date_two_begin") != null) {
                                dateBegin2 =
                                        recordAll.getValue("sc_zzfcard.date_two_begin").toString();
                            }
                            employeePaymentHandle(firstDay, dateBegin2, dateEndYxq, period,
                                priceYxq1, priceYxq2, rateYxq1, rateYxq2, cardId, area);
                        } else {
                            othersPaymentHandle(firstDay, dateEndYxq, period, priceYxq1, cardId,
                                area);
                        }
                    }
                }
            }
        }
    }
    
    public static void employeePaymentHandle(final String dateBegin1, final String dateBegin2,
            final String dateEnd, final String period, final double price1, final double price2,
            final double rate1, final double rate2, final String cardId, final double area)
            throws Exception {
        final Date today = new Date();
        final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        final String todayStr = format.format(today);
        
        final int flag = ChylinDateUtils.getRentMonthsByPeriod(period);
        double rate = rate1 / 100;
        double price = price1;
        final String dateBegin01 = dateBegin1;
        String dateBegin001 = dateBegin01;
        final String dateEnd01 = ChylinDateUtils.getNMonthLaterLastDay(dateBegin01, flag);// 缴费项截止日期
        String dateEnd02 = dateEnd01;
        
        // 当一个缴费项的起始日期小于今天，小于合同截止日期时，计算这个缴费项。可能生成多条。
        for (; ChylinDateUtils.dateCompare(dateBegin001, todayStr)
                && ChylinDateUtils.dateCompare(dateBegin001, dateEnd);) {
            // 当这个缴费项的截止日期小于合同截止日期时，不必考虑合同截止日期，直接算出这个缴费项信息即可
            double totalPrice = 0.00;
            double priceOfTheMonth = 0.00;
            final String dateBegin003 = dateBegin001;
            if (ChylinDateUtils.dateCompare(dateEnd02, dateEnd)) {
                for (int i = 1; i <= flag; i++) {
                    if (!dateBegin2.equals("")
                            && ChylinDateUtils.dateCompare(dateBegin2, dateBegin001)) {
                        price = price2;
                        rate = rate2 / 100;
                    }
                    final double priceOfDay =
                            ChylinDateUtils.getPriceOfMonth(dateBegin001, price) * rate;// 得到日租金
                    final String firstDayNextMonth =
                            ChylinDateUtils.getNMonthLaterFirstDay(dateBegin001, 1);// 获取下个月一号
                    final long day = ChylinDateUtils.getDays(dateBegin001, firstDayNextMonth) - 1;// 得到天数
                    priceOfTheMonth = priceOfDay * day * area;
                    totalPrice += priceOfTheMonth;
                    dateBegin001 = firstDayNextMonth;
                }
                // 保存一条计算好的缴费项信息
                saveEmployeeFeeRecord(dateBegin003, dateEnd02, totalPrice, cardId, rate * 100,
                    price);
            } else {// 当合同截止日期正好在一个缴费项的时间内时，缴费项计算到合同的截止日期。
                for (; ChylinDateUtils.dateCompare(dateBegin001, dateEnd);) {
                    if (!dateBegin2.equals("")
                            && ChylinDateUtils.dateCompare(dateBegin2, dateBegin001)) {
                        price = price2;
                        rate = rate2 / 100;
                    }
                    final double priceOfDay =
                            ChylinDateUtils.getPriceOfMonth(dateBegin001, price) * rate;// 得到日租金
                    final String firstDayNextMonth =
                            ChylinDateUtils.getNMonthLaterFirstDay(dateBegin001, 1);// 获取下个月一号
                    if (ChylinDateUtils.dateCompare(dateEnd, firstDayNextMonth)) {
                        final long day = ChylinDateUtils.getDays(dateBegin001, dateEnd);// 得到天数
                        priceOfTheMonth = priceOfDay * day * area;
                    } else {
                        final long day =
                                ChylinDateUtils.getDays(dateBegin001, firstDayNextMonth) - 1;// 得到天数
                        priceOfTheMonth = priceOfDay * day * area;
                    }
                    totalPrice += priceOfTheMonth;
                    dateBegin001 = firstDayNextMonth;
                }
                // 保存最后一条计算好的缴费项信息
                saveEmployeeFeeRecord(dateBegin003, dateEnd, totalPrice, cardId, rate * 100, price);
            }
            dateEnd02 = ChylinDateUtils.getNMonthLaterLastDay(dateBegin001, flag);
        }
    }
    
    /**
     * 用于外来人员和博士后 计算缴费项：起始日期，截止日期，应缴金额
     */
    public static void othersPaymentHandle(final String dateBegin, final String dateEnd,
            final String period, final double price, final String cardId, final double area)
            throws Exception {
        final Date today = new Date();
        final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        final String todayStr = format.format(today);
        
        final int flag = ChylinDateUtils.getRentMonthsByPeriod(period);
        final String dateBegin1 = dateBegin;// 起始时间
        final String dateEnd1 = ChylinDateUtils.getNMonthLaterLastDay(dateBegin1, flag);// 第一个缴费项截止日期
        String dateEnd2 = dateEnd1;
        String dateBegin2 = dateBegin1;
        
        // 当一个缴费项的起始日期小于今天，小于合同截止日期时，计算这个缴费项。可能生成多条。
        for (; ChylinDateUtils.dateCompare(dateBegin2, todayStr)
                && ChylinDateUtils.dateCompare(dateBegin2, dateEnd);) {
            // 当这个缴费项的截止日期小于合同截止日期时，不必考虑合同截止日期，直接算出这个缴费项信息即可
            double totalPrice = 0.00;
            double priceOfTheMonth = 0.00;
            final String dateBegin3 = dateBegin2;
            if (ChylinDateUtils.dateCompare(dateEnd2, dateEnd)) {
                for (int i = 1; i <= flag; i++) {
                    // 计算flag次月租金，得到一个缴费周期的租金
                    final double priceOfDay = ChylinDateUtils.getPriceOfMonth(dateBegin2, price);// 得到日租金
                    final String firstDayNextMonth =
                            ChylinDateUtils.getNMonthLaterFirstDay(dateBegin2, 1);// 获取下个月一号
                    final long day = ChylinDateUtils.getDays(dateBegin2, firstDayNextMonth) - 1;// 得到天数
                    priceOfTheMonth = priceOfDay * day * area;
                    totalPrice += priceOfTheMonth;
                    dateBegin2 = firstDayNextMonth;
                }
                // 保存一条计算好的缴费项信息
                saveOthersFeeRecord(dateBegin3, dateEnd2, totalPrice, cardId);
            } else {// 当合同截止日期正好在一个缴费项的时间内时，缴费项计算到合同的截止日期。
                for (; ChylinDateUtils.dateCompare(dateBegin2, dateEnd);) {
                    // 计算flag次月租金，得到一个缴费周期的租金
                    final double priceOfDay = ChylinDateUtils.getPriceOfMonth(dateBegin2, price);// 得到日租金
                    final String firstDayNextMonth =
                            ChylinDateUtils.getNMonthLaterFirstDay(dateBegin2, 1);// 获取下个月一号
                    if (ChylinDateUtils.dateCompare(dateEnd, firstDayNextMonth)) {
                        final long day = ChylinDateUtils.getDays(dateBegin2, dateEnd);// 得到天数
                        priceOfTheMonth = priceOfDay * day * area;
                    } else {
                        final long day = ChylinDateUtils.getDays(dateBegin2, firstDayNextMonth) - 1;// 得到天数
                        priceOfTheMonth = priceOfDay * day * area;
                    }
                    totalPrice += priceOfTheMonth;
                    dateBegin2 = firstDayNextMonth;
                }
                // 保存最后一条计算好的缴费项信息
                saveOthersFeeRecord(dateBegin3, dateEnd, totalPrice, cardId);
            }
            dateEnd2 = ChylinDateUtils.getNMonthLaterLastDay(dateBegin2, flag);
        }
    }
    
    /**
     * 保存教职工缴费信息
     */
    public static void saveEmployeeFeeRecord(final String dateBegin, final String dateEnd,
            final double totalPrice, final String cardId, final double rate, final double price) {
        final StringBuffer sql = new StringBuffer();
        sql.append("INSERT INTO sc_zzf_fee (card_id,em_id,em_id_z,em_name,identi_code,is_em, is_rc, bl_id, fl_id, rm_id,");
        sql.append(" rm_type, date_checkin, date_checkout,rate,price,area_lease,rent_period,date_pay_begin,date_pay_end,pay_ought)");
        sql.append(" SELECT sc_zzfcard.card_id,sc_zzfcard.em_id,sc_zzfcard.em_id_z,sc_zzfcard.em_name,sc_zzfcard.identi_code,sc_zzfcard.is_em,sc_zzfcard.is_rc,");
        sql.append(" sc_zzfcard.bl_id,sc_zzfcard.fl_id,sc_zzfcard.rm_id,sc_zzfcard.rm_type,sc_zzfcard.date_checkin,sc_zzfcard.date_checkout_ought,");
        sql.append(" " + rate + "," + price + ",sc_zzfcard.area_lease,");
        sql.append(" sc_zzfcard.rent_period,to_date('" + dateBegin + "','yyyy-mm-dd'),to_date('"
                + dateEnd + "','yyyy-mm-dd')," + totalPrice + "");
        sql.append(" FROM sc_zzfcard WHERE sc_zzfcard.card_id = '" + cardId + "'");
        SqlUtils.executeUpdate("sc_zzf_fee", sql.toString());
        
        final StringBuffer sql2 = new StringBuffer();
        sql2.append("update sc_zzfcard set price_lately = " + price + "");
        sql2.append(" WHERE sc_zzfcard.card_id = '" + cardId + "'");
        SqlUtils.executeUpdate("sc_zzf_fee", sql2.toString());
    }
    
    /**
     * 保存教职工外的人员缴费项信息
     */
    public static void saveOthersFeeRecord(final String dateBegin, final String dateEnd,
            final double totalPrice, final String cardId) {
        final StringBuffer sql = new StringBuffer();
        sql.append("INSERT INTO sc_zzf_fee (card_id,em_id,em_id_z,em_name,identi_code,is_em, is_rc, bl_id, fl_id, rm_id,");
        sql.append(" rm_type, date_checkin, date_checkout,price,area_lease,rent_period,date_pay_begin,date_pay_end,pay_ought)");
        sql.append(" SELECT sc_zzfcard.card_id,sc_zzfcard.em_id,sc_zzfcard.em_id_z,sc_zzfcard.em_name,sc_zzfcard.identi_code,sc_zzfcard.is_em,sc_zzfcard.is_rc,");
        sql.append(" sc_zzfcard.bl_id,sc_zzfcard.fl_id,sc_zzfcard.rm_id,sc_zzfcard.rm_type,sc_zzfcard.date_checkin,sc_zzfcard.date_checkout_ought,sc_zzfcard.curr_rent_rate,sc_zzfcard.area_lease,");
        sql.append(" sc_zzfcard.rent_period,to_date( '" + dateBegin + "', 'yyyy-mm-dd'),to_date( '"
                + dateEnd + "', 'yyyy-mm-dd')," + totalPrice + " ");
        sql.append(" FROM sc_zzfcard WHERE sc_zzfcard.card_id = '" + cardId + "'");
        SqlUtils.executeUpdate("sc_zzf_fee", sql.toString());
    }
}
