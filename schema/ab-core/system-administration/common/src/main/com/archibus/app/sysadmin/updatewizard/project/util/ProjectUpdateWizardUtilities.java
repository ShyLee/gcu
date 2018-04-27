package com.archibus.app.sysadmin.updatewizard.project.util;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.loader.TableProperties;
import com.archibus.app.sysadmin.updatewizard.schema.compare.CompareFieldDef;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.DatabaseSchemaUtilities;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardConstants;
import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.schema.TableDef;
import com.archibus.utility.ListWrapper;

/**
 * Utility class.
 * 
 * @author Catalin Purice
 * 
 *         This is a helper class that contains trivial methods.
 */
public final class ProjectUpdateWizardUtilities {
    
    /**
     * constant.
     */
    public static final String TABLE_NAME = "table_name";
    
    /**
     * constant.
     */
    public static final String FIELD_NAME = "field_name";
    
    /**
     * constant.
     */
    public static final String IS_SQL_VIEW = "is_sql_view";
    
    /**
     * constant.
     */
    public static final String A_F_T_TABLE_NAME = "afm_flds_trans.table_name";
    
    /**
     * constant.
     */
    public static final String A_F_T_FIELD_NAME = "afm_flds_trans.field_name";
    
    /**
     * constant.
     */
    private static final String AUTONUMBERED_ID = "autonumbered_id";
    
    /**
     * constant.
     */
    private static final String COUNT = "COUNT";
    
    /**
     * constant.
     */
    private static final String SQL_TABLE_DIFFS = "afm_flds_trans.sql_table_diffs";
    
    /**
     * constant.
     */
    private static final String PROCESSING_ORDER = "processing_order";
    
    /**
     * constant.
     */
    private static final String STATUS = "status";
    
    /**
     * constant.
     */
    private static final String A_T_S_SET_NAME = "afm_transfer_set.set_name";
    
    /**
     * constant.
     */
    private static final String A_T_S_N_REC_SOURCE = "afm_transfer_set.nrecords_source";
    
    /**
     * constant.
     */
    private static final String A_T_S_N_REC_DEST = "afm_transfer_set.nrecords_dest";
    
    /**
     * constant.
     */
    private static final String A_T_S_STATUS = "afm_transfer_set.status";
    
    /**
     * constant.
     */
    private static final String A_T_S_TABLE_NAME = "afm_transfer_set.table_name";
    
    /**
     * Constructor.
     */
    private ProjectUpdateWizardUtilities() {
        
    }
    
    /**
     * @param tableName table name.
     * @return DataSource for table name
     */
    public static DataSource createDataSourceForTable(final String tableName) {
        final Project.Immutable project = ContextStore.get().getProject();
        final TableDef.Immutable tableDefn = project.loadTableDef(tableName);
        final ListWrapper.Immutable<String> fieldNames = tableDefn.getFieldNames();
        final String[] arrFields = new String[fieldNames.size()];
        int pos = 0;
        for (final String fieldName : fieldNames) {
            arrFields[pos] = fieldName;
            pos++;
        }
        return DataSourceFactory.createDataSourceForFields(tableName, arrFields);
    }
    
    /**
     * Delete all fields from table. This method is called before every invocation of Transfer
     * in/out/compare operation.
     * 
     * @param tableName table name from which to delete records Justification: Case #4: Statements
     *            with DELETE FROM ... pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static void deleteFromTable(final String tableName) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        EventHandlerBase.executeDbSql(context, "DELETE FROM " + tableName, false);
    }
    
    /**
     * Gets the no of tables that are not UPDATED. This is used for Resume Job operation
     * 
     * @return no of tables updated
     */
    public static int getNoOfTablesUpdated() {
        final Restriction restriction = Restrictions.sql("status = 'UPDATED'");
        return DataStatistics.getInt(ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
            AUTONUMBERED_ID, COUNT, restriction);
    }
    
