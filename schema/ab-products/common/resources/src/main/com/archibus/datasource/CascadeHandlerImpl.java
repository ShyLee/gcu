package com.archibus.datasource;

import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.app.common.util.*;
import com.archibus.config.Project;
import com.archibus.context.*;
import com.archibus.core.event.data.*;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.jobmanager.JobBase;
import com.archibus.schema.*;
import com.archibus.utility.*;

/**
 * Implements cascading update/delete.
 */
public class CascadeHandlerImpl extends JobBase implements CascadeHandler {
    
    /**
     * Called to update primary key values.
     * 
     * @param updatedRecord Contains old and new values of primary key fields. Does not contain
     *            values of non-PK fields.
     * @throws ExceptionBase
     */
    
    public static final String DELETE_OPERATION = "DELETE";
    
    public static final String INSERT_OPERATION = "INSERT";
    
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    private List<String> cascadingDepColsFieldsForSetNull;
    
    private List<String> cascadingFieldsToSetNull;
    
    public CascadeHandlerImpl() {
    }
    
    public void cascadeDelete(final DataRecord deletedRecord) throws ExceptionBase {
        // if is Oracle or MsSql then continue. Sybase will cascade by itself
        if (!SqlUtils.isSybase() && !deletedRecord.getFields().isEmpty()) {
            // get the table name of the updatedRecord
            final String pTableName =
                    Utility.tableNameFromFullName(deletedRecord.getFields().get(0).getFieldDef()
                        .fullName());
            // check user's edit permission on specified parent table - if no permission, throw
            // exception.
            SqlUtils.checkEditPermission(pTableName);
            
            final List<String> childTableNames = getCascadingTables(pTableName, true);
            
            final List<String> pkFields = getPrimaryKeyFields(deletedRecord);
            
            // trigger "DELETE" DataEvent for the deletedRecord of the root table before actual
            // changes
            triggerDataEvent(deletedRecord, pTableName, BeforeOrAfter.BEFORE, ChangeType.DELETE);
            
            // suspend triggering events for all DataEvent listeners
            final SuspendDataEventsTemplate suspendDataEventsTemplate =
                    new SuspendDataEventsTemplate(IDataEventListener.class);
            suspendDataEventsTemplate.doWithContext(new Callback() {
                
                public Object doWithContext(final Context context) throws ExceptionBase {
                    if (!childTableNames.isEmpty()) {
                        // prepare childTableNamesPK
                        List<String> childTableNamesPK = new ArrayList<String>();
                        childTableNamesPK.addAll(getCascadingTables(pTableName, false));
                        childTableNamesPK = orderTableList(childTableNamesPK, DELETE_OPERATION);
                        childTableNamesPK.add(pTableName);
                        
                        // perform updates
                        deleteOrSetNull(childTableNamesPK, deletedRecord, pkFields);
                    } else {
                        // prepare childTableNamesPK
                        final List<String> childTableNamesPK = new ArrayList<String>();
                        childTableNamesPK.add(pTableName);
                        
                        // perform updates
                        deleteRecords(childTableNamesPK, deletedRecord, pkFields);
                    }
                    
                    return null;
                }
            });
            
            // resume triggering events for all DataEvent listeners
        }
    }
    
    /**
     * Called to delete a record specified by primary keys.
     * 
     * @param deletedRecord: contains values of of primary key fields. Does not contain values of
     *            non-PK fields.
     * @throws ExceptionBase
     */
    public void cascadeUpdate(final DataRecord updatedRecord) throws ExceptionBase {
        // if is Oracle or MsSql then continue. Sybase will cascade by itself
        if (!SqlUtils.isSybase() && !updatedRecord.getFields().isEmpty()) {
            // check if any of the field values changed
            if (!hasRecordChanged(updatedRecord)) {
                // record did not change, do not cascade
                return;
            }
            
            // get the table name of the updatedRecord
            final String pTableName =
                    Utility.tableNameFromFullName(updatedRecord.getFields().get(0).getFieldDef()
                        .fullName());
            // check user's edit permission on specified parent table - if no permission, throw
            // exception.
            SqlUtils.checkEditPermission(pTableName);
            
            final List<String> pkFields = getPrimaryKeyFields(updatedRecord);
            
            // suspend triggering events for all DataEvent listeners
            final SuspendDataEventsTemplate suspendDataEventsTemplate =
                    new SuspendDataEventsTemplate(IDataEventListener.class);
            suspendDataEventsTemplate.doWithContext(new Callback() {
                
                public Object doWithContext(final Context context) throws ExceptionBase {
                    // if any of PK is changed call cascade
                    if (isPrimaryKeyChanged(updatedRecord, pTableName, pkFields)) {
                        
                        List<String> childTableNames = getCascadingTables(pTableName, true);
                        // verify if parent table has childs
                        if (!childTableNames.isEmpty()) {
                            // prepare childTableNamesPK
                            final List<String> childTableNamesPK =
                                    getCascadingTables(pTableName, false);
                            // order for update
                            childTableNames = orderTableList(childTableNames, INSERT_OPERATION);
                            
                            // perform updates
                            // insert the new record into cascading tables
                            insertNewRecord(childTableNamesPK, pkFields, updatedRecord, false);
                            // update childTables != cascadeTables
                            updateRecord(childTableNames, childTableNamesPK, updatedRecord);
                            // delete old records from cascadeTables including parent table
                            deleteOldRecord(childTableNamesPK, updatedRecord, pkFields);
                        } else {
                            // prepare childTableNamesPK
                            // no child tables
                            final List<String> childTableNamesPK = new ArrayList<String>();
                            
                            // perform updates
                            // insert the new record into the parent table
                            insertNewRecord(childTableNamesPK, pkFields, updatedRecord, false);
                            // delete old records from the parent table
                            deleteOldRecord(childTableNamesPK, updatedRecord, pkFields);
                        }
                    }
                    
                    return null;
                }
            });
            
            // resume triggering events for all DataEvent listeners
            
            // trigger "UPDATE" DataEvent for the updatedRecord of the root table after actual
            // changes
            triggerDataEvent(updatedRecord, pTableName, BeforeOrAfter.AFTER, ChangeType.UPDATE);
        }
    }
    
