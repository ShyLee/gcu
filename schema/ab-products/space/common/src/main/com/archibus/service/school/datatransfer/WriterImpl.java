package com.archibus.service.school.datatransfer;

import org.apache.log4j.Logger;

import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.utility.StringUtil;

public class WriterImpl extends EventHandlerBase implements IWriter {
    
    /**
     * Logger for this class and subclasses
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    public void writerToZjk(final TransferObject source, final TransferObject target) {
        // TODO Auto-generated method stub
        // @non-translatable
        final String operation = "Update ZJK Table: %s";
        final String targetTableTitle = target.getTableTitle();
        
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(operation, targetTableTitle);
            this.logger.info(message);
        }
        
        // 1 delete target table records
        this.deleteAllTargetRecords(target);
        // 2 insert records from source to target
        this.insertRecordsFromSourceToTarget(source, target);
    }
    
    private void deleteAllTargetRecords(final TransferObject target) {
        final String operation = "Delete from %s";
        final String targetTableName = target.getTableName();
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(operation, targetTableName);
            this.logger.info(message);
        }
        final String sql = String.format(operation, targetTableName);
        // String tablename=targetTableName.toString();
        SqlUtils.executeUpdate(targetTableName, sql);
        SqlUtils.commit();
    }
    
    private void insertRecordsFromSourceToTarget(final TransferObject source,
            final TransferObject target) {
        
        final String operation = "Insert All Records From: %s To %s";
        final String sourceTableName = source.getTableName();
        final String targetTableName = target.getTableName();
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(operation, sourceTableName, targetTableName);
            this.logger.info(message);
        }
        // TODO
        final StringBuffer sql = new StringBuffer();
        sql.append("Insert Into ");
        sql.append(target.getTableName());
        sql.append(" ( ");
        sql.append(this.getFieldsString(target));
        sql.append(" ) ");
        sql.append(" SELECT ");
        sql.append(this.getFieldsString(source));
        sql.append(" FROM ");
        sql.append(source.getTableName());
        if (StringUtil.notNullOrEmpty(source.getWhereSql())) {
            sql.append(" WHERE ");
            sql.append(source.getWhereSql());
        }
        
        SqlUtils.executeUpdate(targetTableName, sql.toString());
        SqlUtils.commit();
        
    }
    
    private String getFieldsString(final TransferObject to) {
        /*
         * final StringBuffer fldsStr = new StringBuffer();
         * 
         * final ArrayList<String> fieldsList = to.getFieldsList(); for (final String fldName :
         * fieldsList) { fldsStr.append(fldName); fldsStr.append(','); }
         * 
         * if (fldsStr.length() > 0 && fldsStr.charAt(fldsStr.length() - 1) == ',') {
         * fldsStr.deleteCharAt(fldsStr.length() - 1); } return fldsStr.toString();
         */
        return to.getFieldsString();
    }
}
