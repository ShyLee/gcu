package com.archibus.app.common.mobile.sync.dao;

import java.util.List;

import com.archibus.app.common.mobile.sync.service.Record;
import com.archibus.model.view.datasource.ParsedRestrictionDef;
import com.archibus.schema.TableDef;
import com.archibus.utility.ExceptionBase;

/**
 * DAO for sync operations. Operates on a sync table.
 * <p>
 * The retrieveRecords method operates on any table.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public interface ISyncDao {
    /**
     * Checks-in specified records into the specified sync table. Check-in means that this method
     * will try to insert or update each record (if the user is allowed to update the record) and
     * will lock the inserted records for the specified user.
     * <p>
     * If all values of the inventoryKeyNames fields in the record are populated and if the record
     * exists in the sync table update the record; otherwise insert the record.
     * 
     * @param inventoryKeyNames names of the inventory key fields in the sync table.
     * @param records to be checked-in.
     * @param tableDef of the sync table.
     * @param username of the current user.
     * 
     * @return list of records for which check-in failed.
     * @throws ExceptionBase if DataSource throws an exception.
     */
    List<Record> checkInRecords(final List<String> inventoryKeyNames, final List<Record> records,
            final TableDef.ThreadSafe tableDef, final String username) throws ExceptionBase;
    
    /**
     * Checks-out records from the specified sync table, locks the checked-out records for the
     * specified user. Applies the specified restriction and VPA restrictions for the current user
     * to select the records.
     * 
     * @param fieldNames the names of the fields in the sync table to be included in the list of
     *            checked-out records.
     * @param restrictionDef restriction to be applied to the sync table.
     * @param tableDef of the sync table.
     * @param username of the current user.
     * @return list of checked-out records. The list might be empty if user is not allowed to lock
     *         the record.
     * @throws ExceptionBase if the DataSource throws exception.
     */
    List<Record> checkOutRecords(final List<String> fieldNames,
            final ParsedRestrictionDef restrictionDef, final TableDef.ThreadSafe tableDef,
            final String username) throws ExceptionBase;
    
    /**
     * Retrieves records from the specified table. Applies the specified restriction and VPA
     * restrictions for the current user to select the records.
     * 
     * @param fieldNames the names of the fields in the table to be included in the the records.
     * @param restrictionDef restriction to be applied to the table.
     * @param tableDef of the table.
     * 
     * @return list of records.
     * @throws ExceptionBase if the DataSource throws exception.
     */
    List<Record> retrieveRecords(List<String> fieldNames, ParsedRestrictionDef restrictionDef,
            TableDef.ThreadSafe tableDef) throws ExceptionBase;
}