    public void mergePrimaryKeys(final DataRecord fromRecord, final DataRecord toRecord)
            throws ExceptionBase {
        
        // get the table name of the updatedRecord
        final String pTableName =
                Utility.tableNameFromFullName(fromRecord.getFields().get(0).getFieldDef()
                    .fullName());
        
        final List<String> pkFields = getPrimaryKeyFields(fromRecord);
        
        // create dataSource
        final DataSource ds = DataSourceFactory.createDataSource();
        ds.addTable(pTableName);
        for (final String pkField : pkFields) {
            ds.addField(pkField);
        }
        final DataRecord mergeRecord = ds.createNewRecord();
        
        for (final String pkField : pkFields) {
            
            // set full name
            final String pkFieldName = pTableName + "." + pkField;
            
            final DataValue fromValue = fromRecord.findField(pkFieldName);
            final DataValue toValue = toRecord.findField(pkFieldName);
            
            final Object oldValue = fromValue.getValue();
            final Object newValue = toValue.getValue();
            
            mergeRecord.setOldValue(pkFieldName, oldValue);
            mergeRecord.setDbValue(pkFieldName, newValue.toString());
        }
        
        if (isPrimaryKeyChanged(mergeRecord, pTableName, pkFields)) {
            
            List<String> childTableNames = getCascadingTables(pTableName, true);
            
            // verify if parent table has childs
            if (!childTableNames.isEmpty()) {
                
                final List<String> childTableNamesPK = getCascadingTables(pTableName, false);
                
                if (!childTableNamesPK.isEmpty()) {
                    // get tables that has newRecord has not been inserted yet
                    final List<String> childTableNamesPKNoData =
                            checkPrimaryKey(childTableNamesPK, pkFields, mergeRecord);
                    // insert the new record into cascading tables
                    insertNewRecord(childTableNamesPKNoData, pkFields, mergeRecord, true);
                }
                // order for update
                childTableNames = orderTableList(childTableNames, INSERT_OPERATION);
                
                // update childTables != cascadeTables
                updateRecord(childTableNames, childTableNamesPK, mergeRecord);
                
                // delete old records from cascadeTables including parent table
                deleteOldRecord(childTableNamesPK, mergeRecord, pkFields);
                
            }
        } // if isPK
    }
    
    private List<String> checkPrimaryKey(final List<String> tableNames,
            final List<String> pkFields, final DataRecord fromRecord) {
        
        final String pTableName =
                Utility.tableNameFromFullName(fromRecord.getFields().get(0).getFieldDef()
                    .fullName());
        
        final String maxPKFieldName = getMaxPrimaryKey(pTableName);
        final String fullPKName = pTableName + "." + maxPKFieldName;
        final DataValue pkValue = fromRecord.findField(fullPKName);
        final String restrictStr = maxPKFieldName + "=" + pkValue.getDbValue();
        
        final List<String> pkTableNames = new ArrayList<String>();
        
        for (final String tableName : tableNames) {
            
            final Restriction restriction = Restrictions.sql(restrictStr);
            final int dataCount =
                    DataStatistics.getInt(tableName, maxPKFieldName, "COUNT", restriction);
            
            if (dataCount == 0) {
                pkTableNames.add(tableName);
            }
        }
        return pkTableNames;
    }
    
