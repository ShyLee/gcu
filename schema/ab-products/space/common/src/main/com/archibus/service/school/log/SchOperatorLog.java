package com.archibus.service.school.log;

import java.util.*;

import javax.servlet.http.HttpServletRequest;

import com.archibus.config.Project;
import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.Common;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.schema.ArchibusFieldDefBase;
import com.archibus.service.school.tools.SchTools;
import com.archibus.utility.Utility;

public class SchOperatorLog extends EventHandlerBase {
    
    public static final String DELETE_OPERATION = "DELETED";
    
    public static final String INSERT_OPERATION = "INSERTED";
    
    public static final String UPDATE_OPERATION = "UPDATED";
    
    public static final String LOGIN_OPERATION = "LOGIN";
    
    private static StringBuffer oldValues = new StringBuffer();
    
    private static StringBuffer newValues = new StringBuffer();
    
    public static void writeUsmsUpdateLog(final DataRecord updatedRecord, final String operation) {
        final Context requestContext = ContextStore.get();
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final User user = ContextStore.get().getUser();
        // String operator = user.getName();
        final String userName = user.getName();
        
        // 通过登录用户名(em表中的em_id)获取用户名(name)存入日志记录中的operator
        final String operator = getEmNameByUserName(userName);
        
        final String role = user.getRole();
        
        final String operator_dvId =
                SchTools.getEmpFromUser(user).getOrganization().getDivisionId();
        
        boolean isLogined = false;
        if (operation.equals(LOGIN_OPERATION)) {
            isLogined = getLogined(updatedRecord);
        }
        
        final boolean isNewRecord = updatedRecord.isNew();
        String operation1 = operation;
        if (!operation.equals(DELETE_OPERATION) && !operation.equals(LOGIN_OPERATION)) {
            if (isNewRecord) {
                operation1 = INSERT_OPERATION;
            } else {
                operation1 = UPDATE_OPERATION;
            }
        }
        
        final String ipAddr = getIpAddr(requestContext.getRequest());
        /** add login log 2012-5-3 **/
        String tableName = "";
        String tableTitle = "";
        String taskName = "";
        String pkValues = "";
        
        if (!operation.equals(LOGIN_OPERATION)) {
            tableName = getTableName(updatedRecord);
            tableTitle = getTableTitle(context, tableName);
            taskName = getProcessAndTask(requestContext.getRequest());
            pkValues =
                    getPrimaryKeyOldValue(context, updatedRecord, tableName,
                        getPrimaryKeyFields(updatedRecord));
        }
        
        if (operation.equals(UPDATE_OPERATION) || operation.equals(INSERT_OPERATION)) {
            getChangedFields(context, updatedRecord, tableName, getFieldNames(updatedRecord));
            final String t_oldValues = oldValues.toString();
            final String t_newValues = newValues.toString();
            if (!t_oldValues.equals("")) {
                createUpdateLogRec(operator, role, operator_dvId, ipAddr, taskName, operation1,
                    tableTitle, t_oldValues, t_newValues, pkValues);
            }
        } else {
            if (operation.equals(LOGIN_OPERATION)) {
                String loginedDesc = "登陆失败";
                if (isLogined) {
                    loginedDesc = "登陆成功";
                }
                createUpdateLogRec(operator, role, operator_dvId, ipAddr, taskName, operation1,
                    tableTitle, "", "", loginedDesc);
            } else {
                createUpdateLogRec(operator, role, operator_dvId, ipAddr, taskName, operation1,
                    tableTitle, "", "", pkValues);
            }
            
        }
        
        // log.isDebugEnabled().debug("Parsing template for ");
        
    }
    
