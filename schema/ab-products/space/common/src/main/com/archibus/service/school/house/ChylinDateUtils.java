package com.archibus.service.school.house;

import java.text.*;
import java.util.*;

public class ChylinDateUtils {
    /**
     * 缴费周期转换为计算房租时间
     */
    public static int getRentMonthsByPeriod(final String period) {
        int flag = 0;
        if (period.equals("Month")) {
            flag = 1;
        } else if (period.equals("Quarter")) {
            flag = 3;
        } else if (period.equals("Halfyear")) {
            flag = 6;
        } else {
            flag = 12;
        }
        return flag;
    }
    
    /**
     * 判断是否闰年
     */
    public static Boolean isLeapYear(final int year) {
        if ((year % 400) == 0) {
            return true;
        } else if ((year % 4) == 0) {
            if ((year % 100) == 0) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
        
    }
    
    /**
     * 获取两个日期间的天数
     */
    public static long getDays(final String date1, final String date2) throws ParseException {
        final Date dateBeg = new SimpleDateFormat("yyyy-MM-dd").parse(date1);
        final Date dateEnd = new SimpleDateFormat("yyyy-MM-dd").parse(date2);
        final long days = (dateEnd.getTime() - dateBeg.getTime()) / (1000 * 60 * 60 * 24) + 1;
        return days;
    }
    
    /**
     * 获取N个月后的月初 2014-5-3运算3个月后的日期得到2014-8-1 (可用于生成下一个缴费项开始日期)
     */
    public static String getNMonthLaterFirstDay(final String date, final int n) throws Exception {
        final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        final Date d = new SimpleDateFormat("yyyy-MM-dd").parse(date);
        final Calendar cal_1 = Calendar.getInstance();
        cal_1.setTime(d);
        cal_1.add(Calendar.MONTH, n);
        cal_1.set(Calendar.DAY_OF_MONTH, 1);
        final String firstDay = format.format(cal_1.getTime());
        return firstDay;
    }
    
    /**
     * 获取N个月后的月末 2014-5-3运算3个月后日期得到2014-7-31 (可用于生成这个缴费项截止日期)
     */
    public static String getNMonthLaterLastDay(final String date, final int n) throws Exception {
        final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
        final Date d = new SimpleDateFormat("yyyy-MM-dd").parse(date);
        final Calendar cale = Calendar.getInstance();
        cale.setTime(d);
        cale.add(Calendar.MONTH, n);
        cale.set(Calendar.DAY_OF_MONTH, 0);
        final String lastDay = format.format(cale.getTime());
        return lastDay;
    }
    
    /**
     * 得到每个月的日租金
     */
    public static double getPriceOfMonth(final String date, final double price) throws Exception {
        final Date d = new SimpleDateFormat("yyyy-MM-dd").parse(date);
        final Calendar cale = Calendar.getInstance();
        cale.setTime(d);
        final int year = cale.get(Calendar.YEAR);
        final int month = cale.get(Calendar.MONTH) + 1;
        double pricePerMonth = 0;
        switch (month) {
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
                pricePerMonth = price / 31;
                break;
            case 4:
            case 6:
            case 9:
            case 11:
                pricePerMonth = price / 30;
                break;
            case 2:
                if (isLeapYear(year)) {
                    pricePerMonth = price / 29;
                } else {
                    pricePerMonth = price / 28;
                }
                break;
        }
        return pricePerMonth;
    }
    
    /**
     * 比较两个日期的大小,返回date1<date2的Boolean值
     */
    public static Boolean dateCompare(final String date1, final String date2) throws Exception {
        final Date d1 = new SimpleDateFormat("yyyy-MM-dd").parse(date1);
        final Date d2 = new SimpleDateFormat("yyyy-MM-dd").parse(date2);
        final Boolean bool = (d1.getTime() <= d2.getTime());
        return bool;
    }
    
    /**
     * 计算累计时间(月)
     */
    public static int calcRentTotalMonth(String dateBegin, String dateEnd) throws Exception {
        int result = 0;
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Calendar c1 = Calendar.getInstance();
        Calendar c2 = Calendar.getInstance();
        c1.setTime(sdf.parse(dateBegin));
        c2.setTime(sdf.parse(dateEnd));
        if (c2.get(Calendar.YEAR) == c1.get(Calendar.YEAR)) {
            if (c2.get(Calendar.DATE) > c1.get(Calendar.DATE)) {
                result =
                        c2.get(Calendar.MONDAY) - c1.get(Calendar.MONTH)
                                + (c2.get(Calendar.YEAR) - c1.get(Calendar.YEAR)) * 12 + 2;
            } else {
                result =
                        c2.get(Calendar.MONDAY) - c1.get(Calendar.MONTH)
                                + (c2.get(Calendar.YEAR) - c1.get(Calendar.YEAR)) * 12 + 1;
            }
        } else if (c2.get(Calendar.YEAR) > c1.get(Calendar.YEAR)) {
            if (c2.get(Calendar.DATE) > c1.get(Calendar.DATE)) {
                result =
                        c2.get(Calendar.MONDAY) - c1.get(Calendar.MONTH)
                                + (c2.get(Calendar.YEAR) - c1.get(Calendar.YEAR)) * 12 + 1;
            } else {
                result =
                        c2.get(Calendar.MONDAY) - c1.get(Calendar.MONTH)
                                + (c2.get(Calendar.YEAR) - c1.get(Calendar.YEAR)) * 12;
            }
        }
        return result;
    }
}
