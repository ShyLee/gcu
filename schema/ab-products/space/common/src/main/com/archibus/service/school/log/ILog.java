package com.archibus.service.school.log;

/**
 * 日志系统接口
 * 
 * @author zhaoyongli
 */
public interface ILog {
    public void save(Log log);
    
    public void update(Log log, String primaryKey);
    
    public void login(String username);
}
