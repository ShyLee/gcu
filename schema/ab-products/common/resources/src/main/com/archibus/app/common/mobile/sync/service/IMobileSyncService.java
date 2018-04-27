package com.archibus.app.common.mobile.sync.service;

import java.util.List;

import com.archibus.model.schema.TableDef;
import com.archibus.model.view.datasource.ParsedRestrictionDef;
import com.archibus.utility.ExceptionBase;

/**
 * API of the sync service for mobile applications.
 * <p>
 * Only authenticated users are allowed to invoke methods in this service.
 * 
 * @author Valery Tydykov
 * 
 * @since 21.1
 */
public interface IMobileSyncService {
    /**
     * Returns list of AppInfo DTOs - properties of mobile applications enabled for the current
     * user. AppInfo is localized according to the locale of the user session.
     * 
     * @return list of AppInfo DTOs - properties of mobile applications enabled for the current
     *         user.
     * @throws ExceptionBase if DataSource throws an exception.
     */
    List<AppConfig> getEnabledApplications() throws ExceptionBase;
    
    /**
     * Returns the table definition DTO for specified table. Contains localized strings and enums
     * according to the locale of the current user session.
     * 
     * @param tableName name of the table to return the definition for.
     * @return TableDef DTO for the specified tableName.
     * @throws ExceptionBase if DataSource throws an exception.
     */
    TableDef getTableDef(String tableName) throws ExceptionBase;
    
    /**
     * Checks-in specified records into the specified sync table. Check-in means that this method
     * will try to insert or update each record (if the user is allowed to update the record) and
     * will lock the inserted records for the current user.
     * <p>
     * If all values of the inventoryKeyNames fields in the record are populated and if the record
     * exists in the sync table update the record; otherwise insert the record.
     * 
     * 
     * @param tableName the name of the sync table to check the records in.
     * @param inventoryKeyNames names of the inventory key fields in the sync table. Names of the
     *            primary key fields of the inventory table (e.g. "wr" table) associated with the
     *            sync table (e.g. "wr_sync" table). Used to create restriction for each record to
     *            be checked-in; the restriction is used to check if the record already exists in
     *            the sync table.
     * @param records to be checked-in.
     * @throws ExceptionBase if DataSource throws an exception.
     */
    void checkInRecords(final String tableName, final List<String> inventoryKeyNames,
            final List<Record> records) throws ExceptionBase;
    
    /**
     * Checks-out records from the specified sync table, locks the checked-out records for the
     * current user. Applies the specified restriction and VPA restrictions for the current user to
     * select the records.
     * 
     * @param tableName the name of the sync table to check the records out.
     * @param fieldNames the names of the fields in the sync table to be included in the checked-out
     *            the records.
     * @param restrictionDef restriction to be applied to the sync table.
     * @return list of checked-out records. The list might be empty if user is not allowed to lock
     *         the record.
     * @throws ExceptionBase if the DataSource throws exception.
     */
    List<Record> checkOutRecords(final String tableName, final List<String> fieldNames,
            final ParsedRestrictionDef restrictionDef) throws ExceptionBase;
    
    /**
     * Retrieves records from the specified table. Applies the specified restriction and VPA
     * restrictions for the current user to select the records.
     * 
     * @param tableName the name of the table to retrieve records from.
     * @param fieldNames the names of the fields in the table to be included in the the records.
     * @param restrictionDef restriction to be applied to the table.
     * @return list of records.
     * @throws ExceptionBase if the DataSource throws exception.
     */
    List<Record> retrieveRecords(final String tableName, final List<String> fieldNames,
            final ParsedRestrictionDef restrictionDef) throws ExceptionBase;
}
