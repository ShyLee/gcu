package com.archibus.app.sysadmin.updatewizard.project.compare;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.loader.LoadTableData;
import com.archibus.app.sysadmin.updatewizard.project.transfer.in.CircularReference;
import com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema.SaveDifference;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.*;

/**
 * Compare ARCHIBUS table between CSV file and physical database.
 * 
 * @author Catalin Purice
 * 
 */
public class CompareTableProperties extends LoadTableData {
    
    /**
     * Constant.
     */
    private static final String NEW = "[new]";
    
    /**
     * Constant.
     */
    private static final String TABLE_NAME_TEMPLATE = "[%s]";
    
    /**
     * Constant.
     */
    private static final String NO_TABLE_ARCH = "No Table ";
    
    /**
     * Constant.
     */
    private static final String NO_TABLE_SQL_CSV = "[No Table]";
    
    /**
     * SQL table definition.
     */
    private final DatabaseSchemaTableDef sqlTableDef;
    
    /**
     * 
     * @param tableName table name
     * @param isSqlView true if the table is view
     */
    public CompareTableProperties(final String tableName, final boolean isSqlView) {
        super(tableName, isSqlView);
        this.sqlTableDef = new DatabaseSchemaTableDef(tableName).loadTableFieldsDefn();
    }
    
    /**
     * @return the sqlTableDef
     */
    public DatabaseSchemaTableDef getSqlTableDef() {
        return this.sqlTableDef;
    }
    
    /**
     * 
     */
    public void compareTable() {
        compareExistence();
    }
    
    /**
     * Compares existence.
     */
    private void compareExistence() {
        boolean afmTableExists = true;
        
        final String tableName = this.getTableName();
        
        if (!ProjectUpdateWizardUtilities.isTableInArchibus(tableName)) {
            afmTableExists = false;
        }
        
        if (!isSqlView() && (!afmTableExists || !this.sqlTableDef.exists())) {
            
            final SaveDifference tableDiff = new SaveDifference();
            String dataDictDiff = "";
            String sqlDiff = "";
            
            if (!afmTableExists) {
                dataDictDiff = DifferenceMessage.TBL_IS_NEW.name();
            }
            
            if (!this.sqlTableDef.exists()) {
                sqlDiff = DifferenceMessage.TBL_IS_NEW.getMessage();
            }
            
            tableDiff.buildMapForTable(tableName, DifferenceMessage.ALL_FLDS.getMessage(),
                Actions.APPLY_CHANGE.getMessage(), DifferenceMessage.TBL_IS_NEW.getMessage(),
                dataDictDiff,
                String.format(CompareFieldUtilities.OLD_AND_NEW_VAL_MESS, dataDictDiff, sqlDiff));
            tableDiff.save();
        }
    }
    
    /**
     * check circular references for specified tables.
     * 
     * @param tableNames table names
     */
    public static void checkCircularReferencesForTables(final List<String> tableNames) {
        final List<Map<String, String>> circRefMap =
                CircularReference.getCircularReference(tableNames);
        final SaveDifference tableDiff = new SaveDifference();
        for (final Map<String, String> circRef : circRefMap) {
            tableDiff.buildMapForTable(circRef.get(ProjectUpdateWizardUtilities.TABLE_NAME),
                circRef.get(ProjectUpdateWizardUtilities.FIELD_NAME),
                Actions.NO_ACTION.getMessage(), DifferenceMessage.CIRC_REF.name(), "", "");
            tableDiff.save();
        }
    }
    
    /**
     * check circular references for all tables in project.
     */
    public static void checkCircularReferences() {
        final List<String> tableNames = ProjectUpdateWizardUtilities.getProjectTableNames();
        checkCircularReferencesForTables(tableNames);
    }
    