    /**
     * Called to delete records. Will execute: DELETE FROM tableName WHERE PKFieldName=@oldValue
     * 
     * @param tableNameList: represent a list of table to delete from
     * @param deletedRecord: record to be deleted from parent table
     * @param setDelete: identify if the delete is for delete cascade operation
     */
    private void deleteOldRecord(List<String> tableNameList, final DataRecord updatedRecord,
            final List<String> pkFields) {
        
        // get the parent table
        final String pTableName =
                Utility.tableNameFromFullName(updatedRecord.getFields().get(0).getFieldDef()
                    .fullName());
        
        // order the list of tables depending on dependencies between them
        tableNameList = orderTableList(tableNameList, DELETE_OPERATION);
        
        // add the parent table to the end
        tableNameList.add(pTableName);
        
        // create the DELETE FROM statements
        for (final String tableName : tableNameList) {
            
            final TableDef.ThreadSafe cascadeTableDef =
                    ContextStore.get().getProject().loadTableDef(tableName);
            
            if (!tableName.equals(pTableName)) {
                
                for (final ForeignKey.Immutable foreignKey : cascadeTableDef.getForeignKeys()) {
                    
                    if (pTableName.equals(foreignKey.getReferenceTable())) {
                        
                        String restriction = "";
                        String sqlStatement = "";
                        for (int i = 0; i < foreignKey.getForeignFields().size(); i++) {
                            
                            final String fkName = foreignKey.getForeignFields().get(i).toString();
                            
                            final String foreignFieldName =
                                    pTableName + "." + foreignKey.getPrimaryColumns().get(i);
                            final DataValue foreignField =
                                    updatedRecord.findField(foreignFieldName);
                            
                            restriction += fkName + " = " + foreignField.getOldDbValue();
                            
                            if (i < foreignKey.getForeignFields().size() - 1) {
                                restriction += " AND ";
                            }
                        }
                        // delete from child tables
                        sqlStatement = "DELETE FROM " + tableName + " WHERE " + restriction;
                        SqlUtils.executeUpdate(tableName, sqlStatement);
                        
                        sqlStatement = "";
                        restriction = "";
                    }
                } // end for
                
            } else {
                
                String restriction = "";
                String sqlStatement = "";
                // restriction for parent table
                for (final Iterator<String> it = pkFields.iterator(); it.hasNext();) {
                    
                    final String foreignFieldName = pTableName + "." + it.next();
                    final DataValue foreignField = updatedRecord.findField(foreignFieldName);
                    
                    restriction += foreignFieldName + " = " + foreignField.getOldDbValue();
                    
                    if (it.hasNext()) {
                        restriction += " AND ";
                    }
                } // end for
                  // delete from parent table
                sqlStatement = "DELETE FROM " + pTableName + " WHERE " + restriction;
                SqlUtils.executeUpdate(pTableName, sqlStatement);
            }// end else
        } // end for
    }
    
    /**
     * Called to establish if delete or setNull records.
     * 
     * @param cascadeTables: represent a list of table involved in DELETE operation.
     * @param deletedRecord: record to be deleted from parent table
     */
    
    private void deleteOrSetNull(final List<String> cascadeTables, final DataRecord deletedRecord,
            final List<String> pkFields) {
        
        final List<String> tablesAlreadyDeletedFrom = new ArrayList<String>();
        
        for (final String cascadeTable : cascadeTables) {
            
            final List<String> childTablesToSetNull =
                    getTablesToDeleteOrSetNull(cascadeTable, null, true);
            final List<String> childTablesToDeleteFrom =
                    getTablesToDeleteOrSetNull(cascadeTable, tablesAlreadyDeletedFrom, false);
            
            if (!childTablesToSetNull.isEmpty()) {
                setNull(childTablesToSetNull, deletedRecord, pkFields);
            }
            
            // childTablesToDeleteFrom = orderTableList(childTablesToDeleteFrom, DELETE_OPERATION);
            // add the parent table to the end in order to be deleted last
            childTablesToDeleteFrom.add(cascadeTable);
            
            deleteRecords(childTablesToDeleteFrom, deletedRecord, pkFields);
            
            // store the tables deleted from
            for (final String tableName : childTablesToDeleteFrom) {
                tablesAlreadyDeletedFrom.add(tableName);
            }
        }
    }
    
