package com.archibus.service.school.dbf;

import java.sql.*;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class getConnection extends EventHandlerBase {
    
    EventHandlerContext context = ContextStore.get().getEventHandlerContext();
    
    public Connection conn = null;
    
    public getConnection() {
        
    }
    
    /**
     * 得到连接
     * 
     * @throws SQLException
     */
    public Connection get() throws Exception {
        final com.archibus.config.Database.Immutable db = getDatabase(this.context);
        try {
            this.conn = db.getDataSource().getConnection();
        } catch (final Exception e) {
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
            throw new Exception(e.toString());
        }
    }
}
