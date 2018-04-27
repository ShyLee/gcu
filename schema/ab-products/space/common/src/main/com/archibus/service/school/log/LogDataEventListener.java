package com.archibus.service.school.log;

import java.util.*;

import org.apache.log4j.Logger;
import org.springframework.context.ApplicationEvent;

import com.archibus.config.Project;
import com.archibus.context.*;
import com.archibus.core.event.data.*;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.Common;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.schema.ArchibusFieldDefBase;
import com.archibus.utility.Utility;

public class LogDataEventListener extends EventHandlerBase implements IDataEventListener {
    
    /**
     * Constant
     */
    private static StringBuffer oldValues = new StringBuffer();
    
    private static StringBuffer newValues = new StringBuffer();
    
    private DataRecord olderDataRecord = new DataRecord();
    
    private final ILog logService = new SysLogService();
    
    private final SyncUtils util;
    
    // final String[] filterTables =
    // { "bu", "dv", "dp", "dp_lv4", "dp_lv5", "dp_lv6", "em", "person_ti", "organization_ti",
    // "afm_activity_params" };
    private String[] managemetTables;
    
    public LogDataEventListener() {
        this.util = new SyncUtils();
    }
    
    /**
     * Implement IDataEventListener must be override below method
     */
    public void onApplicationEvent(final ApplicationEvent event) {
        
        if (event instanceof RecordChangedEvent) {
            final String str = this.util.getValue("AbSystemAdministration", "HWLogDefineTable");
            if (null != str && !"".equals(str)) {
                this.managemetTables = str.split(",");
            } else {
                this.managemetTables = null;
            }
            
            final RecordChangedEvent recordChangedEvent = (RecordChangedEvent) event;
            final String tableName = recordChangedEvent.getTableName();
            if (null == this.managemetTables) {
                return;
            }
            // if table is one of tables that need to log the msds change
            for (final String filterTable : this.managemetTables) {
                if (filterTable.equalsIgnoreCase(tableName)) {
                    onApplicationEventRecordChanged(recordChangedEvent);
                }
            }
        }
    }
    
    /**
     * Handles ApplicationEvent "RecordChanged".
     * 
     * @param recordChangedEvent the event to respond to.
     */
    private void onApplicationEventRecordChanged(final RecordChangedEvent recordChangedEvent) {
        final String tableName = recordChangedEvent.getTableName();
        this.dowithAsUsual(recordChangedEvent, tableName);
    }
    
    /**
     * 
     */
    private void dowithAsUsual(final RecordChangedEvent recordChangedEvent, final String tableName) {
        // boolean indicates if current event is fired after Update or Insert record
        final boolean afterInsertOrUpdate =
                recordChangedEvent.getBeforeOrAfter().equals(BeforeOrAfter.AFTER)
                        && (recordChangedEvent.getChangeType().equals(ChangeType.INSERT) || recordChangedEvent
                            .getChangeType().equals(ChangeType.UPDATE));
        
        // boolean indicates if current event is fired before Delete
        final boolean beforeDelete =
                recordChangedEvent.getBeforeOrAfter().equals(BeforeOrAfter.BEFORE)
                        && recordChangedEvent.getChangeType().equals(ChangeType.DELETE);
        
        final boolean beforeUpdate =
                recordChangedEvent.getBeforeOrAfter().equals(BeforeOrAfter.BEFORE)
                        && (recordChangedEvent.getChangeType().equals(ChangeType.UPDATE));
        
        if (beforeUpdate) {
            /**
             * 用户登录会进入beforeUpdate 进入beforeUpdate 就会调用记录老值的方法 过滤用户登录
             */
            if (!"afm_users".equalsIgnoreCase(tableName)) {
                this.remindOldDataRecord(recordChangedEvent, tableName);
            }
        }
        
        if (afterInsertOrUpdate || beforeDelete) {
            this.conductCommOperate(recordChangedEvent, this.olderDataRecord, tableName);
        }
    }
    
    /**
     * 用于记录变化之前的数据
     * 
     * @param recordChangedEvent
     * @param tableName
     */
    private void remindOldDataRecord(final RecordChangedEvent recordChangedEvent,
            final String tableName) {
        // 新纪录
        final DataRecord dr = recordChangedEvent.getRecord();
        final List<String> primaryKey = this.getPrimaryKeyFields(dr);
        // 老记录
        this.olderDataRecord = LogUtils.getOldDataRecord(primaryKey, dr, tableName);
        
        this.saveDataRecord(this.olderDataRecord, dr, recordChangedEvent, primaryKey);
        
    }
    