    private void deleteRecords(final List<String> childTableNameList,
            final DataRecord deletedRecord, final List<String> pkFields) {
        
        String restriction = "";
        String sqlStatement = "";
        
        // get the parent table
        final String pTableName =
                Utility.tableNameFromFullName(deletedRecord.getFields().get(0).getFieldDef()
                    .fullName());
        
        // create the DELETE FROM statements
        for (final String tableName : childTableNameList) {
            
            final TableDef.ThreadSafe cascadeTableDef =
                    ContextStore.get().getProject().loadTableDef(tableName);
            
            if (!tableName.equals(pTableName)) {
                
                for (final ForeignKey.Immutable foreignKey : cascadeTableDef.getForeignKeys()) {
                    
                    if (pTableName.equals(foreignKey.getReferenceTable())) {
                        
                        for (int i = 0; i < foreignKey.getForeignFields().size(); i++) {
                            
                            final String fkName = foreignKey.getForeignFields().get(i).toString();
                            
                            final String foreignFieldName =
                                    pTableName + "." + foreignKey.getPrimaryColumns().get(i);
                            final DataValue foreignField =
                                    deletedRecord.findField(foreignFieldName);
                            
                            restriction += fkName + " = " + foreignField.getDbValue();
                            
                            if (i < foreignKey.getForeignFields().size() - 1) {
                                restriction += " AND ";
                            }
                        }
                        // delete from child tables
                        sqlStatement = "DELETE FROM " + tableName + " WHERE " + restriction;
                        SqlUtils.executeUpdate(tableName, sqlStatement);
                        
                        sqlStatement = "";
                        restriction = "";
                    }
                } // end for
            } else {
                
                for (final Iterator<String> it = pkFields.iterator(); it.hasNext();) {
                    
                    final String foreignFieldName = pTableName + "." + it.next();
                    final DataValue foreignField = deletedRecord.findField(foreignFieldName);
                    
                    restriction += foreignFieldName + " = " + foreignField.getDbValue();
                    
                    if (it.hasNext()) {
                        restriction += " AND ";
                    }
                } // end for
                  // delete from parent table
                sqlStatement = "DELETE FROM " + tableName + " WHERE " + restriction;
                SqlUtils.executeUpdate(tableName, sqlStatement);
            }
        }
    }
    
    /**
     * If allChilds is true return all names of child tables else get child tables that have a PK as
     * FK and refers parent table
     * 
     * @param pTableName: represent name of the parent table
     * @param allChilds
     * @returns List<String> childNameList
     */
    private List<String> getCascadingTables(final String pTableName, final boolean allChilds) {
        
        String sql =
                "SELECT DISTINCT afm_flds.table_name from afm_flds WHERE validate_data = 1 AND afm_flds.ref_table = '"
                        + pTableName;
        final String allChildsRestriction =
                "' AND table_name IN (SELECT table_name FROM afm_tbls WHERE is_sql_view = 0)";
        final String pkChildsRestriction =
                "' AND primary_key > 0 AND EXISTS (SELECT 1 FROM afm_flds flds2 WHERE flds2.ref_table=afm_flds.table_name) ";
        String dialect = "";
        
        if (allChilds) {
            sql += allChildsRestriction;
        } else {
            sql += pkChildsRestriction;
        }
        
        final DataSource dsGetChildTables = DataSourceFactory.createDataSource();
        
        if (SqlUtils.isOracle()) {
            dialect = SqlExpressions.DIALECT_ORACLE;
        } else if (SqlUtils.isSqlServer()) {
            dialect = SqlExpressions.DIALECT_SQLSERVER;
        } else if (SqlUtils.isSybase()) {
            dialect = SqlExpressions.DIALECT_SYBASE;
        }
        dsGetChildTables.addTable("afm_flds").addQuery(sql, dialect);
        
        final List<DataRecord> records = dsGetChildTables.getRecords();
        
        final List<String> childNameList = new ArrayList<String>();
        
        for (final DataRecord record : records) {
            childNameList.add(record.getString("afm_flds.table_name"));
        }
        return childNameList;
    }
    
    /**
     * 
     * @param deletedRecord
     * @param tableNameToSetNull
     * @param pkFields
     * @return
     */
    private String getDependentColumnByName(final List<String> depCols, final String pkField) {
        String fieldName = pkField;
        if (!depCols.contains(pkField)) {
            fieldName = "";
        }
        return fieldName;
    }
    
    private int getIndexOf(final ListWrapper.Immutable<String> fkFieldsList, final String fieldName) {
        int index = 0;
        for (final String fkField : fkFieldsList) {
            if (fkField.equals(fieldName)) {
                return index;
            }
            index++;
        }
        return index;
    }
    
