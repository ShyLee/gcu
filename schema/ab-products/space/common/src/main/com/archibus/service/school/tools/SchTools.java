package com.archibus.service.school.tools;

import java.text.SimpleDateFormat;
import java.util.*;

import org.json.*;

import com.archibus.context.*;
import com.archibus.context.User.EmployeeVO;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.Common;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.Utility;

public final class SchTools extends EventHandlerBase {
    
    /**
     * return a value from Map. If this value not exist, return empty
     * 
     * @param record
     * @param name
     * @return String
     */
    public static String getString(final Map record, final String name) {
        String s = (String) record.get(name);
        if (s == null) {
            s = "";
        }
        return s;
    }
    
    /**
     * Changing HH:MM PM and am format into HH:MM:SS format
     * 
     * @param date
     * @return String
     */
    public static String transformDate(final String date) {
        String result = date;
        if (date.toUpperCase().indexOf("AM") > -1 || date.toUpperCase().indexOf("PM") > -1) {
            
            String hour = date.substring(0, date.indexOf(":"));
            final String minute = date.substring(date.indexOf(":") + 1, date.indexOf(" "));
            if (date.indexOf("AM") > -1) {
                hour = (hour.equals("12") ? "00" : hour);
            }
            if (date.indexOf("PM") > -1) {
                hour = (hour.equals("12") ? hour : String.valueOf(Integer.parseInt(hour) + 12));
            }
            result = hour + ":" + minute + ":00";
        }
        return result;
    }
    
    /**
     * return true if an field exists in the JSONArray
     * 
     * @param JSONArray elements
     * @param String field
     * @return boolean
     */
    public static boolean exists(final JSONArray elements, final String field) {
        
        boolean found = false;
        int count = 0;
        while ((!found) && (count < elements.length())) {
            found = elements.get(count).equals(field);
            count++;
        }
        return found;
    }
    
    /**
     * compare two object and return true if they are equals
     * 
     * @param Object o
     * @param Object oo
     * @return String
     */
    public static String equal(final Object o, final Object oo) {
        if (o.equals(oo)) {
            return "true";
        } else {
            return "false";
        }
    }
    
    /**
     * check whether the two date in the same month
     * 
     * @param date1
     * @param date2
     * @return boolean
     */
    public static boolean isTwoDateInSameMonth(final Date date1, final Date date2) {
        final Calendar c = Calendar.getInstance();
        c.setTime(date1);
        final int year1 = c.get(Calendar.YEAR);
        final int month1 = c.get(Calendar.MONTH);
        c.setTime(date2);
        final int year2 = c.get(Calendar.YEAR);
        final int month2 = c.get(Calendar.MONTH);
        return (year1 == year2) && (month1 == month2);
        
    }
    
    public static String getCurrentDate(final EventHandlerContext context) {
        final java.sql.Date date = Utility.currentDate();
        return formatSqlFieldValue(context, date, "java.sql.Date", "current_date");
    }
    
    public static String getSysDate() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        return Common.getCurrentDate(context);
    }
    
    /**
     * yyyy-mm-dd
     * 
     * @return
     */
    public static String getISOShortDate() {
        final java.util.Date curDate = new Date(System.currentTimeMillis());
        final SimpleDateFormat dayFormat = new SimpleDateFormat("dd");
        final SimpleDateFormat monthFormat = new SimpleDateFormat("MM");
        final SimpleDateFormat yearFormat = new SimpleDateFormat("yyyy");
        final String year = yearFormat.format(curDate);
        final String month = monthFormat.format(curDate);
        final String day = dayFormat.format(curDate);
        return year + "-" + month + "-" + day;
    }
    
    /**
     * 
     * @return
     */
    public static String getISOMonth() {
        final java.util.Date curDate = new Date(System.currentTimeMillis());
        final SimpleDateFormat monthFormat = new SimpleDateFormat("MM");
        final String month = monthFormat.format(curDate);
        
        return month;
    }
    
    public static EmployeeVO getEmpFromUser(final User user) {
        final EmployeeVO employee = user.getEmployee();
        final String user_name = user.getName();
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Object[] empRec =
                selectDbValues(context, "em", new String[] { "em_id", "name", "em_number", "dv_id",
                        "dp_id", "bl_id", "fl_id", "rm_id", "zhic_id", "zhiw_id", "email" },
                    " em_id='" + user_name + "'");
        if (empRec != null) {
            {
                employee.setId(empRec[0] == null ? "" : empRec[0].toString());
                employee.setNumber(empRec[2] == null ? "" : empRec[2].toString());
                
            }
            {
                employee.getOrganization().setDepartmentId(
                    empRec[4] == null ? "" : empRec[4].toString());
                employee.getOrganization().setDivisionId(
                    empRec[3] == null ? "" : empRec[3].toString());
            }
            
            {
                employee.getSpace().setRoomId(empRec[7] == null ? "" : empRec[7].toString());
                employee.getSpace().setFloorId(empRec[6] == null ? "" : empRec[6].toString());
                employee.getSpace().setBuildingId(empRec[5] == null ? "" : empRec[5].toString());
            }
        }
        return employee;
    }
    
    /**
     * kevenxi added update user's email where update employee's email
     * 
     * @param emailFrom
     * @param emailTo
     */
    public static void updateUserEmail(final String emailFrom, final String emailTo) {
        if (emailFrom != "") {
            final String sql =
                    "  UPDATE afm_users SET email ='" + emailTo + "' WHERE email='" + emailFrom
                            + "'";
            SqlUtils.executeUpdate("afm_users", sql);
        }
    }
    
    /**
     * 固定主键生成
     * 
     * @param flag
     * @param table
     * @param field
     */
    public static void getUniquePKeyCode(final String flag, final String table,
            final String key_field, final String sysDatefield) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Calendar.getInstance();
        String recCount = "";
        final String strSQL =
                "select recCount from (select " + key_field + " as recCount from " + table
                        + "  order by " + sysDatefield + " desc )  where  rownum='1' ";
        
        final List recs = selectDbRecords(context, strSQL);
        for (final Iterator it = recs.iterator(); it.hasNext();) {
            final Object[] record = (Object[]) it.next();
            recCount = notNull(record[0]).toString();
        }
        String resultString = null;
        int count = 0;
        final Date currentTime = new Date();
        final SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        final String dateString = formatter.format(currentTime);
        if (recCount != "") {
            final int length = recCount.length();
            count = Integer.parseInt(recCount.substring(length - 3, length));
            
            if (count < 10) {
                resultString = flag + dateString.replace("-", "") + "00" + (count + 1);
            }
            if (count > 8 && count < 99) {
                resultString = flag + dateString.replace("-", "") + "0" + (count + 1);
            }
        } else {
            if (count < 10) {
                resultString = flag + dateString.replace("-", "") + "00" + (count + 1);
            }
            
        }
        
        final JSONObject json = new JSONObject();
        json.put("dealID", resultString.toString());
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    /**
     * get project Folder
     * 
     * @return
     */
    public static String getProjectFolder() {
        final com.archibus.context.Context context = ContextStore.get();
        return context.getCurrentContext().getAttribute("/*/preferences/@projectFolder");
    }
    
}
