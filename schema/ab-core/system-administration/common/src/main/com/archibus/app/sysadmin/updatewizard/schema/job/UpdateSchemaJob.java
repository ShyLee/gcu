package com.archibus.app.sysadmin.updatewizard.schema.job;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.DatabaseSchemaTableDef;
import com.archibus.app.sysadmin.updatewizard.schema.output.*;
import com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.*;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardConstants;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.schema.TableDef;

/**
 * schema update wizard job.
 * 
 * @author Catalin Purice
 * 
 */
public class UpdateSchemaJob extends JobBase {
    
    /**
     * Constant.
     */
    private static final transient int EXEC_FK_PERCENT = 10;
    
    /**
     * If true executes the commands on DB, and write to log file if false.
     */
    private final transient boolean executeDbCommand;
    
    /**
     * If true recreates all foreign keys for the specified tables.
     */
    private final transient boolean isRecreateAllFK;
    
    /**
     * If true recreates tables instead of alter them.
     */
    private final transient boolean isRecreateTable;
    
    /**
     * Output.
     */
    private transient SqlCommandOutput output;
    
    /**
     * Oracle option only.
     */
    private final transient boolean setToChar;
    
    /**
     * Name of the BLOB table space for Oracle.
     */
    private final transient String tableSpaceName;
    
    /**
     * Constructor.
     * 
     * @param executeDbCommand @see {@link UpdateSchemaJob#executeDbCommand}
     * @param isRecreateTable @see {@link UpdateSchemaJob#isRecreateTable}
     * @param isRecreateAllFK @see {@link UpdateSchemaJob#isRecreateAllFK}
     * @param setToChar @see {@link UpdateSchemaJob#setToChar}
     * @param tableSpaceName @see {@link UpdateSchemaJob#tableSpaceName}
     */
    public UpdateSchemaJob(final boolean executeDbCommand, final boolean isRecreateTable,
            final boolean isRecreateAllFK, final boolean setToChar, final String tableSpaceName) {
        super();
        this.executeDbCommand = executeDbCommand;
        this.isRecreateTable = isRecreateTable;
        this.isRecreateAllFK = isRecreateAllFK;
        this.setToChar = setToChar;
        this.tableSpaceName = tableSpaceName;
    }
    
    @Override
    public void run() {
        
        if (this.executeDbCommand) {
            this.output = new ExecuteCommand();
        } else {
            this.output = new LogCommand();
        }
        
        if (SqlUtils.isOracle() && this.setToChar) {
            final String stmt = SchemaUpdateWizardConstants.SET_NLS_TO_CHAR_STMT;
            this.output.runCommand(stmt, DataSource.DB_ROLE_SCHEMA);
        }
        
        final List<String> tablesName = ProjectUpdateWizardUtilities.getTablesNamesInPending();
        int updatedTables = ProjectUpdateWizardUtilities.getNoOfTablesUpdated();
        
        setTotalNumber(tablesName, updatedTables);
        
        CreateAlterTable updTable = null;
        final List<String> postponedStmts = new ArrayList<String>();
        final List<String> fkAlreadyDropped = new ArrayList<String>();
        
        for (final String tableName : tablesName) {
            if (this.stopRequested) {
                this.status.setCode(JobStatus.JOB_STOPPED);
                return;
            } else {
                final DatabaseSchemaTableDef sqlTableDef =
                        new DatabaseSchemaTableDef(tableName).loadTableFieldsDefn();
                if (ProjectUpdateWizardUtilities.isTableInArchibus(tableName)) {
                    final TableDef.ThreadSafe tableDef =
                            ContextStore.get().getProject().loadTableDef(tableName);
                    updTable = new CreateAlterTable(tableDef, this.output, this.tableSpaceName);
                    updTable.setSqlTableDef(sqlTableDef);
                    updTable.setNlsToChar(this.setToChar);
                    createOrAlterTable(updTable, postponedStmts, tableName, sqlTableDef,
                        fkAlreadyDropped);
                } else {
                    updTable = new CreateAlterTable();
                    updTable.setSqlTableDef(sqlTableDef);
                    updTable.setOutput(this.output);
                    updTable.setTableSpaceName(this.tableSpaceName);
                    updTable.dropTable(tableName);
                }
                this.status.setCurrentNumber(++updatedTables);
                ProjectUpdateWizardUtilities.updateTableStatus(tableName,
                    ProjectUpdateWizardConstants.UPDATED);
                this.status.setResult(new JobResult(""));
            }
            createUniqueList(fkAlreadyDropped, updTable.getDroppedForeignKeysContraints());
        }
        
        if (this.isRecreateAllFK) {
            final List<String> dropAddFkCommands =
                    reCreateAllForeignKeys(tablesName, fkAlreadyDropped);
            postponedStmts.addAll(dropAddFkCommands);
        }
        this.output.runCommandsNoException(postponedStmts);
        this.status.setResult(new JobResult(""));
        
        this.status.setCode(JobStatus.JOB_COMPLETE);
        this.output.close();
    }
    