    /**
     * Gets table names from afm_transfer_set with process = 'PENDING'.
     * 
     * @return no of tables in pending
     */
    public static List<String> getTablesNamesInPending() {
        final String[] fields = { TABLE_NAME };
        final DataSource tableNamesDS =
                DataSourceFactory.createDataSourceForFields(
                    ProjectUpdateWizardConstants.AFM_TRANSFER_SET, fields);
        tableNamesDS.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
            STATUS, ProjectUpdateWizardConstants.PENDING));
        tableNamesDS.addSort(PROCESSING_ORDER);
        tableNamesDS.addSort(TABLE_NAME);
        
        final List<DataRecord> records = tableNamesDS.getAllRecords();
        final List<String> tableNameList = new ArrayList<String>();
        for (int i = 0; i < records.size(); i++) {
            final DataRecord record = records.get(i);
            final String tableName = (String) record.getValue(A_T_S_TABLE_NAME);
            tableNameList.add(tableName);
        }
        
        return tableNameList;
    }
    
    /**
     * Inserts record into afm_transfer_set.
     * 
     * @param compareFieldDef CompareFieldDef object
     * @param checkPK check also PK
     * @param checkFK check also FK
     */
    public static void insertIntoAfmFldsTrans(final CompareFieldDef compareFieldDef,
            final boolean checkPK, final boolean checkFK) {
        
        final List<String> sqlDiffMessages = new ArrayList<String>();
        
        if (checkPK) {
            sqlDiffMessages.add("Primary Key changed.");
        }
        
        if (checkFK) {
            sqlDiffMessages.add("Foreign Key changed.");
        }
        
        if (compareFieldDef.isNew()) {
            final String message = compareFieldDef.getFieldName() + ". Field is New.";
            sqlDiffMessages.add(message);
        }
        
        if (!checkPK && !checkFK) {
            sqlDiffMessages.addAll(compareFieldDef.getChangeMessages());
        }
        final DataSource tableDS =
                ProjectUpdateWizardUtilities
                    .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
        
        // insert one record per difference
        for (final String diffMessage : sqlDiffMessages) {
            final DataRecord record = tableDS.createNewRecord();
            record.setValue(A_F_T_TABLE_NAME, compareFieldDef.getArchTableDef().getName());
            record.setValue(A_F_T_FIELD_NAME, compareFieldDef.getFieldName());
            record.setValue(SQL_TABLE_DIFFS, diffMessage);
            tableDS.saveRecord(record);
            SqlUtils.commit();
        }
    }
    
    /**
     * 
     * @param tableP TableProperties object
     * @param isRecreateTable true if the table is to be recreated
     */
    public static void insertIntoAfmFldsTransWhenRecreate(final TableProperties tableP,
            final boolean isRecreateTable) {
        
        final DataSource tableDS =
                ProjectUpdateWizardUtilities
                    .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
        
        final DataRecord record = tableDS.createNewRecord();
        record.setValue(A_F_T_TABLE_NAME, tableP.getName());
        record.setValue(A_F_T_FIELD_NAME, tableP.getName());
        if (isRecreateTable) {
            record.setValue(SQL_TABLE_DIFFS, "Table to be recreated.");
        } else {
            record.setValue(SQL_TABLE_DIFFS, "Foreign keys to be recreated.");
        }
        tableDS.saveRecord(record);
        SqlUtils.commit();
    }
    
    /**
     * Inserts record into afm_transfer_set.
     * 
     * @param tableProp TableProperties object
     * @param isTransferIn if the operation true else false
     */
    public static void insertIntoAfmTransferSet(final TableProperties tableProp,
            final boolean isTransferIn) {
        
        DataSource tableDS =
                createDataSourceForTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET);
        
        DataRecord record = tableDS.createNewRecord();
        
        // build the record
        record.setValue(A_T_S_SET_NAME, tableProp.getSetName());
        record.setValue(A_T_S_TABLE_NAME, tableProp.getName());
        record.setValue("afm_transfer_set.table_type", tableProp.getType());
        record.setValue(A_T_S_STATUS, ProjectUpdateWizardConstants.PENDING);
        if (isTransferIn) {
            record.setValue(A_T_S_N_REC_DEST, tableProp.getNoOfRecords());
            record.setValue(A_T_S_N_REC_SOURCE, tableProp.getNoCsvRecords());
        } else {
            record.setValue(A_T_S_N_REC_SOURCE, tableProp.getNoOfRecords());
        }
        tableDS.saveRecord(record);
        SqlUtils.commit();
        // fixing for SQL Server to work.
        tableProp.setTableInSql(DatabaseSchemaUtilities.isTableInSql(tableProp.getName()));
        
        if (!tableProp.isTableInSql()) {
            tableDS =
                    ProjectUpdateWizardUtilities
                        .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
            
            record = tableDS.createNewRecord();
            record.setValue(A_F_T_TABLE_NAME, tableProp.getName());
            record.setValue(A_F_T_FIELD_NAME, tableProp.getName());
            record.setValue(SQL_TABLE_DIFFS, "Table doesn't exist in SQL.");
            tableDS.saveRecord(record);
            SqlUtils.commit();
        }
    }
    
    /**
     * 
     * @param tableName table name
     * @param fieldName field name
     * @return true if field exist in ARCHIBUS data dictionary
     */
    public static boolean isFieldInArchibus(final String tableName, final String fieldName) {
        boolean fieldExists = true;
        final DataSource fieldDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_FLDS)
                    .addField(ProjectUpdateWizardConstants.AFM_FLDS, TABLE_NAME)
                    .addField(ProjectUpdateWizardConstants.AFM_FLDS, FIELD_NAME)
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS, TABLE_NAME,
                            tableName))
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS, FIELD_NAME,
                            fieldName));
        final List<DataRecord> records = fieldDS.getRecords();
        if (records.isEmpty()) {
            fieldExists = false;
        }
        return fieldExists;
    }
    
    /**
     * 
     * @return list of table names defined in ARCHIBUS data dictionary
     */
    public static List<String> getProjectTableNames() {
        final DataSource tableDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_TBLS)
                    .addField(ProjectUpdateWizardConstants.AFM_TBLS, TABLE_NAME)
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_TBLS, IS_SQL_VIEW, 0));
        final List<DataRecord> records = tableDS.getRecords();
        final List<String> tableNames = new ArrayList<String>();
        for (final DataRecord record : records) {
            tableNames.add(record.getValue("afm_tbls.table_name").toString());
        }
        return tableNames;
    }
    
    /**
     * returns true is the table exists in afm_tbls and false otherwise.
     * 
     * @param tableName table name
     * @return true if table exist in ARCHIBUS data dictionary
     */
    public static boolean isTableInArchibus(final String tableName) {
        boolean tableExists = true;
        final DataSource missingTableDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_TBLS)
                    .addField(ProjectUpdateWizardConstants.AFM_TBLS, TABLE_NAME)
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_TBLS, IS_SQL_VIEW, 0))
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_TBLS, TABLE_NAME,
                            tableName));
        final List<DataRecord> archTblsRecords = missingTableDS.getRecords();
        if (archTblsRecords.isEmpty()) {
            tableExists = false;
        }
        return tableExists;
    }
    
    /**
     * 
     * @param tableName table name
     * @param status status
     */
    public static void updateTableStatus(final String tableName, final String status) {
        final DataSource dsStatus = DataSourceFactory.createDataSource();
        dsStatus.addTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET);
        dsStatus.addField(AUTONUMBERED_ID);
        dsStatus.addField(STATUS);
        dsStatus.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
            ProjectUpdateWizardConstants.TABLE_NAME, tableName));
        final List<DataRecord> records = dsStatus.getRecords();
        for (final DataRecord record : records) {
            record.setValue(A_T_S_STATUS, status);
            dsStatus.saveRecord(record);
        }
        SqlUtils.commit();
    }
    
    /**
     * Returns the list of fields from ARCHIBUS data dictionary for specified table.
     * 
     * @param tableName table name
     * @return list of fields
     */
    public static List<String> getProjFldNamesForTable(final String tableName) {
        final DataSource fieldsDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_FLDS)
                    .addField(ProjectUpdateWizardConstants.AFM_FLDS, FIELD_NAME)
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS, TABLE_NAME,
                            tableName));
        final List<DataRecord> records = fieldsDS.getRecords();
        final List<String> fieldNames = new ArrayList<String>();
        for (final DataRecord record : records) {
            fieldNames.add(record.getValue("afm_flds.field_name").toString());
        }
        return fieldNames;
    }
    
    /**
     * get no of records from db.
     * 
     * @param tableName table name
     * @return no of records Justification: The table cannot exist in ARCHIBUS Dictionary.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    // TODO: (VT): Justification does not reference a particular case from the Wiki.
    public static int getNoOfRecordsFromDB(final String tableName) {
        final DataSource dsNoOfRec = DataSourceFactory.createDataSource();
        dsNoOfRec.addTable(ProjectUpdateWizardConstants.AFM_TBLS, DataSource.ROLE_MAIN);
        final String query = "SELECT COUNT(*) ${sql.as} numberOfRecords FROM " + tableName;
        dsNoOfRec.addVirtualField(ProjectUpdateWizardConstants.AFM_TBLS, "numberOfRecords",
            DataSource.DATA_TYPE_INTEGER);
        dsNoOfRec.addQuery(query);
        final DataRecord record = dsNoOfRec.getRecord();
        return record.getInt(ProjectUpdateWizardConstants.AFM_TBLS + ".numberOfRecords");
    }
    
    /**
     * Inserts data into afm_flds_trans.
     * 
     * @param tableName table name
     * @param fieldName fieldName
     */
    public static void insertIntoAfmFldsTransWhenDrop(final String tableName, final String fieldName) {
        final DataSource tableDS =
                ProjectUpdateWizardUtilities
                    .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
        final DataRecord record = tableDS.createNewRecord();
        record.setValue(A_F_T_TABLE_NAME, tableName);
        record.setValue(A_F_T_FIELD_NAME, fieldName);
        if ("*all*".equals(fieldName)) {
            record.setValue(SQL_TABLE_DIFFS, "Table is in SQL only.");
        } else {
            record.setValue(SQL_TABLE_DIFFS, fieldName + ". Field is in SQL only.");
        }
        tableDS.saveRecord(record);
        SqlUtils.commit();
    }
    
    /**
     * Inserts data into afm_flds_trans.
     * 
     * @param tableName table name
     */
    public static void insertIntoAfmTransferSetWhenDrop(final String tableName) {
        final DataSource tableDS =
                createDataSourceForTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET);
        final DataRecord record = tableDS.createNewRecord();
        
        // build the record
        record.setValue(A_T_S_SET_NAME, ProjectUpdateWizardConstants.PROJUPWIZ);
        record.setValue(A_T_S_TABLE_NAME, tableName);
        record.setValue(A_T_S_STATUS, ProjectUpdateWizardConstants.PENDING);
        record.setValue(A_T_S_N_REC_SOURCE, getNoOfRecordsFromDB(tableName));
        
        tableDS.saveRecord(record);
        SqlUtils.commit();
    }
    
    /**
     * 
     * @param tableName table name
     * @param fieldName field name
     * @return distinct values
     */
    public static List<String> getDistinctSqlValues(final String tableName, final String fieldName) {
        final DataSource getValueListDs = DataSourceFactory.createDataSource();
        getValueListDs.addTable(tableName);
        getValueListDs.addField(fieldName);
        getValueListDs.setDistinct(true);
        
        final List<String> distinctValues = new ArrayList<String>();
        final List<DataRecord> records = getValueListDs.getRecords();
        // get distinct values
        for (final DataRecord record : records) {
            final String keyValue =
                    String.valueOf(
                        record.getValue(tableName + SchemaUpdateWizardConstants.DOT + fieldName))
                        .trim();
            if (!"null".equals(keyValue) && keyValue.length() > 0) {
                distinctValues.add(keyValue);
            }
        }
        return distinctValues;
    }
    
    /**
     * 
     * Updates field status (afm_flds.transfer_status) to 'NO ACTION'.
     * 
     * @param tableName table name
     *            <p>
     *            Justification: Case #2.2: Statements with UPDATE ... WHERE pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static void setFieldsTransferStatusToNoAction(final String tableName) {
        SqlUtils.executeUpdate(ProjectUpdateWizardConstants.AFM_FLDS, String.format(
            "UPDATE afm_flds SET transfer_status='NO ACTION' WHERE table_name = '%s'", tableName));
    }
}
