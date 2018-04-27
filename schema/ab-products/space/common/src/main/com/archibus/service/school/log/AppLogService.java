package com.archibus.service.school.log;

import com.archibus.context.*;

/**
 * 用于单点登录记录用户登录状态 提供的服务
 * 
 * @author zhaoyongli
 */
public class AppLogService extends LogWrapper {
    private final LogDao dao;
    
    Context requestContext = ContextStore.get();
    
    private static final String LOGIN = "LOGIN";
    
    public AppLogService() {
        this.dao = new LogDao();
    }
    
    @Override
    public void login(final String username) {
        final Log log = new Log();
        log.setOperator(username);
        log.setOperate(LOGIN);
        log.setIpAddr(LogUtils.getIpAddr(this.requestContext.getRequest()));
        this.save(log);
    }
    
    @Override
    public void save(final Log log) {
        this.dao.save(log);
    }
}
