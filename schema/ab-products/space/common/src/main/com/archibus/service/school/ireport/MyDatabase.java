package com.archibus.service.school.ireport;

import java.sql.*;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class MyDatabase extends EventHandlerBase {
    
    private final Logger log = Logger.getLogger(this.getClass());
    
    EventHandlerContext context = ContextStore.get().getEventHandlerContext();
    
    private Connection conn = null;
    
    /**
     * 得到连接
     * 
     * @throws SQLException
     */
    public Connection getConnection() throws Exception {
        final com.archibus.config.Database.Immutable db = getDatabase(this.context);
        try {
            this.conn = db.getDataSource().getConnection();
        } catch (final Exception e) {
            this.log.info(e.getMessage());
            throw new Exception(e.toString());
        }
        return this.conn;
    }
    
    /**
     * 关闭连接
     * 
     * @throws SQLException
     */
    public void close(final Connection conn) throws Exception {
        try {
            conn.close();
        } catch (final Throwable e) {
            this.log.info(e.getMessage());
            throw new Exception(e.toString());
        }
    }
    
}