    /**
     * Checks project tables that are not in CSV file.
     * 
     * @param tablesDataFromFile all tables from afm_tbls.csv
     */
    public static void checkMissingTables(final List<LoadTableData> tablesDataFromFile) {
        
        final List<String> csvTableNames = getTableNamesFromCsv(tablesDataFromFile);
        
        final SaveDifference tableDiff = new SaveDifference();
        for (final String tableName : csvTableNames) {
            boolean tableInProj = false;
            boolean newTableFound = false;
            String archibusValue = NO_TABLE_ARCH;
            String sqlValue = String.format(TABLE_NAME_TEMPLATE, tableName);
            DifferenceMessage changeType = DifferenceMessage.TBL_IS_NEW;
            
            if (ProjectUpdateWizardUtilities.isTableInArchibus(tableName)) {
                tableInProj = true;
                archibusValue = String.format(TABLE_NAME_TEMPLATE, tableName);
            } else {
                newTableFound = true;
            }
            if (!DatabaseSchemaUtilities.isTableInSql(tableName)) {
                sqlValue = NO_TABLE_SQL_CSV;
                newTableFound = true;
                if (tableInProj) {
                    changeType = DifferenceMessage.TBL_IN_PROJ_ONLY;
                }
            }
            
            if (newTableFound) {
                final String csvValue = String.format(TABLE_NAME_TEMPLATE, tableName);
                final String sqlDiff = archibusValue + sqlValue;
                final String ddDiff = archibusValue + csvValue;
                String action = Actions.NO_ACTION.getMessage();
                
                if (!tableInProj) {
                    action = Actions.APPLY_CHANGE.getMessage();
                }
                
                tableDiff.buildMapForTable(tableName, "*all*", action, changeType.name(), ddDiff,
                    sqlDiff);
                tableDiff.save();
            }
        }
    }
    
    /**
     * @param tablesDataFromFile tables
     * @return list of tables as array
     */
    private static List<String> getTableNamesFromCsv(final List<LoadTableData> tablesDataFromFile) {
        // gets all tables names from CSV file.
        final List<String> csvTableNames = new ArrayList<String>();
        for (final LoadTableData tableData : tablesDataFromFile) {
            if (!tableData.isSqlView()) {
                csvTableNames.add(tableData.getTableName());
            }
        }
        return csvTableNames;
    }
    
    /**
     * @param fieldsDataFromFile fields properties from afm_flds.csv
     */
    public static void checkMissingFieldsFromCsv(final List<Map<String, Object>> fieldsDataFromFile) {
        // gets tables only, not views
        final List<String> csvTableNames = CsvUtilities.getAllTableNames(fieldsDataFromFile);
        
        final List<String> missingTablesNames = getMissingArchibusTablesFromCsv(csvTableNames);
        
        for (final String csvTableName : csvTableNames) {
            // skip missing tables
            if (missingTablesNames.contains(csvTableName)) {
                continue;
            }
            final List<String> csvFieldNames =
                    CsvUtilities.getFieldNamesForTable(csvTableName, fieldsDataFromFile);
            final List<String> missFieldNamesFromCsv =
                    getMissingFieldsFromCsvForTable(csvTableName, csvFieldNames);
            
            final List<String> missingFieldsFromSql =
                    DatabaseSchemaUtilities.getMissingFieldsFromSql(csvTableName);
            
            if (!missFieldNamesFromCsv.isEmpty()) {
                
                final SaveDifference tableDiff = new SaveDifference();
                String sqlDiff = "";
                for (final String missingField : missFieldNamesFromCsv) {
                    
                    if (missingFieldsFromSql.contains(missingField)) {
                        sqlDiff = "[No Field]";
                    }
                    
                    tableDiff.buildMapForTable(csvTableName, missingField,
                        Actions.DELETE_FIELD.getMessage(), DifferenceMessage.PROJECT_ONLY.name(),
                        NEW, sqlDiff);
                    tableDiff.save();
                }
            }
        }
    }
    
    /**
     * gets missing fields from csv for table.
     * 
     * @param csvTablesNames tables from afm_tbls.csv file
     * @return missing tables from csv
     */
    private static List<String> getMissingArchibusTablesFromCsv(final List<String> csvTablesNames) {
        final List<String> projTablesNames = ProjectUpdateWizardUtilities.getProjectTableNames();
        final List<String> missingTables = new ArrayList<String>();
        
        for (final String projTableName : projTablesNames) {
            if (!csvTablesNames.contains(projTableName)) {
                missingTables.add(projTableName);
            }
        }
        return missingTables;
    }
    
    /**
     * gets missing fields from csv for specified table name.
     * 
     * @param tableName table name
     * @param csvFieldNames fields properties from afm_flds.csv
     * @return missing fields
     */
    private static List<String> getMissingFieldsFromCsvForTable(final String tableName,
            final List<String> csvFieldNames) {
        final List<String> projFieldNames =
                ProjectUpdateWizardUtilities.getProjFldNamesForTable(tableName);
        final List<String> missingFieldsFromCsv = new ArrayList<String>();
        for (final String projFieldName : projFieldNames) {
            
            if (!csvFieldNames.contains(projFieldName)) {
                missingFieldsFromCsv.add(projFieldName);
            }
        }
        return missingFieldsFromCsv;
    }
}
