package com.archibus.service.school.log;

/**
 * 默认系统调用的Service
 * 
 * @author yongli.zhao
 */
public class SysLogService extends LogWrapper {
    private final LogDao dao;
    
    public SysLogService() {
        this.dao = new LogDao();
    }
    
    @Override
    public void save(final Log log) {
        this.dao.save(log);
    }
    
    @Override
    public void update(final Log log, final String primaryKey) {
        this.dao.update(log, primaryKey);
    }
}
