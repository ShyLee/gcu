package com.archibus.basic.data.service;

public interface AjaxDataService {
    public String sumForTable(String tableName, String fieldName, String restriction);
    
    public String countForTable(String tableName, String fieldName, String restriction);
    
    public String executeSQL(String sql);
    
    public String getUserName();
    
    public String updateDataSchema(String tableName);
    
}
