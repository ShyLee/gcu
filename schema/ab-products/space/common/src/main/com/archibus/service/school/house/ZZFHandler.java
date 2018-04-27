package com.archibus.service.school.house;

import java.sql.Date;
import java.text.*;
import java.util.*;

import org.apache.log4j.Logger;
import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.Common;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.service.school.tools.SchTools;
import com.archibus.utility.*;

public class ZZFHandler extends EventHandlerBase {
    // sc_zzfcard.rent_situ
    private static Logger Classlog = Logger.getLogger(ZZFHandler.class);
    
    // get the rent rate from sc_zzfrentstd
    private static final char RENTSITUN = 'N';
    
    // bshldz, the rent rate is constant, recorded in the table sc_scmpref
    private static final char RENTSITUM = 'M';
    
    // special ,do not pay rent
    private static final char RENTSITUS = 'S';
    
    // mannal rate
    private static final char RENTSITUR = 'R';
    
    private static final char KKLX_TUIF = '1';
    
    private static final char KKLX_NEWRZ = '2';
    
    private static final char KKLX_DAIK = '3';
    
    private static final char KKLX_BUKO = '4';
    
    private static final char KKLX_RENTCHG = '5';
    
    private static final char KKLX_NOCHG = '6';
    
    private static final String shortDateFormat = "yyyy-MM-dd";
    
    /**
     * 
     * @param status
     */
    public static void doHuoquChangedCards() {
        
        final String fromDate = getPreDateOfBaoPan();
        
        final String toDate = DateTime.dateToString(Utility.currentDate(), shortDateFormat);
        
        final JSONArray changedCards = getChangedCards(fromDate, toDate);
        
        writeChangedCards(changedCards);
    }
    
    /**
     * 
     * @param year
     * @param month
     * @param status
     */
    public static void createBaoPanRpt(final int year, final int month) {
        
        delBaoPanDataOfMonth(year, month);
        
        insertInitialBaoPanDataOfMonth(year, month);
        
        updateBaoPanRptChange(year, month);
        
        // Classlog.info("createBaoPanRpt rule called at " + new Date(month.toString()));
    }
    
