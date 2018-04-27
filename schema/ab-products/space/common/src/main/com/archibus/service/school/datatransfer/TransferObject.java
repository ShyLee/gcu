package com.archibus.service.school.datatransfer;

import java.util.ArrayList;

public class TransferObject implements Cloneable {
    private String tableName = null;
    
    private String tableTitle = null;
    
    private String WhereSql = null;
    
    private ArrayList<String> fieldsList = new ArrayList<String>();
    
    private String fieldsString = null;
    
    @Override
    public TransferObject clone() {
        TransferObject to = null;
        try {
            to = (TransferObject) super.clone();
            this.fieldsList = (ArrayList<String>) this.fieldsList.clone();
        } catch (final CloneNotSupportedException e) {
            e.printStackTrace();
        }
        return to;
    }
    
    public void setTableName(final String value) {
        this.tableName = value;
    }
    
    public String getTableName() {
        return this.tableName;
    }
    
    public void setFieldName(final String name) {
        // ? 封装成 com.archibus.schema.Field，好在实现中做类型检查，特别是日期类型
        
        this.fieldsList.add(name);
    }
    
    public ArrayList<String> getFieldsList() {
        return this.fieldsList;
    }
    
    public void setTableTitle(final String tableTitle) {
        this.tableTitle = tableTitle;
    }
    
    public String getTableTitle() {
        return this.tableTitle;
    }
    
    public void setWhereSql(final String whereSql) {
        this.WhereSql = whereSql;
    }
    
    public String getWhereSql() {
        return this.WhereSql;
    }
    
    public void setFieldsString(final String fieldsString) {
        this.fieldsString = fieldsString;
    }
    
    public String getFieldsString() {
        return this.fieldsString;
    }
    
}