    private String getMaxPrimaryKey(final String tableName) {
        
        final String sql =
                "SELECT field_name FROM afm_flds WHERE table_name = '"
                        + tableName
                        + "' AND primary_key = (SELECT MAX(primary_key) FROM afm_flds WHERE table_name = '"
                        + tableName + "')";
        
        String dialect = "";
        
        if (SqlUtils.isOracle()) {
            dialect = SqlExpressions.DIALECT_ORACLE;
        } else if (SqlUtils.isSqlServer()) {
            dialect = SqlExpressions.DIALECT_SQLSERVER;
        } else if (SqlUtils.isSybase()) {
            dialect = SqlExpressions.DIALECT_SYBASE;
        }
        
        final DataSource dsGetMAXpk = DataSourceFactory.createDataSource();
        dsGetMAXpk.addTable("afm_flds").addQuery(sql, dialect);
        final DataRecord rec = dsGetMAXpk.getRecord();
        final String recValue = rec.getString("afm_flds.field_name");
        
        return recValue;
    }
    
    /**
     * Called to get the list of primary key fields of the table from which the record is deleted.
     */
    private List<String> getPrimaryKeyFields(final DataRecord record) {
        
        // get project
        final Project.Immutable project = ContextStore.get().getProject();
        
        final String tableName =
                Utility.tableNameFromFullName(record.getFields().get(0).getFieldDef().fullName());
        final List<String> pkNames = new ArrayList<String>();
        for (final ArchibusFieldDefBase.Immutable fieldDef : project.loadTableDef(tableName)
            .getPrimaryKey().getFields()) {
            pkNames.add(fieldDef.getName());
        }
        return pkNames;
    }
    
    /**
     * Called to get information about child tables in delete cascade
     * 
     * @param tableName: represent name of the table
     * @param setNull: when true then the method will return tables having PK fields that allow NULL
     *            and not PK when false then the method will get PK fields that does NOT allow NULL
     *            OR is PK
     * @returns: List<String> childNameList
     */
    
    private List<String> getTablesToDeleteOrSetNull(final String cascadeTableName,
            final List<String> excludedTables, final boolean setNull) {
        
        final List<String> childNameList = new ArrayList<String>();
        String sql = "";
        
        if (setNull) {
            
            final String[] tables = { "afm_flds", };
            final String[] fieldsSetNull = { "table_name", "field_name", "dep_cols" };
            String dialect = "";
            
            sql =
                    "SELECT afm_flds.table_name, afm_flds.field_name, (CASE WHEN afm_flds.dep_cols IS NULL THEN 'N' ELSE afm_flds.dep_cols END) AS dep_cols FROM afm_flds WHERE afm_flds.ref_table = '"
                            + cascadeTableName
                            + "' AND validate_data=1 AND afm_flds.table_name IN (SELECT table_name FROM afm_tbls WHERE is_sql_view = 0) ";
            sql +=
                    " AND afm_flds.primary_key = 0 AND afm_flds.allow_null = 1 AND afm_flds.validate_data = 1";
            
            if (SqlUtils.isOracle()) {
                dialect = SqlExpressions.DIALECT_ORACLE;
            } else if (SqlUtils.isSqlServer()) {
                dialect = SqlExpressions.DIALECT_SQLSERVER;
            } else if (SqlUtils.isSybase()) {
                dialect = SqlExpressions.DIALECT_SYBASE;
            }
            final DataSource dsGetChildTables =
                    DataSourceFactory.createDataSourceForFields(tables, fieldsSetNull).addQuery(
                        sql, dialect);
            
            final List<DataRecord> records = dsGetChildTables.getRecords();
            this.cascadingDepColsFieldsForSetNull = new ArrayList<String>();
            this.cascadingFieldsToSetNull = new ArrayList<String>();
            
            for (final DataRecord record : records) {
                
                final String tableName = record.getString("afm_flds.table_name");
                final String fieldName = record.getString("afm_flds.field_name");
                final String depColsName = record.getString("afm_flds.dep_cols");
                
                this.cascadingDepColsFieldsForSetNull.add(depColsName);
                childNameList.add(tableName);
                this.cascadingFieldsToSetNull.add(fieldName);
            }
        } else {
            sql =
                    "SELECT DISTINCT afm_flds.table_name FROM afm_flds WHERE afm_flds.ref_table = '"
                            + cascadeTableName
                            + "' AND validate_data=1 AND afm_flds.table_name IN (SELECT table_name FROM afm_tbls WHERE is_sql_view = 0) ";
            sql += " AND (afm_flds.primary_key > 0  OR afm_flds.allow_null = 0)";
            
            final DataSource dsGetChildTables = DataSourceFactory.createDataSource();
            
            dsGetChildTables.addTable("afm_flds").addQuery(sql, SqlExpressions.DIALECT_GENERIC);
            
            final List<DataRecord> records = dsGetChildTables.getRecords();
            for (final DataRecord record : records) {
                
                final String tableName = record.getString("afm_flds.table_name");
                if (!excludedTables.contains(tableName)) {
                    childNameList.add(tableName);
                }
            }
        }
        return childNameList;
    }
    