    /**
     * 
     * Call alter table workflow if the table exists and was changed or create the table if it
     * doesn't exist in the SQL DB.
     * 
     * @param updTable CreateAlterTable object
     * @param postponedStmts postponed statements
     * @param tableName affected table name
     * @param sqlTableDef SQL table object
     * @param fkAlreadyDropped update the FK list that were dropped in the alter table process
     */
    private void createOrAlterTable(final CreateAlterTable updTable,
            final List<String> postponedStmts, final String tableName,
            final DatabaseSchemaTableDef sqlTableDef, final List<String> fkAlreadyDropped) {
        if (sqlTableDef.exists()) {
            if (this.isRecreateTable) {
                // recreate table
                ProjectUpdateWizardUtilities.updateTableStatus(tableName,
                    ProjectUpdateWizardConstants.IN_PROGRESS);
                this.status.setResult(new JobResult(String.format("Recreating table %s ...",
                    updTable.getTableDef().getName())));
                updTable.recreateTable();
                postponedStmts.addAll(updTable.getPostponedStmts());
            } else {
                // alter table
                ProjectUpdateWizardUtilities.updateTableStatus(tableName,
                    ProjectUpdateWizardConstants.IN_PROGRESS);
                this.status.setResult(new JobResult(String.format("Altering table %s ...", updTable
                    .getTableDef().getName())));
                // add drop fields.
                final AddDropFields fldsToAddOrDrop =
                        new AddDropFields(tableName, this.output, this.tableSpaceName);
                fldsToAddOrDrop.process();
                fkAlreadyDropped.addAll(fldsToAddOrDrop.getDroppedForeignKeysContraints());
                // update sql table object
                updTable.setSqlTableDef(sqlTableDef.loadTableFieldsDefn());
                updTable.addDroppedContraints(fkAlreadyDropped);
                updTable.alterTable();
                postponedStmts.addAll(fldsToAddOrDrop.getPostponedStmts());
                postponedStmts.addAll(updTable.getPostponedStmts());
            }
        } else {
            // table is new
            this.status.setResult(new JobResult(String.format("Create table %s ...", updTable
                .getTableDef().getName())));
            // recreates table and primary keys. Foreign keys to be created later.
            updTable.createTable();
            postponedStmts.addAll(updTable.getPostponedStmts());
        }
    }
    
    /**
     * 
     * Merge two lists into one unique list. list1 is updated.
     * 
     * @param list1 first list
     * @param list2 second list
     */
    private void createUniqueList(final List<String> list1, final List<String> list2) {
        for (final String elem : list2) {
            if (!list1.contains(elem)) {
                list1.add(elem);
            }
        }
    }
    
    /**
     * Creates foreign keys for new tables. This operation will be executed after the table are
     * created.
     * 
     * @param tablesName table name
     * @param fkAlreadyDropped true if the FK were already dropped
     * @return list of statements
     */
    private List<String> reCreateAllForeignKeys(final List<String> tablesName,
            final List<String> fkAlreadyDropped) {
        
        List<String> fKeysAlreadyCreated = new ArrayList<String>();
        List<String> fKeysAlreadyDropped = new ArrayList<String>();
        
        fKeysAlreadyDropped.addAll(fkAlreadyDropped);
        
        final List<String> postponedStmts = new ArrayList<String>();
        
        for (final String tableName : tablesName) {
            // final boolean dropForeignKeys = !fkAlreadyDropped.get(tablesName.indexOf(tableName));
            if (ProjectUpdateWizardUtilities.isTableInArchibus(tableName)) {
                this.status.setResult(new JobResult(String.format(
                    "Re-creating foreign keys for table %s ...", tableName)));
                final TableDef.ThreadSafe archibusTableDef =
                        ContextStore.get().getProject().loadTableDef(tableName);
                final CreateAlterTable updTable =
                        new CreateAlterTable(archibusTableDef, this.output, this.tableSpaceName);
                final DatabaseSchemaTableDef sqlTableDef =
                        new DatabaseSchemaTableDef(tableName).loadTableFieldsDefn();
                updTable.setSqlTableDef(sqlTableDef);
                // sets the FK already dropped
                updTable.addDroppedContraints(fKeysAlreadyDropped);
                // drops the remaining FKs
                updTable.dropAllFK();
                // update dropped FKs list
                fKeysAlreadyDropped = updTable.getDroppedForeignKeysContraints();
                // creates the remaining FKs
                updTable.addCreatedContraints(fKeysAlreadyCreated);
                // creates the remaining FKs
                postponedStmts.addAll(updTable.recreateAllFK(false));
                // sets/update the FK already dropped
                fKeysAlreadyCreated = updTable.getAddedForeignKeysContraints();
                
                postponedStmts.addAll(updTable.getPostponedStmts());
                
                this.status.incrementCurrentNumber();
            }
        }
        return postponedStmts;
    }
    
    /**
     * 
     * Sets total number for the job.
     * 
     * @param tablesNames tables names to be updated
     * @param updatedTables no of tables already updated
     */
    private void setTotalNumber(final List<String> tablesNames, final int updatedTables) {
        
        final int pendingTables = tablesNames.size();
        
        int totalNumber = pendingTables + updatedTables;
        
        if (this.isRecreateAllFK) {
            final int alterTableAndFkGeneration = totalNumber * 2;
            // time for executing FKs should be around 10% from all process.
            final int fkExecutionToDbOrWritingToFile = alterTableAndFkGeneration / EXEC_FK_PERCENT;
            totalNumber =
                    Integer.valueOf(alterTableAndFkGeneration + fkExecutionToDbOrWritingToFile);
        }
        this.status.setTotalNumber(totalNumber);
        this.status.setCurrentNumber(updatedTables);
    }
}