    /**
     * 
     * @param emcode
     * @return
     */
    public static boolean hasExistedTheEmpInCards(final String emcode) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql = " SELECT 1 FROM sc_zzfcard WHERE card_status='yrz' and em_id=" + emcode;
        final List records = retrieveDbRecords(context, sql);
        if (!records.isEmpty()) {
            return true;
        }
        return false;
        
    }
    
    /**
     * get the previous date of creating baopan report
     * 
     * @return
     */
    private static String getPreDateOfBaoPan() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                " SELECT date_created FROM sc_zzfrent WHERE "
                        + " to_char(date_created,'yyyy') <= to_char(sysdate,'yyyy') "
                        + " and to_char(date_created,'mm') < to_char(sysdate,'mm') "
                        + " order by date_created desc ";
        
        final List records = retrieveDbRecords(context, sql);
        String preDate = "";
        if (!records.isEmpty()) {
            final Map record = (Map) records.get(0);
            preDate = getDateValue(context, record.get("date_created")).toString();
        }
        Classlog.debug("the date of last bao pan is : " + preDate);
        
        return preDate == "" ? null : preDate;
    }
    
    /**
     * 
     * @return
     */
    private static JSONArray getExistedChangedRecords() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                " SELECT card_id,em_id,em_name FROM sc_zzfrent_change WHERE " + " year="
                        + DateTime.getYear(Utility.currentDate()) + " and month="
                        + SchTools.getISOMonth();
        
        final JSONArray records = toJSONArray(retrieveDbRecords(context, sql));
        
        Classlog.debug("Existed Changed Records from sc_zzfrent_chang : " + sql);
        return records;
    }
    
    /**
     * get the changed cards between fromDate and toDate, filter : 1 --- is_em ='1' //must be
     * employee in the university; 2 --- rent_situ != 'S' //the special tenant do not include
     * 
     * @param fromDate
     * @param toDate
     */
    private static JSONArray getChangedCards(final String fromDate, final String toDate) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                " SELECT card_id,em_id,em_name,card_status,date_checkin,date_checkout_actual FROM sc_zzfcard WHERE "
                        + " (to_char(date_checkin,'yyyy-MM-dd') >"
                        + literal(context, fromDate)
                        + " and to_char(date_checkin,'yyyy-MM-dd') <"
                        + literal(context, toDate)
                        + " ) OR (to_char(date_checkout_actual,'yyyy-MM-dd') > "
                        + literal(context, fromDate)
                        + " and to_char(date_checkout_actual,'yyyy-MM-dd') <"
                        + literal(context, toDate) + ") and is_em='1' and rent_situ !='S'";
        
        final JSONArray records = toJSONArray(retrieveDbRecords(context, sql));
        
        Classlog.debug("get Changed cards from sc_zzfcard : " + sql);
        return records;
    }
    
    /**
     * refactoring by kevin 2010-03-03
     * 
     * @param cardId
     * @param existedChangeRecords
     * @return
     */
    private static boolean isExistedCard(final JSONArray elements, final int cardId) {
        for (int i = 0; i < elements.length(); i++) {
            final int cardNo = elements.getJSONObject(i).getInt("card_id");
            
            if (cardId == cardNo) {
                return true;
            }
        }
        return false;
    }
    
    private static void writeChangedCards(final JSONArray cards) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray existedChangedRecords = getExistedChangedRecords();
        
        for (int i = 0; i < cards.length(); i++) {
            final JSONObject record = cards.getJSONObject(i);
            final String cardId = record.getString("card_id");
            final char card_status = record.getString("card_status").charAt(0);
            if (!isExistedCard(existedChangedRecords, Integer.parseInt(cardId))) {
                String insertSql =
                        "INSERT into sc_zzfrent_change(card_id,em_id,em_name,year,month,change_type,rent_month,rent_bukou,note1)"
                                + " values("
                                + cardId
                                + ", "
                                + literal(context, record.getString("em_id"))
                                + ", "
                                + literal(context, record.getString("em_name"))
                                + ", "
                                + literal(context,
                                    Integer.toString(DateTime.getYear(Utility.currentDate())))
                                + ", " + literal(context, SchTools.getISOMonth()) + ", ";
                if (card_status == '1') { // new tenant
                    insertSql += KKLX_NEWRZ + ", ";
                    final java.sql.Date date_checkin =
                            getDateValue(context, record.get("date_checkin"));
                    if (SchTools.isTwoDateInSameMonth(date_checkin, Utility.currentDate())) {
                        // ben yue ru zhu
                        insertSql += " 0 , 0, ";
                    } else {
                        // shang yue ru zhu
                        insertSql += getCurCardMonthRent(cardId) + ", 0, ";
                    }
                    insertSql +=
                            literal(context, getDateValue(context, record.get("date_checkin"))
                                .toString())
                                    + " )";
                    
                } else {
                    final String date_checkout_actual =
                            getDateValue(context, record.get("date_checkout_actual")).toString();
                    insertSql += KKLX_TUIF + ", 0 , 0, " + date_checkout_actual + " )";
                }
                SqlUtils.executeUpdate("sc_zzfrent_change", insertSql);
                
                Classlog.debug("write Changed Cards into sc_zzfrent_chang : " + insertSql);
            }
        }
    }
    
    /**
     * refactoring by kevin 2010-03-03 add restriction for xinan project
     * 
     * delete the records of bao pan table 'sc_zzfrent_details' and 'sc_zzfrent'
     * 
     * @param year
     * @param month
     */
    private static void delBaoPanDataOfMonth(final int year, final int month) {
        // Step1 -- Delete the records of this month in the table sc_zzfrent_details
        final String sql =
                "DELETE FROM sc_zzfrent_details d WHERE d.year=" + year + " AND d.month= '" + month
                        + "'";
        
        SqlUtils.executeUpdate("sc_zzfrent_details", sql);
        SqlUtils.commit();
        
        // Step2 -- Delete the record of this month in the table sc_zzfrent
        // zhangyan Add 由于自缴房租也是在 sc_zzfrent_details表中
        // 所以在sc_zzfrent中增加一个payment_to,并且更改sc_zzfrent的主键为自增主键
        final String sql2 =
                "DELETE FROM sc_zzfrent m WHERE m.year=" + year + " AND m.month= '" + month + "'";
        
        SqlUtils.executeUpdate("sc_zzfrent", sql2);
        SqlUtils.commit();
    }
    
    private static DataRecord VerifyIsZzfrentDetails(final int year, final int month) {
        final String sql =
                "select rent_id from sc_zzfrent  where year='" + year + "' and month='" + month
                        + "'";
        final String[] flds = { "rent_id" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_zzfrent", flds, sql);
        if (records.size() != 0) {
            final DataRecord accRecord = records.get(0);
            return accRecord;
        } else {
            return null;
        }
    }
    
    /**
     * refactoring by kevin 2010-03-03
     * 
     * add restriction for xinan project 2013-02-26
     * 
     * insert the initial records from the zzf cards table 'sc_zzfcard' into the tables
     * 'sc_zzfrent_details' and 'sc_zzfrent'
     * 
     * @param year
     * @param month
     */
    private static void insertInitialBaoPanDataOfMonth(final int year, final int month) {
        // Step3 -- Insert the record of this month in the table sc_zzfrent
        final String operator = ContextStore.get().getUser().getName();
        final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        final Calendar ca = Calendar.getInstance();
        ca.set(Calendar.DAY_OF_MONTH, ca.getActualMaximum(Calendar.DAY_OF_MONTH));
        final String currentMonthLast = format.format(ca.getTime());
        // zhangyan Add 由于自缴房租也是在 sc_zzfrent_details表中
        final String insertSql =
                "INSERT INTO sc_zzfrent(year,month,operator,area,count_rm,count_em,total_rent,payment_to) SELECT '"
                        + year
                        + "','"
                        + month
                        + "', '"
                        + operator
                        + "', SUM(ca.area_lease), count(RTRIM(ca.bl_id)||'-'||RTRIM(ca.fl_id)||'-'||RTRIM(ca.rm_id)),count(ca.em_id), sum(desposit_payoff),'finance' FROM sc_zzfcard ca WHERE ca.card_status ='yrz' AND to_char(date_payrent_last,'yyyy-MM-dd') >'"
                        + currentMonthLast + "'";
        SqlUtils.executeUpdate("sc_zzfrent", insertSql);
        SqlUtils.commit();
        Classlog.debug("insertInitialBaoPanDataOfMonth_1 : " + insertSql);
        // /***
        // * 更新一下字段用于 统计所有房租
        // */
        // final String updateRent =
        // "UPDATE sc_zzfrent SET(all_rm_count,all_em_count,total_rent)=(SELECT COUNT(RTRIM(bl_id)||'-'||RTRIM(fl_id)||'-'||RTRIM(rm_id)) allrm,COUNT(em_id) allem,SUM(desposit_payoff) "
        // + "alltotal FROM sc_zzfcard WHERE card_status ='1') WHERE YEAR='"
        // + year
        // + "'  AND MONTH ='" + month + "'";
        // SqlUtils.executeUpdate("sc_zzfrent_details", updateRent);
        // SqlUtils.commit();
        
        String monthV = month + "";
        if (month < 10) {
            monthV = "0" + month;
        }
        // 获取sc_zzfrent表中的rent_id(rent_id是sc_zzfrent表和sc_zzfrent_detail表相关联的外键)
        final DataRecord rentRecord = VerifyIsZzfrentDetails(year, month);
        final String renId = rentRecord.getValue("sc_zzfrent.rent_id").toString();
        
        final String insertSql1 =
                "INSERT INTO sc_zzfrent_details(card_id,area_lease,em_id,em_name,"
                        + "dv_name,dv_owner,per_rent,month_rent,amount_payrent,operator,YEAR,MONTH,rent_id,payment_to) SELECT ca.card_id,"
                        + "ca.area_lease,ca.em_id,ca.em_name,ca.dv_name,ca.dv_owner,ca.curr_rent_rate,"
                        + "desposit_payoff,desposit_payoff,'"
                        + operator
                        + "','"
                        + year
                        + "','"
                        + month
                        + "','"
                        + renId
                        + "','finance' FROM sc_zzfcard ca "
                        + "WHERE ca.card_status='yrz'  And "
                        + "'"
                        + year
                        + "-"
                        + monthV
                        + "'>=to_char(ca.date_checkin,'yyyy-mm') and '"
                        + year
                        + "-"
                        + monthV
                        + "'<=to_char(ca.DATE_CHECKOUT_OUGHT,'yyyy-mm') AND ca.card_id not in (select card_id from sc_zzfrent_details where year='"
                        + year + "' and month='" + month + "')";
        
        SqlUtils.executeUpdate("sc_zzfrent_details", insertSql1);
        SqlUtils.commit();
        Classlog.debug("insertInitialBaoPanDataOfMonth_2 : " + insertSql1);
        
    }
    
    private static void updateBaoPanRptChange(final int year, final int month) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray objectsToUpdate = getAllBaoPanCards(context, year, month);
        String sql = "";
        for (int i = 0; i < objectsToUpdate.length(); i++) {
            final JSONObject detailObject = objectsToUpdate.getJSONObject(i);
            final int cardId = detailObject.getInt("card_id");
            final double month_rent = detailObject.getDouble("desposit_payoff");
            final String payment_to = detailObject.getString("payment_to");
            // 1;退房变更;2;入住变更;3;代扣变更;4;补扣变更;5;租金变更;6;无异动;7;缴费方式变更
            String changeType = "6";
            
            // 房租变更
            final boolean rentChanged = rentChanged(context, year, month, month_rent, cardId);
            // 缴费方式变更
            if (rentChanged == true) {
                changeType = "2";
            }
            paymentChanged(context, year, month, payment_to, cardId);
            sql =
                    " UPDATE sc_zzfrent_details SET  change_type=" + changeType + " WHERE year="
                            + year + " and month=" + month + " and card_id=" + cardId;
            SqlUtils.executeUpdate("sc_zzfrent_details", sql);
            SqlUtils.commit();
            
            updataStartOrEndMonthRent(context, year, month, month_rent, cardId);
        }
        updataTotalRent(context, year, month);
        
    }
    
    /**
     * 判断是否是始缴月 或者 最后一个月 更新应缴金额
     */
    private static void updataStartOrEndMonthRent(final EventHandlerContext context,
            final int year, final int month, final double month_rent, final int card_id) {
        final String startDate =
                "select date_checkin  from sc_zzfcard where card_id= '" + card_id + "'";
        try {
            final List records = retrieveDbRecords(context, startDate);
            if (!records.isEmpty()) {
                final Map record = (Map) records.get(0);
                if (!record.equals(null)) {
                    
                    final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    final String dateFirst = record.get("date_checkin").toString();
                    final java.util.Date date = sdf.parse(dateFirst);
                    final Calendar cal = Calendar.getInstance();
                    cal.setTime(date);
                    
                    final int yearStart = cal.get(Calendar.YEAR);
                    final int monthStart = cal.get(Calendar.MONTH) + 1;
                    final int dayStart = cal.get(Calendar.DATE);
                    
                    if (year == yearStart) {
                        if (month == monthStart) {
                            if (dayStart != 1) {
                                final double dayZhuSu = 30 - dayStart + 1;
                                final double amount_payrent = (month_rent / 30) * dayZhuSu;
                                final String updataSqlRent =
                                        "update sc_zzfrent_details set amount_payrent = '"
                                                + amount_payrent + "' where year ='" + year
                                                + "' and month ='" + month + "' and card_id = '"
                                                + card_id + "'";
                                SqlUtils.executeUpdate("sc_zzfrent_details", updataSqlRent);
                                SqlUtils.commit();
                            }
                        }
                    }
                    
                }
            }
        } catch (final Exception e) {
        }
        // 判断是不是最后一个月
        final String endDate =
                "select date_checkout_ought from sc_zzfcard where card_id= '" + card_id + "'";
        try {
            final List recordsEnd = retrieveDbRecords(context, endDate);
            if (!recordsEnd.isEmpty()) {
                final Map recordEnd = (Map) recordsEnd.get(0);
                if (!recordEnd.equals(null)) {
                    
                    final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    final String dateEnd = recordEnd.get("date_checkout_ought").toString();
                    final java.util.Date date = sdf.parse(dateEnd);
                    final Calendar cal = Calendar.getInstance();
                    cal.setTime(date);
                    
                    final int yearEnd = cal.get(Calendar.YEAR);
                    final int monthEnd = cal.get(Calendar.MONTH) + 1;
                    final int dayEnd = cal.get(Calendar.DATE);
                    
                    if (year == yearEnd) {
                        if (month == monthEnd) {
                            if (dayEnd != 1) {
                                final double dayZhuSu = dayEnd;
                                final double amount_payrent = (month_rent / 30) * dayZhuSu;
                                final String updataSqlRent =
                                        "update sc_zzfrent_details set amount_payrent = '"
                                                + amount_payrent + "' where year ='" + year
                                                + "' and month ='" + month + "' and card_id = '"
                                                + card_id + "'";
                                SqlUtils.executeUpdate("sc_zzfrent_details", updataSqlRent);
                                SqlUtils.commit();
                            }
                        }
                    }
                    
                }
            }
        } catch (final Exception e) {
        }
    }
    
    /**
     * 更新总金额
     */
    private static void updataTotalRent(final EventHandlerContext context, final int year,
            final int month) {
        final String rentIdSql =
                "select rent_id  from sc_zzfrent where payment_to = 'finance' and  year= '" + year
                        + "' and month='" + month + "'";
        try {
            final List rentIdrecords = retrieveDbRecords(context, rentIdSql);
            if (!rentIdrecords.isEmpty()) {
                final Map rentIdrecord = (Map) rentIdrecords.get(0);
                if (!rentIdrecord.equals(null)) {
                    final String rentId = rentIdrecord.get("rent_id").toString();
                    
                    final String updateTotalRent =
                            "update sc_zzfrent set  total_rent = (select sum(amount_payrent) from sc_zzfrent_details where year='"
                                    + year
                                    + "' and month='"
                                    + month
                                    + "') where rent_id='"
                                    + rentId + "'";
                    SqlUtils.executeUpdate("sc_zzfrent", updateTotalRent);
                    SqlUtils.commit();
                }
            }
        } catch (final Exception e) {
        }
    }
    
    /**
     * card_id,em_id,num_month,area_lease
     * 
     * @param objectsToUpdate -- details
     */
    private static void updateBaoPanRpt(final int year, final int month) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray objectsToUpdate = getAllBaoPanCards(context, year, month);
        String sql = "";
        for (int i = 0; i < objectsToUpdate.length(); i++) {
            final JSONObject detailObject = objectsToUpdate.getJSONObject(i);
            
            final int cardId = detailObject.getInt("card_id");
            detailObject.getString("rent_situ").charAt(0);
            
            detailObject.getInt("num_month");
            
            // double per_rent = getRentRate(cardId, rentSitu, months);
            final double per_rent = detailObject.getDouble("curr_rent_rate");
            
            final double month_rent =
                    Double.parseDouble(detailObject.getString("area_lease")) * per_rent;
            // check whether there is changed of the bu kou of this em_id
            /*
             * Object[] rentChangeRec = selectDbValues(context, "sc_zzfrent_change", new String[] {
             * "change_type", "rent_bukou", "note1", "rent_month", "rent_daikou" }, " year = " +
             * year + " and month=" + month + " and card_id=" + cardId); if (rentChangeRec != null)
             * { char changeType = rentChangeRec[0].toString().charAt(0); switch (changeType) { case
             * KKLX_TUIF: month_rent = 0; bukou_rent =
             * Float.parseFloat(rentChangeRec[1].toString()); actual_payoff = bukou_rent; break;
             * 
             * case KKLX_DAIK: month_rent = 0; bukou_rent = 0; daikou_rent =
             * Float.parseFloat(rentChangeRec[4].toString()); actual_payoff = 0; break;
             * 
             * case KKLX_BUKO: // month_rent = month_rent; bukou_rent =
             * Float.parseFloat(rentChangeRec[1].toString()); actual_payoff = month_rent +
             * bukou_rent; break; case KKLX_NEWRZ: month_rent =
             * Float.parseFloat(rentChangeRec[3].toString()); bukou_rent =
             * Float.parseFloat(rentChangeRec[1].toString()); actual_payoff = month_rent +
             * bukou_rent; break;
             * 
             * } sql = " UPDATE sc_zzfrent_details SET per_rent=" + per_rent + ", month_rent=" +
             * month_rent + ",bukou_rent=" + bukou_rent + ", actual_payoff=" + actual_payoff +
             * ", daikou_rent=" + daikou_rent + ",  change_type=" + changeType + ", note1=" +
             * literal(context, rentChangeRec[2].toString()) + " WHERE year=" + year + " and month="
             * + month + " and card_id=" + cardId; } else {
             */
            char changeType = KKLX_NOCHG;
            final boolean rentChanged = rentChanged(context, year, month, month_rent, cardId);
            if (rentChanged == true) {
                changeType = KKLX_RENTCHG;
            }
            
            sql =
                    " UPDATE sc_zzfrent_details SET per_rent=" + per_rent + ", month_rent="
                            + month_rent + ",bukou_rent=0, actual_payoff=" + month_rent
                            + ", change_type=" + changeType + " WHERE year=" + year + " and month="
                            + month + " and card_id=" + cardId;
        }
        
        SqlUtils.executeUpdate("sc_zzfrent_details", sql);
        // }
        
        // Update the sum rent of current month
        new FieldOperation("sc_zzfrent", "sc_zzfrent_details").addOperation("sc_zzfrent.tot_rent",
            "SUM", "sc_zzfrent_details.actual_payoff").calculate();
        
    }
    
    /**
     * for xinan peoject, only get the cards of payment_to='finance'
     * 
     * @param year
     * @param month
     * @return
     */
    private static JSONArray getAllBaoPanCards(final EventHandlerContext context, final int year,
            final int month) {
        final String sql =
                " SELECT ca.card_id,ca.area_lease,ca.curr_rent_rate,d.num_month,d.payment_to,ca.desposit_payoff "
                        + " FROM sc_zzfcard ca,sc_zzfrent_details d"
                        + " WHERE d.card_id=ca.card_id and d.year=" + year + " and d.month="
                        + month + " and ca.payment_to='finance' and d.payment_to='finance'";
        
        final JSONArray records = toJSONArray(retrieveDbRecords(context, sql));
        return records;
    }
    
    /**
     * get rent rate of tenant by the parameters
     * 
     * @param cardNo : card_id field
     * @param rentSitu : rent_situ field
     * @param num_month : the month amounts of having leased the room
     * @return
     */
    private static double getRentRate(final int cardNo, final char rentSitu, final int num_month) {
        ContextStore.get().getEventHandlerContext();
        final double rentRate = 0.0;
        
        if (rentSitu == RENTSITUS) {
            return 0.0;
        }
        
        if (rentSitu == RENTSITUM) {
            return getRateofBshldz();
        }
        
        if (rentSitu == RENTSITUR) {
            return getRateByManual(cardNo);
        }
        
        if (rentSitu == RENTSITUN) {
            // return getRateByStdofYear(num_month);
            return getRateByManual(cardNo);
        }
        
        return rentRate;
        
    }
    
    /**
     * get rent rate of Bshldz
     * 
     * 博士后流动站 特殊费率
     * 
     * @return
     */
    private static double getRateofBshldz() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        return Double.parseDouble(Common.getValue(context, "sc_scmpref", "bsldz_rent_rate", "")
            .toString());
    }
    
    /**
     * get the rent rate from standard rate table
     * 
     * @param cardNo
     * @return
     */
    /*
     * private static double getRateByStdofYear(final int num_month) { EventHandlerContext context =
     * ContextStore.get().getEventHandlerContext(); int year_order = (num_month / 12) + 1;
     * 
     * if (year_order > 5) { year_order = 0; } Object UnitRent = Common .getValue(context,
     * "sc_zzfrentstd", "unit_rent", "year_order = " + year_order);
     * 
     * double rentRate = 30.0; if (UnitRent != null) { rentRate =
     * Double.parseDouble(UnitRent.toString()); } else { // meiyou jietie feilv }
     * 
     * return rentRate; }
     */
    
    /**
     * get the rent rate of manual
     * 
     * @param cardNo
     * @return
     */
    private static double getRateByManual(final int cardNo) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Object[] cardRec =
                selectDbValues(context, "sc_zzfcard", new String[] { "next_rent_rate",
                        "date_begin_next_rate", "curr_rent_rate" }, " card_id=" + cardNo);
        /*
         * String sql =
         * " SELECT ca.next_rent_rate,ca.date_begin_next_rate,d.curr_rent_rate FROM sc_zzfcard ca "
         * + " WHERE ca.card_id=" + cardNo; List listRecords = retrieveDbRecords(context, sql);
         */
        double rate_manual = 0.0;
        if (cardRec != null) {
            // if (!listRecords.isEmpty()) {
            // Map record = (Map) listRecords.get(0);
            double curr_rent_rate = 0.0;
            
            if (cardRec[2] == null) {
                // curr_rent_rate = 29;
            } else {
                curr_rent_rate = Double.parseDouble(cardRec[2].toString());
            }
            rate_manual = curr_rent_rate;
            
            /*
             * delete for xinan project if (cardRec[1] == null) { rate_manual = curr_rent_rate; }
             * else { double next_rent_rate = 0.0; if (cardRec[0] == null) { next_rent_rate = 29; }
             * else { next_rent_rate = Double.parseDouble(cardRec[0].toString()); }
             * 
             * Date nextDate = DateTime.stringToDate(cardRec[1].toString(), "", shortDateFormat);
             * 
             * Calendar nextDateCal = new GregorianCalendar(); nextDateCal.setTime(nextDate);
             * 
             * Calendar currDateCal = Calendar.getInstance(); long i = currDateCal.getTimeInMillis()
             * - nextDateCal.getTimeInMillis(); if (i >= 0) { rate_manual = next_rent_rate; } else {
             * rate_manual = curr_rent_rate; } }
             */
        }
        
        return rate_manual;
        
    }
    
    /**
     * Get the month rent of the card of the year and the month
     * 
     * @param year
     * @param month
     * @param cardId
     * @return
     */
    public static double getCurCardMonthRent(final String cardId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int card_id = Integer.parseInt(cardId);
        double monRent = 0.00;
        final DecimalFormat df = new DecimalFormat("#.00");
        
        /*
         * String sql = " SELECT CASE WHEN (" + formatSqlDaysBetween(context, currentDate,
         * "ca.date_checkin") + " > 0) THEN " + formatSqlMonthsBetween(context, "ca.date_checkin",
         * currentDate) + "+ 1 ELSE " + formatSqlMonthsBetween(context, "ca.date_checkin",
         * currentDate) + "END AS dif_mon, " +
         * " ca.area_lease, ca.rent_situ FROM sc_zzfcard ca WHERE ca.card_id=" + card_id;
         */
        final String sql =
                " SELECT CASE WHEN to_char(sysdate,'dd') < to_char(ca.date_checkin,'dd') THEN trunc(months_between(sysdate,ca.date_checkin)) +1  ELSE trunc(months_between(sysdate,ca.date_checkin)) END AS dif_mon, "
                        + " ca.area_lease, ca.rent_situ,ca.curr_rent_rate FROM sc_zzfcard ca WHERE ca.card_id="
                        + card_id;
        
        final List recordsSql = retrieveDbRecords(context, sql);
        if (!recordsSql.isEmpty()) {
            final Map record = (Map) recordsSql.get(0);
            Integer.parseInt((record.get("dif_mon").toString()));
            record.get("rent_situ").toString().charAt(0);
            final double areaLease = Double.parseDouble(record.get("area_lease").toString());
            
            // double per_rent = getRentRate(card_id, rentSitu, num_month);
            final double per_rent = Double.parseDouble(record.get("curr_rent_rate").toString());
            
            monRent = areaLease * per_rent;
        }
        monRent = Double.parseDouble(df.format(monRent));
        
        context.addResponseParameter("message", "OK");
        return monRent;
    }
    
    private static boolean rentChanged(final EventHandlerContext context, int year, int month,
            final double cur_rent, final int card_id) {
        boolean rentchanged = false;
        if (month == 1) {
            month = 12;
            year = year - 1;
        } else {
            month = month - 1;
        }
        
        final Object preMonthRec =
                selectDbValue(context, "sc_zzfrent_details", "month_rent", " year = " + year
                        + " and month=" + month + " and card_id=" + card_id);
        if (preMonthRec != null) {
            final double preMonth_rent = Double.parseDouble(preMonthRec.toString());
            if ((cur_rent > preMonth_rent) || (cur_rent < preMonth_rent)) {
                rentchanged = true;
            }
        } else {
            // mei you
            rentchanged = true;
        }
        return rentchanged;
    }
    
    private static boolean paymentChanged(final EventHandlerContext context, int year, int month,
            final String cur_payment_to, final int card_id) {
        boolean rentchanged = false;
        if (month == 1) {
            month = 12;
            year = year - 1;
        } else {
            month = month - 1;
        }
        
        final Object prePaymentRec =
                selectDbValue(context, "sc_zzfrent_details", "payment_to", " year = " + year
                        + " and month=" + month + " and card_id=" + card_id);
        if (prePaymentRec != null) {
            final String prePayment_to = prePaymentRec.toString();
            if (!cur_payment_to.equals(prePayment_to)) {
                rentchanged = true;
            }
        } else {
            // mei you
            rentchanged = true;
        }
        return rentchanged;
    }
    
    /**
     * Called as scheduled workflow rule
     */
    /*
     * public static void createBaoPanAtFixedDate() { EventHandlerContext context =
     * ContextStore.get().getEventHandlerContext();
     * 
     * java.util.Date curDate = new Date(System.currentTimeMillis()); SimpleDateFormat dayFormat =
     * new SimpleDateFormat("dd"); SimpleDateFormat monthFormat = new SimpleDateFormat("MM");
     * SimpleDateFormat yearFormat = new SimpleDateFormat("yyyy"); int curDay =
     * java.lang.Integer.parseInt(dayFormat.format(curDate)); int difday =
     * java.lang.Integer.parseInt(Common.getValue(context, "sc_scmpref", "day_baopan",
     * "").toString()); if (curDay >= difday) { String year = yearFormat.format(curDate); String
     * month = monthFormat.format(curDate); String sql =
     * "SELECT 1 FROM sc_zzfrent m,sc_zzfrent_details d WHERE m.year=d.year and m.month=d.month and m.year="
     * + year + " and m.month=" + month; List recordsSql = retrieveDbRecords(context, sql);
     * System.out.println("recordsSql" + recordsSql.isEmpty()); if (recordsSql.isEmpty()) {
     * createBaoPanRpt(year, month);
     * 
     * updateBaoPanRpt(Integer.parseInt(year), Integer.parseInt(month)); } } }
     */
    
    /**
     * 
     * @param year
     * @param newDate 是否从新生成
     */
    public static void createBaoPanBT(final String year, final String newDate) {
        
        if ("Y".equals(newDate)) {
            final String sqlmodify =
                    "update (select /*+ BYPASS_UJVC */ a.date_next, b.date_next md"
                            + " from sc_subsidy a,sc_subsidy_details b "
                            + " WHERE a.em_id=b.em_id and b.date_end='" + year + "')mdtable "
                            + "set mdtable.date_next=mdtable.md";
            SqlUtils.executeUpdate("sc_subsidy", sqlmodify);
        }
        // Step1 -- Delete the records of this month in the table sc_zzfrent_details
        final String sql = "DELETE FROM sc_subsidy_details d WHERE d.date_end='" + year + "'";
        SqlUtils.executeUpdate("sc_subsidy_details", sql);
        
        final String insertSql =
                "INSERT INTO sc_subsidy_details(em_id,em_name,date_next,date_start,date_end,curr_standard,new_standard,sum_butie)"
                        + " select a.em_id,a.em_name,a.date_next,to_char(a.date_next,'yyyy-mm'),"
                        + "'"
                        + year
                        + "'"
                        + ",CASE when a.date_chang is NULL then a.curr_standard"
                        + " WHEN a.date_chang<a.date_next THEN a.new_standard"
                        + " else a.curr_standard"
                        + " end AS curr_standard,"
                        + "CASE when a.date_chang is NULL then a.curr_standard"
                        + " WHEN a.date_chang>a.date_next THEN a.new_standard"
                        + " else a.new_standard"
                        + " end AS new_standard,"
                        + "CASE when a.date_chang is NULL THEN (months_between(to_date('"
                        + year
                        + "', 'yyyy-mm'),to_date(to_char(a.date_next,'yyyy-mm'),'yyyy-mm'))+1)*a.curr_standard"
                        + " WHEN a.date_chang<a.date_next THEN (months_between(to_date('"
                        + year
                        + "', 'yyyy-mm'),to_date(to_char(a.date_next,'yyyy-mm'),'yyyy-mm'))+1)*a.new_standard"
                        + " else months_between(to_date(to_char(a.date_chang,'yyyy-mm'),'yyyy-mm'),to_date(to_char(a.date_next,'yyyy-mm'),'yyyy-mm'))*a.curr_standard "
                        + "+(months_between(to_date( '"
                        + year
                        + "', 'yyyy-mm'),to_date(to_char(a.date_chang,'yyyy-mm'),'yyyy-mm'))+1)*a.new_standard end as dd"
                        + " from sc_subsidy a WHERE to_date(to_char(a.date_next,'yyyy-mm'),'yyyy-mm')<to_date('"
                        + year
                        + "', 'yyyy-mm')"
                        + " and NOT EXISTS(select em_name from SC_SUBSIDYBUKOU b where a.em_id=b.em_id)"
                        + " UNION ALL"
                        + " select b.em_id,b.em_name,null,to_char(b.date_start,'yyyy-mm'),to_char(b.date_end,'yyyy-mm'),b.standard,b.standard,b.money from SC_SUBSIDYBUKOU b WHERE b.type='1'"
                        + " and to_char(b.date_end,'yyyy-mm')='" + year + "'";
        
        System.out.println("sql===: " + insertSql);
        SqlUtils.executeUpdate("sc_zzfrent", insertSql);
        // end 更新补贴发放时间
        final String yearstart = year + "-01";
        
        final String sqlmodify02 =
                "update (select /*+ BYPASS_UJVC */ a.date_next"
                        + " from sc_subsidy a,sc_subsidy_details b "
                        + " WHERE a.em_id=b.em_id and b.date_end='" + year + "')mdtable2 "
                        + "set mdtable2.date_next=add_months(to_date('" + yearstart
                        + "','yyyy-mm-dd'),1)";
        SqlUtils.executeUpdate("sc_subsidy", sqlmodify02);
    }
    
    /**
     * 生成固定编码
     * 
     * 
     * @param table 表名
     * @param key_field 字段名
     * @param sysDatefield 系统日期
     */
    public static void doCreateFixedIndex(final String table, final String key_field,
            final String sysDatefield) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String recCount = "";
        final String strSQL =
                "select leaseId from (select " + key_field + " as leaseId from " + table
                        + " where to_char(" + sysDatefield
                        + ",'yyyy-mm-dd')=to_char(sysdate,'yyyy-mm-dd')  order by " + sysDatefield
                        + " desc ,date_created_time desc)  where  rownum='1' ";
        
        final List recs = selectDbRecords(context, strSQL);
        for (final Iterator it = recs.iterator(); it.hasNext();) {
            final Object[] record = (Object[]) it.next();
            recCount = notNull(record[0]).toString();
        }
        String resultString = null;
        int count = 0;
        final Calendar cal = Calendar.getInstance();
        final int year = cal.get(Calendar.YEAR);// 获取年份
        
        final String dateString = year + "";
        if (recCount != "") {
            final int length = recCount.length();
            count = Integer.parseInt(recCount.substring(length - 4, length));
            
            if (count < 9) {
                resultString = dateString.replace("-", "") + "000" + (count + 1);
            } else if (count >= 9 && count < 99) {
                resultString = dateString.replace("-", "") + "00" + (count + 1);
            } else if (count >= 99 && count < 999) {
                resultString = dateString.replace("-", "") + "0" + (count + 1);
            } else {
                resultString = dateString.replace("-", "") + (count + 1);
            }
        } else {
            if (count < 9) {
                resultString = dateString.replace("-", "") + "000" + (count + 1);
            }
            
        }
        final Date currentDate = new Date(System.currentTimeMillis());
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        final SimpleDateFormat dateFormat1 = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        dateFormat1.applyPattern("HH:mm.ss.SSS");
        final String date = dateFormat.format(currentDate);
        final String dateTime = dateFormat1.format(currentDate);
        
        final JSONObject json = new JSONObject();
        json.put("leaseId", resultString.toString());
        json.put("dateCreate", date);
        json.put("dateCreateTime", dateTime);
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    // 生成自缴记录 缴费类型为自然月的 自缴
    public static void createPaymentLogByHouse(String yearmonth_start, final String yearmonth_end,
            final String monthRent, final String dateCheckin, final String datePayrentLast,
            final String newPayLast, final String dateFirst, final String dayFirst,
            final String daysFirst, final String cardId, final String rentId,
            final String payment_chg_id, final String newPayLast1_all) {
        final String operator = ContextStore.get().getUser().getName();
        // 1、根据yearmonth_start和yearmonth_end在sc_zzfrent_details表中插入记录
        // 在这里需要注意一下：如果是按非自然月缴费，那么起缴月按照正常计算6-12到7月12是一个月
        // 如果按照自然月计算，如果不满一个月的按天计算，每天房租=月房租/30
        final String year_start = yearmonth_start.substring(0, 4);
        final String month_start = yearmonth_start.substring(4, 6);
        final String checkin_year = dateCheckin.substring(0, 4);
        final String checkin_month = dateCheckin.substring(5, 7);
        final String datecheckin2 = checkin_year + checkin_month;
        
        if (datecheckin2.equals(yearmonth_start)) {
            // 判断入住时间是不是1号
            
            if (!dateCheckin.equals(dateFirst)) {
                if (dayFirst.equals("2")) {
                    final Double dayRent = Double.parseDouble(monthRent) / 30;
                    final Double firstMonthRent = Integer.parseInt(daysFirst) * dayRent;
                    final String insertSql1 =
                            "INSERT INTO sc_zzfrent_details(card_id,area_lease,em_id,em_name,"
                                    + "dv_name,per_rent,month_rent,amount_payrent,actual_payoff,operator,YEAR,MONTH,rent_id,payment_to) SELECT ca.card_id,"
                                    + "ca.area_lease,ca.em_id,ca.em_name,ca.dv_name,ca.curr_rent_rate,"
                                    + "desposit_payoff,'" + firstMonthRent + "','" + firstMonthRent
                                    + "','" + operator + "','" + year_start + "','" + month_start
                                    + "','" + rentId + "','house' FROM sc_zzfcard ca "
                                    + "WHERE ca.card_status='yrz'  AND ca.card_id='" + cardId + "'";
                    
                    SqlUtils.executeUpdate("sc_zzfrent_details", insertSql1);
                    SqlUtils.commit();
                    
                    yearmonth_start = calculateYearMonth(yearmonth_start, 1);
                }
            }
        }
        // 计算每月房租
        while (Integer.parseInt(yearmonth_start) <= Integer.parseInt(yearmonth_end)) {
            final Double currentMonthRent = Double.parseDouble(monthRent);
            final String year_start1 = yearmonth_start.substring(0, 4);
            final String month_start1 = yearmonth_start.substring(4, 6);
            final String insertSql2 =
                    "INSERT INTO sc_zzfrent_details(card_id,area_lease,em_id,em_name,"
                            + "dv_name,per_rent,month_rent,amount_payrent,actual_payoff,operator,YEAR,MONTH,rent_id,payment_to) SELECT ca.card_id,"
                            + "ca.area_lease,ca.em_id,ca.em_name,ca.dv_name,ca.curr_rent_rate,"
                            + "desposit_payoff,'" + currentMonthRent + "','" + currentMonthRent
                            + "','" + operator + "','" + year_start1 + "','" + month_start1 + "','"
                            + rentId + "','house' FROM sc_zzfcard ca "
                            + "WHERE ca.card_status='yrz'  AND ca.card_id='" + cardId + "'";
            
            SqlUtils.executeUpdate("sc_zzfrent_details", insertSql2);
            SqlUtils.commit();
            
            yearmonth_start = calculateYearMonth(yearmonth_start, 1);
        }
        // 判断缴费方式是否变更：新的缴费日期date_payment_chg
        if (payment_chg_id.length() > 0) {
            final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
            final String sql =
                    " SELECT card_id,new_payment,rent_period_new,to_char(date_payment_new,'yyyy-MM-dd') date_payment_new FROM sc_zzf_payment WHERE id="
                            + payment_chg_id;
            
            final List recordsSql = retrieveDbRecords(context, sql);
            if (!recordsSql.isEmpty()) {
                final Map record = (Map) recordsSql.get(0);
                final String newPayment = record.get("new_payment").toString();
                final String rent_period_new = record.get("rent_period_new").toString();
                final String date_payment_new = record.get("date_payment_new").toString();
                
                if (date_payment_new.equals(newPayLast1_all)) {
                    final String updateSql =
                            "update sc_zzfcard set date_payrent_last=to_date( '" + newPayLast
                                    + "', 'yyyy-mm-dd') ,payment_to='" + newPayment
                                    + "',rent_period='" + rent_period_new
                                    + "', payment_chg_id='', payment_change=''"
                                    + " WHERE card_status='yrz'  AND card_id='" + cardId + "'";
                    
                    SqlUtils.executeUpdate("sc_zzfcard", updateSql);
                    SqlUtils.commit();
                } else {
                    // 2、更新sc_zzfcard表中的“缴费日期至”
                    final String updateSql3 =
                            "update sc_zzfcard set date_payrent_last=to_date( '" + newPayLast
                                    + "', 'yyyy-mm-dd')  WHERE card_status='yrz'  AND card_id='"
                                    + cardId + "'";
                    
                    SqlUtils.executeUpdate("sc_zzfcard", updateSql3);
                    SqlUtils.commit();
                }
            }
        } else {
            // 2、更新sc_zzfcard表中的“缴费日期至”
            final String updateSql3 =
                    "update sc_zzfcard set date_payrent_last=to_date( '" + newPayLast
                            + "', 'yyyy-mm-dd')  WHERE card_status='yrz'  AND card_id='" + cardId
                            + "'";
            
            SqlUtils.executeUpdate("sc_zzfcard", updateSql3);
            SqlUtils.commit();
        }
        
    }
    
    /**
     * 更新财物代扣房租 缴至日期
     * 
     * @param cardId
     */
    public static void updateDatePayLastFinance(final String yearmonth) {
        ContextStore.get().getEventHandlerContext();
        final String year = yearmonth.substring(0, 4);
        final String month = yearmonth.substring(4, 6);
        final String day = "01";
        final String dateOne = year + '-' + month + '-' + day;
        
        try {
            final String updateDate =
                    "update sc_zzfcard set date_payrent_last = (select last_day(to_date('"
                            + dateOne
                            + "','yyyy-mm-dd')) datetwo from dual) where payment_to='finance' and  card_id in "
                            + "(select card_id from sc_zzfrent_details where year = '" + year
                            + "' and month ='" + month + "' and payment_to ='finance')";
            
            SqlUtils.executeUpdate("sc_zzfcard", updateDate);
            SqlUtils.commit();
            
        } catch (final Exception e) {
        }
        
    }
    
    /**
     * 生成缴费记录 租住类型为短租 短租费用按天计算
     */
    public static void createPaymentLogByDuanZuHouse(final String cardId, final String rentId,
            final String monthRent, final String dateStart, final String dateEnd,
            final String daysDuanzu, final String isDayFirest, final String comment) {
        final String operator = ContextStore.get().getUser().getName();
        
        final String yearDuanZu = dateStart.substring(0, 4);
        final String monthDuanZu = dateStart.substring(5, 7);
        
        final Double dayRent = Double.parseDouble(monthRent) / 30;
        
        final Double monthRentTotal = Integer.parseInt(daysDuanzu) * dayRent;
        // 短租备注上费用是一次性交完房租
        final String insertSql2 =
                "INSERT INTO sc_zzfrent_details(card_id,area_lease,em_id,em_name,"
                        + "dv_name,per_rent,month_rent,amount_payrent,actual_payoff,operator,YEAR,MONTH,rent_id,note1,payment_to) SELECT ca.card_id,"
                        + "ca.area_lease,ca.em_id,ca.em_name,ca.dv_name,ca.curr_rent_rate,"
                        + "desposit_payoff,'" + monthRentTotal + "','" + monthRentTotal + "','"
                        + operator + "','" + yearDuanZu + "','" + monthDuanZu + "','" + rentId
                        + "','" + comment + "','house' FROM sc_zzfcard ca "
                        + "WHERE ca.card_status='yrz'  AND ca.card_id='" + cardId + "'";
        
        SqlUtils.executeUpdate("sc_zzfrent_details", insertSql2);
        SqlUtils.commit();
        
        // 更新缴费截止日期
        final String insertSql3 =
                "update sc_zzfcard set date_payrent_last=to_date( '" + dateEnd
                        + "', 'yyyy-mm-dd') ,is_day_first='" + isDayFirest
                        + "' WHERE card_status='yrz'  AND card_id='" + cardId + "'";
        
        SqlUtils.executeUpdate("sc_zzfcard", insertSql3);
        SqlUtils.commit();
        
    }
    
    public static String calculateYearMonth(String yearMonth, final int num) {
        for (int i = 1; i <= num; i++) {
            String year = yearMonth.substring(0, 4);
            String month = yearMonth.substring(4, 6);
            if (month.equals("12")) {
                month = "01";
                year = Integer.parseInt(year) + 1 + "";
                yearMonth = year + month;
            } else {
                yearMonth = Integer.parseInt(yearMonth) + 1 + "";
            }
        }
        final String newYearMonth = yearMonth;
        return newYearMonth;
    }
}