    /**
     * 
     * @param operator
     * @param role
     * @param operator_dvId
     * @param ipAddr
     * @param taskName
     * @param Operation
     * @param tableName
     * @param oldValues
     * @param newValues
     * @param description
     */
    private static void createUpdateLogRec(final String operator, final String role,
            final String operator_dvId, final String ipAddr, final String taskName,
            final String Operation, final String tableName, final String oldValues,
            final String newValues, final String description) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String insertSql =
                " insert into sc_update_log(operator,role_name,dv_id,ip_addr,task_name,operate_type,table_name, old_values,new_values,description)"
                        + " values("
                        + literal(context, operator)
                        + ","
                        + literal(context, role)
                        + ","
                        + literal(context, operator_dvId)
                        + ","
                        + literal(context, ipAddr)
                        + ","
                        + literal(context, taskName)
                        + ","
                        + literal(context, Operation)
                        + ","
                        + literal(context, tableName)
                        + ","
                        + literal(context, oldValues)
                        + ","
                        + literal(context, newValues)
                        + ","
                        + literal(context, description)
                        + ")";
        SqlUtils.executeUpdate("sc_update_log", insertSql);
        SqlUtils.commit();
    }
    
    /**
     * kevenxi add 2012-5-3
     * 
     * @param record
     * @return
     */
    private static boolean getLogined(final DataRecord record) {
        boolean isLogined = false;
        String logined = "";
        final DataValue dataV = record.findField("afm_tbls.title");
        if (dataV != null) {
            logined = dataV.getValue().toString();
        }
        if (logined.equals("true")) {
            isLogined = true;
        }
        
        return isLogined;
    }
    
    /**
     * 
     * @param record
     * @return
     */
    private static List<String> getFieldNames(final DataRecord record) {
        
        // get project
        final Project.Immutable project = ContextStore.get().getProject();
        
        final String tableName =
                Utility.tableNameFromFullName(record.getFields().get(0).getFieldDef().fullName());
        final List<String> fldNames = new ArrayList<String>();
        for (final ArchibusFieldDefBase.Immutable fieldDef : project.loadTableDef(tableName)
            .getFieldsList()) {
            fldNames.add(fieldDef.getName());
        }
        return fldNames;
    }
    
    /**
     * 
     * @param record
     * @param pTableName
     * @param fldNames
     * @return
     */
    private static List<String> getChangedFields(final EventHandlerContext context,
            final DataRecord record, final String pTableName, final List<String> fldNames) {
        final List<String> changeFldNames = new ArrayList<String>();
        
        clearValues();
        
        Object oldV = new Object();
        Object newV = new Object();
        String oldValue = "";
        String newValue = "";
        
        for (final String fieldName : fldNames) {
            final String fullFldName = pTableName + "." + fieldName;
            final DataValue dataV = record.findField(fullFldName);
            if (dataV != null) {
                
                oldV = dataV.getOldValue();
                newV = dataV.getValue();
                if (oldV != null) {
                    oldValue = oldV.toString();
                }
                if (newV != null) {
                    newValue = newV.toString();
                }
                if (isEnum(context, pTableName, fieldName)) {
                    oldValue = getEnumFieldDisplayedValue(context, pTableName, fieldName, oldValue);
                    newValue = getEnumFieldDisplayedValue(context, pTableName, fieldName, newValue);
                }
                if (!oldValue.equals(newValue)) {
                    final String fieldtitle = getLocalFieldTitle(context, pTableName, fieldName);
                    changeFldNames.add(fieldtitle + ":" + oldValue + "-->" + newValue);
                    assemChangedValues(fieldtitle, oldValue, newValue);
                }
            } else {
                
            }
        }
        return changeFldNames;
    }
    
    /**
     * returns true if any of primary key of the parent table has been changed
     */
    private static String getPrimaryKeyOldValue(final EventHandlerContext context,
            final DataRecord updatedRecord, final String pTableName, final List<String> pkFields) {
        
        final StringBuffer pkValues = new StringBuffer();
        String pkValue = "";
        for (final String pkField : pkFields) {
            final String primaryKeyName = pTableName + "." + pkField;
            final DataValue dataV = updatedRecord.findField(primaryKeyName);
            if (dataV != null) {
                if (updatedRecord.isNew()) {
                    final Object newV = dataV.getValue();
                    if (newV != null) {
                        pkValue = newV.toString();
                    }
                } else {
                    final Object oldV = dataV.getOldValue();
                    if (oldV != null) {
                        pkValue = oldV.toString();
                    }
                }
                if (isEnum(context, pTableName, pkField)) {
                    pkValue = getEnumFieldDisplayedValue(context, pTableName, pkField, pkValue);
                }
                final String primaryKeyTitle = getLocalFieldTitle(context, pTableName, pkField);
                pkValues.append(primaryKeyTitle);
                pkValues.append(":");
                pkValues.append(pkValue);
                pkValues.append("|");
            } else {
                
            }
            
        }
        return pkValues.toString();
    }
    
    /**
     * Called to get the list of primary key fields of the table from which the record is deleted.
     */
    private static List<String> getPrimaryKeyFields(final DataRecord record) {
        
        // get project
        final Project.Immutable project = ContextStore.get().getProject();
        
        final String tableName =
                Utility.tableNameFromFullName(record.getFields().get(0).getFieldDef().fullName());
        final List<String> pkNames = new ArrayList<String>();
        for (final ArchibusFieldDefBase.Immutable fieldDef : project.loadTableDef(tableName)
            .getPrimaryKey().getFields()) {
            pkNames.add(fieldDef.getName());
        }
        return pkNames;
    }
    
    private static boolean isEnum(final EventHandlerContext context, final String tableName,
            final String fieldName) {
        final Object field =
                Common.getValue(context, "afm_flds", "field_name", "table_name = '" + tableName
                        + "' and field_name='" + fieldName + "' and enum_list is not null");
        if (field != null) {
            return true;
        } else {
            return false;
        }
        
    }
    
    private static String getLocalFieldTitle(final EventHandlerContext context,
            final String tableName, final String fieldName) {
        String fldZHTitle = tableName + "." + fieldName;
        
        Object fieldTitle =
                Common.getValue(context, "afm_flds_lang", "ml_heading_ch", "table_name = '"
                        + tableName + "' and field_name='" + fieldName + "'");
        
        if (fieldTitle == null || fieldTitle.toString().length() == 0) {
            fieldTitle =
                    Common.getValue(context, "afm_flds", "ml_heading", "table_name = '" + tableName
                            + "' and field_name='" + fieldName + "'");
            if (fieldTitle != null && fieldTitle.toString().length() > 0) {
                fldZHTitle = fieldTitle.toString();
            }
        } else {
            fldZHTitle = fieldTitle.toString();
        }
        
        return fldZHTitle;
    }
    
    /**
     * 
     */
    private static void clearValues() {
        oldValues.setLength(0);
        newValues.setLength(0);
    }
    
    /**
     * 
     * @param tableName
     * @param fieldName
     * @param oldValue
     * @param newValue
     */
    private static void assemChangedValues(final String fieldTitle, final String oldValue,
            final String newValue) {
        oldValues.append("|");
        oldValues.append(fieldTitle + ":" + oldValue);
        newValues.append("|");
        newValues.append(fieldTitle + ":" + newValue);
    }
    
    /**
     * get table name of this operation
     * 
     * @param record
     * @return
     */
    private static String getTableName(final DataRecord record) {
        final String tableName =
                Utility.tableNameFromFullName(record.getFields().get(0).getFieldDef().fullName());
        
        return tableName;
    }
    
    /**
     * get table name of this operation
     * 
     * @param record
     * @return
     */
    private static String getTableTitle(final EventHandlerContext context, final String tableName) {
        final Object tableTitle =
                Common
                    .getValue(context, "afm_tbls", "title_ch", "table_name = '" + tableName + "'");
        
        return tableTitle.toString();
        
    }
    
    /**
     * get Request Ip Address
     * 
     * @param request
     * @return
     */
    private static String getIpAddr(final HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
    
    /**
     * get Request Processes+Task name
     * 
     * @param request
     * @return String afm_processes.title_ch+afm_ptasks.task_ch
     */
    private static String getProcessAndTask(final HttpServletRequest request) {
        String viewName = request.getHeader("Referer");
        final int start = viewName.lastIndexOf("/") + 1;
        final int end = viewName.length();
        viewName = viewName.substring(start, end);
        final DataSource ds = DataSourceFactory.createDataSource();
        ds.addTable("afm_ptasks", DataSource.ROLE_MAIN);
        ds.addTable("afm_processes", DataSource.ROLE_STANDARD);
        ds.addField("afm_ptasks", "task_file");
        ds.addField("afm_ptasks", "process_id");
        ds.addField("afm_ptasks", "task_ch");
        ds.addField("afm_processes", "process_id");
        ds.addField("afm_processes", "title_ch");
        
        final DataRecord procAndTaskRec = ds.getRecord(" afm_ptasks.task_file ='" + viewName + "'");
        if (procAndTaskRec != null) {
            final String task_ch = (String) procAndTaskRec.getValue("afm_ptasks.task_ch");
            final String p_title_ch = (String) procAndTaskRec.getValue("afm_processes.title_ch");
            final String title = p_title_ch + "-->" + task_ch;
            return title;
        } else {
            return viewName;
        }
    }
    
    private static String getEmNameByUserName(final String userName) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final String sql =
                "select name from em,afm_users  where em.email=afm_users.email and em_id= '"
                        + userName + "'";
        final List records = retrieveDbRecords(context, sql);
        String name = "";
        if (!records.isEmpty()) {
            final Map record = (Map) records.get(0);
            name = record.get("name").toString();
        }
        // 判断name是否为空，如果为空，则返回登录的username，否则返回从em表中查出的name
        if (name == "") {
            return userName;
        } else {
            return name;
        }
    }
}
