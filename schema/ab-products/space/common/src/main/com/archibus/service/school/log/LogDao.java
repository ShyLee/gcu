package com.archibus.service.school.log;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.context.utility.DataSourceContextTemplate;
import com.archibus.datasource.*;

public class LogDao {
    public LogDao() {
        // TODO Auto-generated constructor stub
    }
    
    public static void save(final Log log) {
        if (log != null) {
            final String sql = getSqlExpression(log);
            Logger.getLogger(LogDao.class).info(sql);
            final DataSource sysLogDS = DataSourceFactory.createDataSource().addTable("sys_log");
            prepareDataSourceContext(sysLogDS);
            sysLogDS.addQuery(sql);
            sysLogDS.executeUpdate();
        }
    }
    
    private static void prepareDataSourceContext(final DataSource ds) {
        if (ContextStore.get().getDbConnection() == null) {
            ContextStore.get().setDbConnection(
                ContextStore.get().getDatabase().getPool().getConnection());
        }
        
        if (ContextStore.get().getEventHandlerContext() == null) {
            DataSourceContextTemplate.prepareDataSourceContext(ds);
        }
        
    }
    
    public static String getSqlExpression(final Log log) {
        final StringBuffer sqlexp = new StringBuffer("insert into sys_log (");
        final StringBuffer valueexp = new StringBuffer(" values(");
        if (null != log.getOperator() && !"".equals(log.getOperator())) {
            sqlexp.append("operator,");
            valueexp.append("'" + log.getOperator() + "',");
        }
        if (null != log.getOperate() && !"".equals(log.getOperate())) {
            sqlexp.append("operate,");
            valueexp.append("'" + log.getOperate() + "',");
        }
        if (null != log.getRole() && !"".equals(log.getRole())) {
            sqlexp.append("role,");
            valueexp.append("'" + log.getRole() + "',");
        }
        if (null != log.getIpAddr() && !"".equals(log.getIpAddr())) {
            sqlexp.append("ip_addr,");
            valueexp.append("'" + log.getIpAddr() + "',");
        }
        // if (log.getOperDate() != null) {
        // SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        // String str = sdf.format(log.getOperDate());
        // sqlexp.append("oper_date,");
        // valueexp.append("'" + str + "',");
        // }
        if (null != log.getOldValues() && !"".equals(log.getOldValues())) {
            sqlexp.append("oldvalues,");
            valueexp.append("'" + log.getOldValues() + "',");
        }
        if (null != log.getNewValues() && !"".equals(log.getNewValues())) {
            sqlexp.append("newvalues,");
            valueexp.append("'" + log.getNewValues() + "',");
        }
        if (null != log.getDescription() && !"".equals(log.getDescription())) {
            sqlexp.append("description,");
            valueexp.append("'" + log.getDescription() + "',");
        }
        if (null != log.getTarget() && !"".equals(log.getTarget())) {
            sqlexp.append("target,");
            valueexp.append("'" + log.getTarget() + "',");
        }
        if (log.isFlag()) {
            sqlexp.append("flag,");
            valueexp.append("'" + log.isFlag() + "',");
        }
        if (!log.isFlag()) {
            sqlexp.append("flag,");
            valueexp.append("'" + log.isFlag() + "',");
        }
        if (null != log.getTargetTablePrimaryKey() && !"".equals(log.getTargetTablePrimaryKey())) {
            sqlexp.append("target_pk,");
            valueexp.append("'" + log.getTargetTablePrimaryKey() + "',");
        }
        final String str1 = sqlexp.substring(0, sqlexp.length() - 1).concat(")");
        final String str2 = valueexp.substring(0, valueexp.length() - 1).concat(")");
        final String sql = str1 + str2;
        return sql;
    }
    
    /**
     * 根据最大id 和 目标表的主键获得唯一一个纪录
     * 
     * @param log
     * @param targetTablePk
     */
    public void update(final Log log, final String targetTablePk) {
        final StringBuffer sb = new StringBuffer("update sys_log");
        sb.append(
            " set flag='true' where operator='" + log.getOperator() + "' and ip_addr='"
                    + log.getIpAddr() + "' and target='" + log.getTarget() + "' and target_pk='"
                    + targetTablePk).append("' and id=(select max(id) from sys_log)");
        SqlUtils.executeUpdate("sys_log", sb.toString());
        SqlUtils.commit();
        Logger.getLogger(this.getClass()).info(sb.toString());
    }
}