    /**
     * Returns true if any of the field values in the updatedRecord have changed.
     * 
     * @param updatedRecord the record to check.
     * @return true if any of the field values in the updatedRecord have changed.
     */
    private boolean hasRecordChanged(final DataRecord updatedRecord) {
        boolean hasRecordChanged = false;
        final List<DataValue> fields = updatedRecord.getFields();
        for (final DataValue field : fields) {
            final Object value = field.getValue();
            final Object oldValue = field.getOldValue();
            
            if (value == null) {
                if (oldValue == null) {
                    // value did not change, skip field
                    continue;
                }
            } else {
                if (value.equals(oldValue)) {
                    // value did not change, skip field
                    continue;
                }
            }
            
            hasRecordChanged = true;
            break;
        }
        
        return hasRecordChanged;
    }
    
    /**
     * Called to insert new records into the table with the new primary key with the SQL statement :
     * INSERT INTO RM (bl_id,fl_id,rm_id <Rest of the field names>) (SELECT (@newValues for pk,
     * <Rest of the field names> FROM rm WHERE fl_id = @oldValue)
     * 
     * @param cascadeTableNameList: represent a list of table definition containing field name of
     *            each table.
     * @param pkFields: name of the PK fields of parent table
     * @param updatedRecord: record to be updated from parent table
     * @returns true if the records are inserted successfully.
     */
    private boolean insertNewRecord(List<String> cascadeTableNameList, final List<String> pkFields,
            final DataRecord updatedRecord, final boolean isMerge) {
        
        final Project.Immutable project = ContextStore.get().getProject();
        
        final String pTableName =
                Utility.tableNameFromFullName(updatedRecord.getFields().get(0).getFieldDef()
                    .fullName());
        
        // order the list of tables depending on dependencies between them
        cascadeTableNameList = orderTableList(cascadeTableNameList, INSERT_OPERATION);
        
        String sql_insert_fields = "";
        String sql_select_fields = "";
        String restriction = "";
        String fieldName = "";
        String sqlStatement = "";
        // in case of merge operation we do not need to touch parent table
        if (!isMerge) {
            
            // restriction for parent table
            for (final Iterator<String> it = pkFields.iterator(); it.hasNext();) {
                
                final String foreignFieldName = pTableName + "." + it.next();
                final DataValue foreignField = updatedRecord.findField(foreignFieldName);
                
                restriction += foreignFieldName + " = " + foreignField.getOldDbValue();
                
                if (it.hasNext()) {
                    restriction += " AND ";
                }
            }
            
            // building INSERT INTO parent table (fields)
            for (final Iterator<String> it =
                    project.loadTableDef(pTableName).getFieldNames().iterator(); it.hasNext();) {
                
                fieldName = it.next();
                
                sql_insert_fields += fieldName;
                
                final String foreignFieldName = pTableName + "." + fieldName;
                final DataValue foreignField = updatedRecord.findField(foreignFieldName);
                
                if (pkFields.contains(fieldName)) {
                    sql_select_fields += foreignField.getDbValue();
                } else {
                    sql_select_fields += fieldName;
                }
                if (it.hasNext()) {
                    sql_insert_fields += ",";
                    sql_select_fields += ",";
                }
            }
            sqlStatement =
                    "INSERT INTO " + pTableName + "(" + sql_insert_fields + ")" + " (SELECT "
                            + sql_select_fields + " FROM " + pTableName + " WHERE " + restriction
                            + ")";
            
            SqlUtils.executeUpdate(pTableName, sqlStatement);
            
            sqlStatement = "";
            sql_insert_fields = "";
            sql_select_fields = "";
            restriction = "";
            fieldName = "";
            
        } // end isMerge
        
        // building INSERT INTO for all cascadeTableNameList
        for (final String cascadeTableName : cascadeTableNameList) {
            
            // get table definition to be used later on
            final TableDef.Immutable cascadeTableNameDefn = project.loadTableDef(cascadeTableName);
            
            // return the cascadeTableName's FK
            final ListWrapper.Immutable<String> fkFields =
                    cascadeTableNameDefn.findForeignKeyByReferenceTable(pTableName)
                        .getForeignFields();
            
            // set restriction
            for (int j = 0; j < fkFields.size(); j++) {
                
                final String foreignFieldName = pTableName + "." + pkFields.get(j);
                final DataValue foreignField = updatedRecord.findField(foreignFieldName);
                
                restriction += fkFields.get(j) + " = " + foreignField.getOldDbValue();
                
                if (j < pkFields.size() - 1) {
                    restriction += " AND ";
                }
            }
            
            // process each field from cascade table
            for (final Iterator<String> it = cascadeTableNameDefn.getFieldNames().iterator(); it
                .hasNext();) {
                
                fieldName = it.next();
                
                sql_insert_fields += fieldName;
                
                if (fkFields.contains(fieldName)) {
                    
                    final String foreignFieldName =
                            pTableName + "." + pkFields.get(getIndexOf(fkFields, fieldName));
                    
                    // String foreignFieldName = pTableName + "."
                    // + pkFields.get(fkFields.indexOf(fieldName));
                    final DataValue foreignField = updatedRecord.findField(foreignFieldName);
                    
                    sql_select_fields += foreignField.getDbValue();
                } else {
                    sql_select_fields += fieldName;
                }
                
                if (it.hasNext()) {
                    sql_insert_fields += ",";
                    sql_select_fields += ",";
                }
            }
            sqlStatement =
                    "INSERT INTO " + cascadeTableName + "(" + sql_insert_fields + ")" + " (SELECT "
                            + sql_select_fields + " FROM " + cascadeTableName + " WHERE "
                            + restriction + ")";
            SqlUtils.executeUpdate(cascadeTableName, sqlStatement);
            
            sqlStatement = "";
            restriction = "";
            sql_insert_fields = "";
            sql_select_fields = "";
        }
        return true;
    }
    
