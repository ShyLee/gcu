package com.archibus.app.common.mobile.sync.dao.datasource;

import java.util.*;

import junit.framework.Assert;

import com.archibus.app.common.mobile.sync.dao.datasource.DocumentFieldsDataSource.FieldNames;
import com.archibus.app.common.mobile.sync.service.FieldNameValue;
import com.archibus.app.common.mobile.sync.service.Record;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.*;
import com.archibus.schema.*;
import com.archibus.utility.*;

/**
 * Utilities for SyncDataSource.
 * <p>
 * Provides access to "mob_is_changed" and "mob_locked_by" fields in DataRecord.
 * 
 * @author Valery Tydykov
 * @since 21.1
 */
public final class SyncDataSourceUtilities {
    /**
     * Constant: ".".
     */
    public static final String DOT = ".";
    
    /**
     * Constant: Name of the field "Changed by Mobile User".
     */
    public static final String CHANGED_BY_MOBILE_USER = "mob_is_changed";
    
    /**
     * Constant: Name of the field "Locked by Mobile User".
     */
    public static final String LOCKED_BY_MOBILE_USER = "mob_locked_by";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private SyncDataSourceUtilities() {
    }
    
    /**
     * Creates DataSource, which will include specified fieldNames.
     * 
     * @param fieldNames to be included in the DataSource.
     * @param tableDef of the sync table.
     * @param isSyncTable true if the table the DataSource is created for is a sync table.
     * @return created DataSource.
     * @throws ExceptionBase if creation fails.
     */
    static DataSource createDataSource(final List<String> fieldNames,
            final TableDef.ThreadSafe tableDef, final boolean isSyncTable) throws ExceptionBase {
        final List<String> fieldNamesForDataSource =
                prepareFieldNamesForDataSource(fieldNames, tableDef, isSyncTable);
        
        final String tableName = tableDef.getName();
        // Create DataSource for the tableName
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(tableName,
                    fieldNamesForDataSource.toArray(new String[fieldNamesForDataSource.size()]));
        dataSource.setContext();
        
        return dataSource;
    }
    
    /**
     * Extracts field names from the first record in the list. Separates field names into two lists:
     * document and non-document fields. Excludes fields with names that have "_contents" postfix.
     * 
     * @param records the list to extract the field names from.
     * @param tableDef of the sync table.
     * @return field names separated into two lists.
     */
    static FieldNames extractFieldNamesFromFirstRecord(final List<Record> records,
            final TableDef.ThreadSafe tableDef) {
        
        Assert.assertTrue(!records.isEmpty());
        final Record firstRecord = records.get(0);
        
        final List<String> fieldNames = new ArrayList<String>();
        for (final FieldNameValue nameValue : firstRecord.getFieldValues()) {
            fieldNames.add(nameValue.getFieldName());
        }
        
        return DocumentFieldsDataSourceUtilities.separateFieldNames(fieldNames, tableDef);
    }
    
    /**
     * Returns true if user is allowed to lock the record for check-in.
     * 
     * @param tableName name of the table from which the record is coming.
     * @param username of the user.
     * @param record to be locked.
     * @return true if user is allowed to lock the record for check-in.
     */
    static boolean isUserAllowedLockRecordForCheckin(final String tableName, final String username,
            final DataRecord record) {
        // check if the Locked by Mobile User field matches the username.
        return username.equals(record.getValue(tableName + DOT + LOCKED_BY_MOBILE_USER));
    }
    
    /**
     * Returns true if user is allowed to lock the record for check-out.
     * 
     * @param tableName name of the table from which the record is coming.
     * @param username of the user.
     * @param record to be locked.
     * @return true if user is allowed to lock the record for check-out.
     */
    static boolean isUserAllowedLockRecordForCheckout(final String tableName,
            final String username, final DataRecord record) {
        boolean isUserAllowedLockRecordForCheckout = false;
        if (isUserAllowedLockRecordForCheckin(tableName, username, record)) {
            // Locked by Mobile User field matches the username
            isUserAllowedLockRecordForCheckout = true;
        } else if (StringUtil.isNullOrEmpty(record
            .getValue(tableName + DOT + LOCKED_BY_MOBILE_USER))) {
            // Locked by Mobile User field is blank
            isUserAllowedLockRecordForCheckout = true;
        }
        
        return isUserAllowedLockRecordForCheckout;
    }
    
