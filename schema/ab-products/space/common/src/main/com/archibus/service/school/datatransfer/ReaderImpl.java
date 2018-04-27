package com.archibus.service.school.datatransfer;

import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.utility.ExceptionBase;

public class ReaderImpl extends EventHandlerBase implements IReader {
    
    /**
     * Logger for this class and subclasses
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    public void readerFromZjk(final TransferObject source, final TransferObject target) {
        // TODO Auto-generated method stub
        
    }
    
    List<DataRecord> ReadZjk(final TransferObject source, final String sql, final String flds[]) {
        final String sourceTableName = source.getTableName();
        try {
            final List<DataRecord> records = SqlUtils.executeQuery(sourceTableName, flds, sql);
            if (records.isEmpty()) {
                throw new ExceptionBase(String.format("中间表中没有数据"));
            } else {
                return records;
            }
        } catch (final Exception e) {
            throw new ExceptionBase(String.format("从中间库中读取数据失败！" + e.toString()));
        }
    }
    
    // Boolean existtable(final TransferObject target, final String sql, final String flds[]) {
    //
    // }
    
}