    /**
     * returns true if any of primary key of the parent table has been changed
     */
    private boolean isPrimaryKeyChanged(final DataRecord updatedRecord, final String pTableName,
            final List<String> pkFields) {
        
        for (final String pkField : pkFields) {
            final String primaryKeyName = pTableName + "." + pkField;
            final String oldValue =
                    updatedRecord.findField(primaryKeyName).getOldValue().toString();
            final String newValue = updatedRecord.findField(primaryKeyName).getValue().toString();
            if (!oldValue.equals(newValue)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Called to establish the order of table name list. Order the list of tables depending on
     * dependencies between them
     * 
     * @param tableNameList: represent a list of tables to be ordered.
     * @param operation: represent the operation type. This can one of the values: INSERT or DELETE
     * @returns tableNameList: represent ordered list of tables.
     */
    
    private List<String> orderTableList(final List<String> tableNameList, final String operation) {
        
        for (final String tableName : tableNameList) {
            
            final TableDef.ThreadSafe cascadeTableDef =
                    ContextStore.get().getProject().loadTableDef(tableName);
            
            for (final ArchibusFieldDefBase.Immutable pKfieldDef : cascadeTableDef.getPrimaryKey()
                .getFields()) {
                
                final String refTable = pKfieldDef.getReferenceTable();
                final int posRef = tableNameList.indexOf(refTable);
                final int posTbl = tableNameList.indexOf(tableName);
                
                if (tableNameList.contains(refTable) && operation.equals(DELETE_OPERATION)
                        && posTbl > posRef) {
                    tableNameList.set(posRef, tableName);
                    tableNameList.set(posTbl, refTable);
                }
                
                if (tableNameList.contains(refTable) && operation.equals(INSERT_OPERATION)
                        && posTbl < posRef) {
                    tableNameList.set(posRef, tableName);
                    tableNameList.set(posTbl, refTable);
                }
            }
        }
        return tableNameList;
    }
    
    /**
     * Called to set null the records.
     */
    
    private boolean setNull(final List<String> cascadeTableNameList,
            final DataRecord deletedRecord, final List<String> pkFields) {
        
        final String pTableName =
                Utility.tableNameFromFullName(deletedRecord.getFields().get(0).getFieldDef()
                    .fullName());
        int index = 0;
        // build the UPDATE statement for UPDATE SET NULL (cascade delete)
        for (final String tableNameToSetNull : cascadeTableNameList) {
            
            final String setNullField = this.cascadingFieldsToSetNull.get(index);
            final String depColsField = this.cascadingDepColsFieldsForSetNull.get(index);
            final String sql_set_null = setNullField + " = NULL ";
            String sql_restriction = "";
            
            List<String> depCols = new ArrayList<String>();
            if (depColsField.length() > 1) {
                depCols = strToList(depColsField, ";");
                
                // set restriction
                for (int pos = 0; pos < pkFields.size(); pos++) {
                    final String pkField = pkFields.get(pos);
                    String depColName = null;
                    if (pos < depCols.size()) {
                        depColName = depCols.get(pos);
                    }
                    /**
                     * KB 30335189: this is a special case. We treat ehs_restrictions.date_actual as
                     * a particular case.
                     */
                    if ("ehs_restrictions".equals(tableNameToSetNull) && "em".equals(pTableName)) {
                        depColName = getDependentColumnByName(depCols, pkField);
                        if (StringUtil.isNullOrEmpty(depColName)) {
                            break;
                        }
                    }
                    final String pkFieldName = pTableName + "." + pkField;
                    final DataValue pkFieldValue = deletedRecord.findField(pkFieldName);
                    
                    sql_restriction += depColName + " = " + pkFieldValue.getDbValue();
                    
                    if (pos < pkFields.size() - 1) {
                        sql_restriction += " AND ";
                    }
                }
            } else {
                for (final Iterator<String> it = pkFields.iterator(); it.hasNext();) {
                    
                    final String field = it.next();
                    final String foreignFieldName = pTableName + "." + field;
                    final DataValue foreignField = deletedRecord.findField(foreignFieldName);
                    
                    sql_restriction += field + " = " + foreignField.getDbValue();
                    
                    if (it.hasNext()) {
                        sql_restriction += " AND ";
                    }
                } // end for
            }
            
            final String sqlStatement =
                    "UPDATE " + tableNameToSetNull + " SET " + sql_set_null + "WHERE "
                            + sql_restriction;
            
            sqlStatement.contains(" ");
            SqlUtils.executeUpdate(tableNameToSetNull, sqlStatement);
            index++;
        }
        return true;
    }
    
    /**
     * Called to update records.
     * 
     * @param cascadeAllTableNameList: represent all child table names
     * @param cascadeTableNamePKList: represent the child table names that have PK as FK
     * @param updatedRecord: record to be updated from parent table
     * @param setNull: IF setNull=true then the DML will be executed(delete cascade): UPDATE
     *            tableName SET field_name=NULL WHERE field_name=@oldValue
     */
    
    private List<String> strToList(String inputStr, final String delim) {
        
        int len = inputStr.length();
        final List<String> depCols = new ArrayList<String>();
        
        while (len > 0) {
            int endIndex = inputStr.indexOf(delim);
            if (endIndex < 0) {
                endIndex = len;
                final String fieldName = inputStr.substring(0, endIndex);
                depCols.add(fieldName);
                len = -1;
            } else {
                final String fieldName = inputStr.substring(0, endIndex);
                depCols.add(fieldName);
                inputStr = inputStr.substring(endIndex + 1, len);
                len = inputStr.length();
            }
        }
        return depCols;
    }
    
    private void triggerDataEvent(final DataRecord deletedRecord, final String tableName,
            final BeforeOrAfter beforeOrAfter, final ChangeType changeType) {
        final Context context = ContextStore.get();
        
        final DataEventTriggerTemplate dataEventTriggerTemplate =
                new DataEventTriggerTemplate(this.logger);
        final DataChangeEvent dataChangeEvent =
                new RecordChangedEvent(this, beforeOrAfter, context.getUser(), tableName,
                    changeType, deletedRecord);
        dataEventTriggerTemplate.triggerDataEvent(context, dataChangeEvent);
    }
    
    private void updateRecord(final List<String> cascadeAllTableNameList,
            final List<String> cascadeTableNamePKList, final DataRecord updatedRecord) {
        
        // get the parent table
        final String pTableName =
                Utility.tableNameFromFullName(updatedRecord.getFields().get(0).getFieldDef()
                    .fullName());
        
        // build the UPDATE statement for insert cascade
        for (final String cascadeTableName : cascadeAllTableNameList) {
            
            // exclude table with PK as FK build
            if (!cascadeTableNamePKList.contains(cascadeTableName)) {
                
                final TableDef.ThreadSafe cascadeTableDef =
                        ContextStore.get().getProject().loadTableDef(cascadeTableName);
                
                for (final ForeignKey.Immutable foreignKey : cascadeTableDef.getForeignKeys()) {
                    
                    if (pTableName.equals(foreignKey.getReferenceTable())) {
                        
                        String restriction = "";
                        String sqlStatement = "";
                        String set_condition = "";
                        for (int i = 0; i < foreignKey.getForeignFields().size(); i++) {
                            
                            final String fkName = foreignKey.getForeignFields().get(i).toString();
                            
                            final String foreignFieldName =
                                    pTableName + "." + foreignKey.getPrimaryColumns().get(i);
                            final DataValue foreignField =
                                    updatedRecord.findField(foreignFieldName);
                            
                            set_condition += fkName + " = " + foreignField.getDbValue();
                            restriction += fkName + " = " + foreignField.getOldDbValue();
                            
                            if (i < foreignKey.getForeignFields().size() - 1) {
                                set_condition += ", ";
                                restriction += " AND ";
                            }
                            
                        }
                        
                        sqlStatement =
                                "UPDATE " + cascadeTableName + " SET " + set_condition + " WHERE "
                                        + restriction;
                        
                        SqlUtils.executeUpdate(cascadeTableName, sqlStatement);
                        
                        sqlStatement = "";
                        set_condition = "";
                        restriction = "";
                    }
                }
            }
        }
    }
}
