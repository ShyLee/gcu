package com.archibus.service.school.log;

import java.util.Date;

/**
 * 日志实体类
 * 
 * @author zhaoyongli 812273436@qq.com
 */
public class Log {
    public Log() {
        // TODO Auto-generated constructor stub
    }
    
    public Log(final String operator, final String role, final String ipAddr, final String operate,
            final String target, final Date operDate) {
        super();
        this.operator = operator;
        this.role = role;
        this.ipAddr = ipAddr;
        this.operate = operate;
        this.target = target;
        this.operDate = operDate;
    }
    
    public Date getOperDate() {
        return this.operDate;
    }
    
    public void setOperDate(final Date operDate) {
        this.operDate = operDate;
    }
    
    private String id;
    
    private String operator;
    
    private String role;
    
    private String ipAddr;
    
    private String operate;
    
    private String target;
    
    private Date operDate;
    
    private String oldValues;
    
    private String newValues;
    
    private String description;
    
    private boolean flag = true;
    
    private String targetTablePrimaryKey;
    
    public String getId() {
        return this.id;
    }
    
    public void setId(final String id) {
        this.id = id;
    }
    
    public String getOperator() {
        return this.operator;
    }
    
    public void setOperator(final String operator) {
        this.operator = operator;
    }
    
    public String getRole() {
        return this.role;
    }
    
    public void setRole(final String role) {
        this.role = role;
    }
    
    public String getIpAddr() {
        return this.ipAddr;
    }
    
    public void setIpAddr(final String ipAddr) {
        this.ipAddr = ipAddr;
    }
    
    public String getOperate() {
        return this.operate;
    }
    
    public void setOperate(final String operate) {
        this.operate = operate;
    }
    
    public String getTarget() {
        return this.target;
    }
    
    public void setTarget(final String target) {
        this.target = target;
    }
    
    public String getOldValues() {
        return this.oldValues;
    }
    
    public void setOldValues(final String oldValues) {
        this.oldValues = oldValues;
    }
    
    public String getNewValues() {
        return this.newValues;
    }
    
    public void setNewValues(final String newValues) {
        this.newValues = newValues;
    }
    
    public String getDescription() {
        return this.description;
    }
    
    public void setDescription(final String description) {
        this.description = description;
    }
    
    public boolean isFlag() {
        return this.flag;
    }
    
    public void setFlag(final boolean flag) {
        this.flag = flag;
    }
    
    public String getTargetTablePrimaryKey() {
        return this.targetTablePrimaryKey;
    }
    
    public void setTargetTablePrimaryKey(final String targetTablePrimaryKey) {
        this.targetTablePrimaryKey = targetTablePrimaryKey;
    }
    
}