    /**
     * 如果是更新操作把老记录 新纪录同时存入数据库中
     * 
     * @param oldRecord
     * @param newRecord
     * @param recordChangedEvent
     */
    private void saveDataRecord(final DataRecord oldRecord, final DataRecord newRecord,
            final RecordChangedEvent recordChangedEvent, final List<String> primaryKey) {
        final Map<String, String> userInfo = this.retriveUserBaseInfo(recordChangedEvent);
        
        if (userInfo != null) {
            // 如果用户已经成功登录记录DataChanged的操作
            final String userName = userInfo.get("userName");
            final String role = userInfo.get("role");
            final String ipAddr = userInfo.get("ipAddr");
            final String operate = recordChangedEvent.getChangeType().name();
            final String target = recordChangedEvent.getTableName();
            final Date date = new Date();
            
            final Log log = new Log(userName, role, ipAddr, operate, target, date);
            // String oldValues = this.getRecordString(oldRecord, target);
            // String newValues = this.getRecordString(newRecord, target);
            // 上面注释是老值 和新值 顺序不一样 下面是测试方法 把新老记录顺序调为一致
            final List<String> oldAndNew = this.getRecordString(oldRecord, newRecord, target);
            if (null != oldAndNew && oldAndNew.size() > 0) {
                log.setOldValues(oldAndNew.get(0));
                log.setNewValues(oldAndNew.get(1));
            } else {
                log.setOldValues("");
                log.setNewValues("");
            }
            log.setFlag(false);
            log.setTargetTablePrimaryKey(LogUtils.getPrimaryKeyString(oldRecord));
            this.logService.save(log);
        }
    }
    
    private void conductCommOperate(final RecordChangedEvent recordChangedEvent,
            final DataRecord orderDateRecord, final String tableName) {
        ContextStore.get().getEventHandlerContext();
        final Map<String, String> userInfo = this.retriveUserBaseInfo(recordChangedEvent);
        // List<String> fieldNames = this.getFieldNames(recordChangedEvent.getRecord());
        // List<String> primaryKey = this.getPrimaryKeyFields(recordChangedEvent.getRecord());
        if (userInfo != null) {
            // 如果用户已经成功登录记录DataChanged的操作
            final String userName = userInfo.get("userName");
            final String role = userInfo.get("role");
            final String ipAddr = userInfo.get("ipAddr");
            final String operate = recordChangedEvent.getChangeType().name();
            final String taget = recordChangedEvent.getTableName();
            final Date date = new Date();
            final DataRecord dr = recordChangedEvent.getRecord();
            dr.getFieldsByName();
            // Map<String, Object> t2 = dr.getValues();
            final Log log = new Log(userName, role, ipAddr, operate, taget, date);
            // 判断当前用的的操作如果是insert 和 delete 就保存Log的description字段
            // 如果是update 需要获得之前的值和修改之后的值 分别初始化Log的oldValues和newValues
            if (recordChangedEvent.getChangeType().equals(ChangeType.DELETE)
                    || recordChangedEvent.getChangeType().equals(ChangeType.INSERT)) {
                final String description = this.getRecordString(dr, tableName);
                if (null != description && !"".equals(description)) {
                    log.setDescription(description);
                }
                this.insertLogRecord(log);
            } else {
                // 如果是更新操作 //更新数据库的操作flag =true
                // List<String> primaryKey = this.getPrimaryKeyFields(dr);
                final String primaryKey = LogUtils.getPrimaryKeyString(dr);
                this.logService.update(log, primaryKey);
            }
            
        }
    }
    
    private void updateLogRecord(final Log log, final String primaryKey) {
        final LogDao dao = new LogDao();
        dao.update(log, primaryKey);
    }
    
    private String getRecordString(final DataRecord dr, final String tableName) {
        final StringBuffer sb = new StringBuffer();
        final List<DataValue> dvalue = dr.getFields();
        
        if (null != dvalue) {
            for (final DataValue dv : dvalue) {
                final String fullTitle = dv.getName();
                // 去掉dataValue对象封装时候默认给的单引号
                // 判断是否是日期类型 是因为系统会自动把日期类型To_date
                String value = "";
                
                if (dv.getFieldDef().getJavaType().getClass().getName().equalsIgnoreCase(
                    "com.archibus.schema.FieldJavaDateImpl")) {
                    if (null == dv.getValue()) {
                        value = "";
                    } else {
                        value = LogUtils.trimBoth(dv.getValue().toString());
                    }
                } else {
                    value = LogUtils.trimBoth(dv.getDbValue().toString());
                }
                
                final String localName =
                        LogUtils.getFieldLocalName(tableName, LogUtils
                            .putFullNameGetFieldName(fullTitle));
                sb.append(localName)
                    .append("(" + LogUtils.putFullNameGetFieldName(fullTitle) + ")").append(
                        " = " + value + "  ");
            }
            return sb.toString();
        } else {
            return "";
        }
    }
    
