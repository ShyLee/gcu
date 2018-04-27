package com.archibus.service.school.house;

import java.util.*;

import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.JobBase;
import com.archibus.jobmanager.JobStatus.JobResult;

public class HistroyDataHandler extends JobBase {
    
    public void updateData() throws Exception {
        this.status.setResult(new JobResult("Update Histroy Data"));
        this.status.setTotalNumber(100);
        this.status.setCurrentNumber(40);
        getHistroyRecordsStepOne();
        this.status.setCurrentNumber(80);
        getHistroyRecordsStepTwo();
        this.status.setCurrentNumber(100);
    }
    
    /**
     * 更新历史数据分两步进行. 1.得到最原始的历史数据，更新每一条合同的累计月和协议状态,如果是外来人员，直接生成其缴费项。
     */
    public void getHistroyRecordsStepOne() throws Exception {
        
        final StringBuffer sql = new StringBuffer();
        sql.append(" select card_id,bl_id,fl_id,rm_id,is_em,date_checkin,date_checkout_ought,date_checkout_actual,money_one,money_two,");
        sql.append(" area_lease,date_payrent_last,card_status,rent_period");
        sql.append(" from sc_zzfcard");
        sql.append(" where is_histroy = '1'");
        final String[] flds =
                new String[] { "card_id", "bl_id", "fl_id", "rm_id", "is_em", "date_checkin",
                        "date_checkout_ought", "date_checkout_actual", "money_one", "money_two",
                        "area_lease", "date_payrent_last", "card_status", "rent_period" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_zzfcard", flds, sql.toString());
        for (int i = 0; i < records.size(); i++) {
            int totalMonth = 0;
            
            DataRecord record = records.get(i);
            String cardId = record.getValue("sc_zzfcard.card_id").toString();
            String blId = record.getValue("sc_zzfcard.bl_id").toString();
            String flId = record.getValue("sc_zzfcard.fl_id").toString();
            String rmId = record.getValue("sc_zzfcard.rm_id").toString();
            String isEm = record.getValue("sc_zzfcard.is_em").toString();
            String cardStatus = record.getValue("sc_zzfcard.card_status").toString();
            String period = record.getValue("sc_zzfcard.rent_period").toString();
            String dateCheckin = record.getValue("sc_zzfcard.date_checkin").toString();
            String dateCheckoutOught = record.getValue("sc_zzfcard.date_checkout_ought").toString();
            String datePayLast = record.getValue("sc_zzfcard.date_payrent_last").toString();
            double priceTwo = Double.valueOf(record.getValue("sc_zzfcard.money_two").toString());
            double area = Double.valueOf(record.getValue("sc_zzfcard.area_lease").toString());
            
            if (cardStatus.equals("ytz")) {
                final String dateCheckoutActual =
                        record.getValue("sc_zzfcard.date_checkout_actual").toString();
                totalMonth = ChylinDateUtils.calcRentTotalMonth(dateCheckin, dateCheckoutActual);
            } else {
                if (isEm == "0") {
                    // 直接生成缴费项(外来人员)
                    CalcZzfRent.othersPaymentHandle(datePayLast, dateCheckoutOught, period,
                        priceTwo, cardId, area);
                } else {
                    totalMonth = ChylinDateUtils.calcRentTotalMonth(dateCheckin, datePayLast);
                }
            }
            updateRecordsStepOne(cardId, totalMonth, cardStatus, blId, flId, rmId);
        }
    }
    
    public void updateRecordsStepOne(String cardId, int totalMonth, String cardStatus, String blId,
            String flId, String rmId) throws Exception {
        StringBuffer sqlUpdateRoom = new StringBuffer();
        sqlUpdateRoom.append("update rm set yzlzys = yzlzys + 1 where bl_id = '" + blId
                + "' and fl_id = '" + flId + "' and rm_id = '" + rmId + "'");
        sqlUpdateRoom.append(" where bl_id = '" + blId + "' and fl_id = '" + flId
                + "' and rm_id = '" + rmId + "'");
        SqlUtils.executeUpdate("rm", sqlUpdateRoom.toString());
        SqlUtils.commit();
        StringBuffer sqlUpdateHistroy = new StringBuffer();
        sqlUpdateHistroy.append("update sc_zzfcard set total_rent = " + totalMonth
                + ", htqx = '1年'");
        sqlUpdateHistroy.append(" where card_id = '" + cardId + "'");
        SqlUtils.executeUpdate("sc_zzfcard", sqlUpdateHistroy.toString());
        SqlUtils.commit();
    }
    
    /**
     * 更新数据分两步进行. 2.通过第一步的更新，再进行生成缴费项必须的量的更新：rate1，rate2,money1,money2,date_one_begin,date_two_begin
     * 
     * @throws Exception
     */
    public void getHistroyRecordsStepTwo() throws Exception {
        final String dateLimit = "2012-7-1";
        int totalMonthAll = 0;
        double rateOne = 0.0;
        double rateTwo = 0.0;
        double moneyOne = 0.0;
        double moneyTwo = 0.0;
        String dateOneBegin = "";
        String dateTwoBegin = "";
        
        final StringBuffer sql = new StringBuffer();
        sql.append(" select card_id,identi_code,is_em,date_work_begin,date_checkin,date_checkout_ought,total_rent,");
        sql.append(" money_one,money_two,area_lease,rent_period,date_payrent_last");
        sql.append(" from sc_zzfcard");
        sql.append(" where is_histroy = '1' and card_status = 'yrz' and is_em = '1'");
        final String[] flds =
                new String[] { "card_id", "identi_code", "is_em", "date_work_begin",
                        "date_checkin", "date_checkout_ought", "total_rent", "money_one",
                        "money_two", "area_lease", "rent_period", "date_payrent_last" };
        final List<DataRecord> records = SqlUtils.executeQuery("sc_zzfcard", flds, sql.toString());
        
        for (int i = 0; i < records.size(); i++) {
            DataRecord record = records.get(i);
            String cardId = record.getValue("sc_zzfcard.card_id").toString();
            String dateWorkBegin = record.getValue("sc_zzfcard.date_work_begin").toString();
            String dateEnd = record.getValue("sc_zzfcard.date_checkout_ought").toString();
            String datePayment = record.getValue("sc_zzfcard.date_payrent_last").toString();
            String period = record.getValue("sc_zzfcard.rent_period").toString();
            double priceOne = Double.valueOf(record.getValue("sc_zzfcard.money_one").toString());
            double priceTwo = Double.valueOf(record.getValue("sc_zzfcard.money_two").toString());
            double area = Double.valueOf(record.getValue("sc_zzfcard.area_lease").toString());
            String identiCode = record.getValue("sc_zzfcard.identi_code").toString();
            
            totalMonthAll = calcMonths(identiCode);
            if (ChylinDateUtils.dateCompare(dateWorkBegin, dateLimit)) {
                rateOne = 100;
                rateTwo = 100;
                moneyOne = priceOne;
                moneyTwo = priceTwo;
                dateOneBegin = datePayment;
                if (totalMonthAll < 36) {
                    dateTwoBegin =
                            ChylinDateUtils.getNMonthLaterFirstDay(datePayment,
                                (12 - totalMonthAll % 12));
                } else {
                    moneyOne = priceTwo;
                }
            } else {
                moneyOne = priceTwo;
                moneyTwo = priceTwo;
                dateOneBegin = datePayment;
                if (totalMonthAll < 36) {
                    dateTwoBegin =
                            ChylinDateUtils.getNMonthLaterFirstDay(datePayment,
                                (12 - totalMonthAll % 12));
                }
                if (totalMonthAll == 0 || totalMonthAll == 12 || totalMonthAll == 24
                        || totalMonthAll >= 36) {
                    if (totalMonthAll == 0) {
                        rateOne = 60;
                    } else if (totalMonthAll == 12) {
                        rateOne = 70;
                    } else if (totalMonthAll == 24) {
                        rateOne = 80;
                    } else if (totalMonthAll >= 36) {
                        rateOne = 100;
                    }
                } else {
                    if (totalMonthAll > 0 && totalMonthAll <= 12) {
                        rateOne = 60;
                        rateTwo = 70;
                    } else if (totalMonthAll > 12 && totalMonthAll <= 24) {
                        rateOne = 70;
                        rateTwo = 80;
                    } else if (totalMonthAll > 24 && totalMonthAll <= 36) {
                        rateOne = 80;
                        rateTwo = 100;
                    }
                }
            }
            updateRecordsStepTwo(cardId, rateOne, rateTwo, dateOneBegin, dateTwoBegin, moneyOne,
                moneyTwo);
            CalcZzfRent.employeePaymentHandle(dateOneBegin, dateTwoBegin, dateEnd, period,
                moneyOne, moneyTwo, rateOne, rateTwo, cardId, area);
        }
    }
    
    public void updateRecordsStepTwo(String cardId, double rateOne, double rateTwo,
            String dateOneBegin, String dateTwoBegin, double moneyOne, double moneyTwo) {
        StringBuffer sqlUpdateHistroy = new StringBuffer();
        sqlUpdateHistroy.append("update sc_zzfcard set rate_one = " + rateOne + ",rate_two = "
                + rateTwo + ",money_one = " + moneyOne + ",money_two = " + moneyTwo
                + ",date_one_begin = to_date('" + dateOneBegin
                + "','yyyy-mm-dd'),date_two_begin = to_date('" + dateTwoBegin
                + "','yyyy-mm-dd'),is_histroy='2'");
        sqlUpdateHistroy.append(" where card_id = '" + cardId + "'");
        SqlUtils.executeUpdate("sc_zzfcard", sqlUpdateHistroy.toString());
        // SqlUtils.commit();
    }
    
    /**
     * 获取累计租住时间(月)
     */
    public int calcMonths(String identiCode) {
        int totalMonthAll = 0;
        
        StringBuffer sql = new StringBuffer();
        sql.append("select total_rent");
        sql.append(" from sc_zzfcard");
        sql.append(" where identi_code = '" + identiCode + "'");
        String[] flds = new String[] { "total_rent" };
        List<DataRecord> records = SqlUtils.executeQuery("sc_zzfcard", flds, sql.toString());
        for (int i = 0; i < records.size(); i++) {
            DataRecord record = records.get(i);
            int month = Integer.valueOf(record.getValue("sc_zzfcard.total_rent").toString());
            totalMonthAll += month;
        }
        
        return totalMonthAll;
    }
}