    /**
     * Loads record from the specified DataSource. Uses restriction created from inventoryKeyNames
     * in the supplied record.
     * 
     * @param dataSource to be used to load record.
     * @param tableName name of the table from which the record is loaded.
     * @param inventoryKeyNames to create restriction. Names of the primary key fields of the
     *            inventory table (e.g. "wr" table) associated with the sync table (e.g. "wr_sync"
     *            table).
     * @param record with inventoryKeyNames from which the restriction will be created.
     * @return loaded record, or null, if no record for the restriction exists.
     * @throws ExceptionBase if loading record fails.
     */
    static DataRecord loadRecord(final DataSource dataSource, final String tableName,
            final List<String> inventoryKeyNames, final DataRecord record) throws ExceptionBase {
        final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
        
        // add restriction by inventoryKeyNames
        boolean inventoryKeyValuesSupplied = true;
        for (final String keyName : inventoryKeyNames) {
            final Object value = record.getValue(tableName + SyncDataSourceUtilities.DOT + keyName);
            if (value == null) {
                inventoryKeyValuesSupplied = false;
                break;
            } else {
                restrictionDef.addClause(tableName, keyName, value, ClauseDef.Operation.EQUALS);
            }
        }
        
        DataRecord recordToReturn = null;
        if (inventoryKeyValuesSupplied) {
            final List<DataRecord> records = dataSource.getRecords(restrictionDef);
            if (records.size() == 1) {
                recordToReturn = records.get(0);
            }
        }
        
        return recordToReturn;
    }
    
    /**
     * Locks and saves record, using supplied dataSource. Locks the record for the supplied
     * username.
     * 
     * @param dataSource to save the record.
     * @param username to lock the record for.
     * @param record to be locked and saved. Might be an existing or new record.
     * @param tableName name of the table the record is coming from.
     * @return DataRecord containing saved field values, or null if the table PK is not
     *         autonumbered.
     */
    static DataRecord lockAndSaveRecord(final DataSource dataSource, final String username,
            final DataRecord record, final String tableName) {
        SyncDataSourceUtilities.lockRecord(record, username, tableName);
        SyncDataSourceUtilities.setChangedByMobileUser(record, tableName);
        
        return dataSource.saveRecord(record);
    }
    
    /**
     * Locks the record for the username.
     * 
     * @param record to be locked.
     * @param username to lock the record for.
     * @param tableName name of the table the record is coming from.
     */
    static void lockRecord(final DataRecord record, final String username, final String tableName) {
        record.setValue(tableName + DOT + LOCKED_BY_MOBILE_USER, username);
    }
    
    /**
     * Prepares field names for DataSource: the result contains both document and non-document
     * fields.
     * 
     * @param fieldNames source of the field names.
     * @return both document and non-document field names.
     */
    static List<String> prepareFieldNamesForDataSource(final FieldNames fieldNames) {
        final List<String> nonDocumentAndDocumentFieldNames = new ArrayList<String>();
        nonDocumentAndDocumentFieldNames.addAll(fieldNames.getDocumentFieldNames());
        nonDocumentAndDocumentFieldNames.addAll(fieldNames.getNonDocumentFieldNames());
        
        return nonDocumentAndDocumentFieldNames;
    }
    
    /**
     * Prepares field names for DataSource.
     * <p>
     * - Adds fieldNames;
     * <p>
     * - Adds required for sync table fields;
     * <p>
     * - Adds primary key fields;
     * 
     * @param fieldNames to be added.
     * @param tableDef to get primary keys names from.
     * @param isSyncTable true if the table the DataSource is created for is a sync table.
     * @return field names.
     */
    static List<String> prepareFieldNamesForDataSource(final List<String> fieldNames,
            final com.archibus.schema.TableDef.ThreadSafe tableDef, final boolean isSyncTable) {
        // add fields passed by the caller
        final List<String> fieldNamesForDatasource = new ArrayList<String>(fieldNames);
        
        if (isSyncTable) {
            // add required for sync table fields
            fieldNamesForDatasource.add(SyncDataSourceUtilities.CHANGED_BY_MOBILE_USER);
            fieldNamesForDatasource.add(SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER);
        }
        
        // add PK fields
        {
            for (final ArchibusFieldDefBase.Immutable fieldDef : tableDef.getPrimaryKey()
                .getFields()) {
                // no duplicates
                if (!fieldNamesForDatasource.contains(fieldDef.getName())) {
                    fieldNamesForDatasource.add(fieldDef.getName());
                }
            }
        }
        
        return fieldNamesForDatasource;
    }
    
    /**
     * Selects record with primary key values from the recordSaved and recordToSave.
     * 
     * @param recordToSave record to be saved if the table is not autonumbered.
     * @param recordSaved record saved by the DataSource if the table is autonumbered, or null.
     * @return selected record with primary key values.
     */
    static DataRecord selectRecordWithPrimaryKeyValues(final DataRecord recordToSave,
            final DataRecord recordSaved) {
        DataRecord recordWithPrimaryKeyValues;
        if (recordSaved == null) {
            // not autonumbered table
            recordWithPrimaryKeyValues = recordToSave;
        } else {
            // autonumbered table
            recordWithPrimaryKeyValues = recordSaved;
        }
        
        Assert.assertNotNull("recordWithPrimaryKeyValues must not be null",
            recordWithPrimaryKeyValues);
        
        return recordWithPrimaryKeyValues;
    }
    
    /**
     * Sets value of field ChangedByMobileUser to true.
     * 
     * @param record with the field value to be set.
     * @param tableName name of the table the record is coming from.
     */
    static void setChangedByMobileUser(final DataRecord record, final String tableName) {
        record.setValue(tableName + DOT + CHANGED_BY_MOBILE_USER, 1);
    }
}