    private List<String> getRecordString(final DataRecord oldRecord, final DataRecord newRecord,
            final String tableName) {
        
        final StringBuffer oldBuffer = new StringBuffer();
        final StringBuffer newBuffer = new StringBuffer();
        final List<DataValue> oldValues = oldRecord.getFields();
        final List<String> reList = new ArrayList<String>();
        
        try {
            if (null != oldRecord && !oldValues.isEmpty()) {
                for (final DataValue dv : oldValues) {
                    final String fullTitle = dv.getName();
                    // 去掉dataValue对象封装时候默认给的单引号dv.getDbValue().toString()
                    String value = "";
                    
                    if (dv.getFieldDef().getJavaType().getClass().getName().equalsIgnoreCase(
                        "com.archibus.schema.FieldJavaDateImpl")) {
                        if (null == dv.getValue()) {
                            value = "";
                        } else {
                            value = LogUtils.trimBoth(dv.getValue().toString());
                        }
                    } else {
                        value = LogUtils.trimBoth(dv.getDbValue().toString());
                    }
                    
                    final String localName =
                            LogUtils.getFieldLocalName(tableName, LogUtils
                                .putFullNameGetFieldName(fullTitle));
                    final String newRecordValue = this.getValueFromDataValue(fullTitle, newRecord);
                    if (!value.equals(newRecordValue)) {
                        oldBuffer.append(localName).append(
                            "(" + LogUtils.putFullNameGetFieldName(fullTitle) + ")").append(
                            " = " + value);
                        newBuffer.append(localName).append(
                            "(" + LogUtils.putFullNameGetFieldName(fullTitle) + ")").append(
                            " = " + newRecordValue);
                    }
                    // } else {
                    // oldBuffer.append(localName).append(
                    // "(" + LogUtils.putFullNameGetFieldName(fullTitle) + ")").append(
                    // " = " + value + "  ");
                    // newBuffer.append(localName).append(
                    // "(" + LogUtils.putFullNameGetFieldName(fullTitle) + ")").append(
                    // " = " + newRecordValue + "  ");
                    // }
                    
                }
                reList.add(oldBuffer.toString());
                reList.add(newBuffer.toString());
                return reList;
            } else {
                return null;
            }
        } catch (final Exception e) {
            Logger.getLogger(this.getClass()).error(e.getMessage());
            e.printStackTrace();
        }
        return null;
    }
    
    private String getValueFromDataValue(final String key, final DataRecord newDataRecord) {
        final List<DataValue> newValues = newDataRecord.getFields();
        if (null != newValues && !newValues.isEmpty()) {
            for (final DataValue dv : newValues) {
                final String fullTitle = dv.getName();
                // 去掉dataValue对象封装时候默认给的单引号
                String value = "";
                if (fullTitle.equals(key)) {
                    if (dv.getFieldDef().getJavaType().getClass().getName().equalsIgnoreCase(
                        "com.archibus.schema.FieldJavaDateImpl")) {
                        if (null == dv.getValue()) {
                            value = "";
                        } else {
                            value = LogUtils.trimBoth(dv.getValue().toString());
                        }
                    } else {
                        value = LogUtils.trimBoth(dv.getDbValue().toString());
                    }
                    return value;
                }
            }
        }
        return "";
    }
    
    private String getTableName(final DataRecord record) {
        final String tableName =
                Utility.tableNameFromFullName(record.getFields().get(0).getFieldDef().fullName());
        return tableName;
    }
    
    private List<String> getFieldNames(final DataRecord record) {
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
     * returns true if any of primary key of the parent table has been changed
     */
    private String getPrimaryKeyOldValue(final EventHandlerContext context,
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
                if (isEnumType(context, pTableName, pkField)) {
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
    
    private void assemChangedValues(final String fieldTitle, final String oldValue,
            final String newValue) {
        oldValues.append("|");
        oldValues.append(fieldTitle + ":" + oldValue);
        newValues.append("|");
        newValues.append(fieldTitle + ":" + newValue);
    }
    
    private List<String> getPrimaryKeyFields(final DataRecord record) {
        
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
    
    private boolean isEnumType(final EventHandlerContext context, final String tableName,
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
    
    private String getLocalFieldTitle(final EventHandlerContext context, final String tableName,
            final String fieldName) {
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
    
    private void clearValues() {
        oldValues.setLength(0);
        newValues.setLength(0);
    }
    
    private void insertLogRecord(final Log log) {
        final LogDao dao = new LogDao();
        dao.save(log);
    }
    
    /**
     * 返回当前登录的用户信息 确保不是Archibus默认的System
     * 
     * @param recordChangedEvent
     * @return
     */
    private Map<String, String> retriveUserBaseInfo(final RecordChangedEvent recordChangedEvent) {
        final Context requestContext = ContextStore.get();
        final String userName = recordChangedEvent.getUser().getName();
        final String role = recordChangedEvent.getUser().getRole();
        final String ipAddr = LogUtils.getIpAddr(requestContext.getRequest());
        final Map<String, String> userInfo = new HashMap<String, String>();
        if (!userName.equalsIgnoreCase("SYSTEM")) {
            userInfo.put("userName", userName);
            userInfo.put("role", role);
            userInfo.put("ipAddr", ipAddr);
            return userInfo;
        }
        return null;
    }
}
