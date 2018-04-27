package com.archibus.app.sysadmin.updatewizard.schema.prepare;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.*;
import com.archibus.app.sysadmin.updatewizard.schema.util.*;
import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.schema.TableDef;
import com.archibus.utility.XmlImpl;

/**
 * Updates old schemas to 20.1 version.
 * 
 * @author Catalin Purice
 */
public class UpdateSchemaVersion {
    
    /**
     * constant.
     */
    private static final String MIN_DB_VER_NUM = "121";
    
    /**
     * constant.
     */
    private static final String WFR_TABLE = "afm_wf_rules";
    
    /**
     * constant.
     */
    private static final String AFM_SCM_PREF_TABLE = "afm_scmpref";
    
    /**
     * constant.
     */
    private static final String AFM_DB_VER_NUM_FIELD = "afm_db_version_num";
    
    /**
     * constant.
     */
    private static final String AFM_DB_VER_NUM_FULL_FIELD_NAME = "afm_scmpref.afm_db_version_num";
    
    /**
     * constant.
     */
    private static final String AB_COMM_RESOURCES = "AbCommonResources";
    
    /**
     * the output.
     */
    private final transient SqlCommandOutput output;
    
    /**
     * 
     * @param output output
     */
    public UpdateSchemaVersion(final SqlCommandOutput output) {
        this.output = output;
    }
    
    /**
     * Gets current version number.
     * 
     * @return the version number
     */
    public static int getCurrentDbVersionNumber() {
        final DataSource dbVerDS =
                DataSourceFactory.createDataSource().addTable(AFM_SCM_PREF_TABLE)
                    .addField(AFM_DB_VER_NUM_FIELD);
        final DataRecord record = dbVerDS.getRecord();
        return record.getInt(AFM_DB_VER_NUM_FULL_FIELD_NAME);
    }
    
    /**
     * Updates AFM_TBLS table. table_type is missing up to afm_db_ver_num = 135.
     */
    public void updateDataDictionarySchema() {
        // alter data dictionary
        createOrAlterTable(ProjectUpdateWizardConstants.AFM_TBLS);
        createOrAlterTable(ProjectUpdateWizardConstants.AFM_FLDS);
        // alter project update wizard tables
        createOrAlterTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET);
        createOrAlterTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
    }
    
    /**
     * Alter the tables.
     * 
     * @param tableName table name
     */
    private void createOrAlterTable(final String tableName) {
        DatabaseSchemaTableDef sqlTblDef =
                new DatabaseSchemaTableDef(tableName).loadTableFieldsDefn();
        final TableDef.ThreadSafe afmTblDef =
                ContextStore.get().getProject().loadTableDef(tableName);
        final CreateAlterTable alterTable = new CreateAlterTable(afmTblDef, this.output, "");
        alterTable.setSqlTableDef(sqlTblDef);
        if (sqlTblDef.exists()) {
            final AddDropFields fldsToAddOrDrop = new AddDropFields(tableName, this.output, "");
            fldsToAddOrDrop.process();
            if (fldsToAddOrDrop.isTableChanged()) {
                sqlTblDef = new DatabaseSchemaTableDef(tableName).loadTableFieldsDefn();
                alterTable.setSqlTableDef(sqlTblDef);
            }
            alterTable.alterTable();
        } else {
            alterTable.createTable();
            alterTable.dropAllFK();
            alterTable.createAllForeignKeys();
        }
    }
    
    /**
     * Add project update wizard tables.
     */
    public void addNewProjUpWizObjects() {
        
        final UpdateArchibusSchemaUtilities puwUpdateSchema = new UpdateArchibusSchemaUtilities();
        
        boolean dataDictChanged = false;
        
        if (puwUpdateSchema.increaseEnumListSizeForTable(ProjectUpdateWizardConstants.AFM_FLDS)) {
            dataDictChanged = true;
        }
        
        if (ProjectUpdateWizardUtilities
            .isTableInArchibus(ProjectUpdateWizardConstants.AFM_FLDS_TRANS)
                && puwUpdateSchema
                    .increaseEnumListSizeForTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS)) {
            dataDictChanged = true;
        }
        
        List<String> sqlCommands = puwUpdateSchema.getInsertIntoAfmFldsStmt();
        
        if (!sqlCommands.isEmpty()) {
            this.output.runCommands(sqlCommands);
            SqlUtils.commit();
            dataDictChanged = true;
        }
        
        sqlCommands.clear();
        sqlCommands = puwUpdateSchema.getInsertProjUpWizTablesStmt();
        
        if (!sqlCommands.isEmpty()) {
            this.output.runCommands(sqlCommands);
            SqlUtils.commit();
            dataDictChanged = true;
        }
        
        if (dataDictChanged) {
            ContextStore.get().getProject().clearCachedTableDefs();
            updateDataDictionarySchema();
            ContextStore.get().getProject().clearCachedTableDefs();
        }
        
        if (!DatabaseSchemaUtilities.isTableInSql(ProjectUpdateWizardConstants.AFM_TRANSFER_SET)) {
            createOrAlterTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET);
        }
        
        if (!DatabaseSchemaUtilities.isTableInSql(ProjectUpdateWizardConstants.AFM_FLDS_TRANS)) {
            createOrAlterTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
        }
    }
    
    /**
     * Adds the afm_flds.validate_data, attributes field. Updates from 120 to 121 db version.
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Use INSERT or DDL commands to manipulate the ARCHIBUS data dictionary.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    // TODO: (VT): Justification does not reference a particular case from the Wiki.
    public void updateDbVersion120to121() {
        final ArrayList<String> sqlCommands = new ArrayList<String>();
        
        sqlCommands
            .add("UPDATE afm_flds SET afm_size=850 WHERE table_name='afm_flds' AND field_name='enum_list'");
        
        final String fieldsForOldVersion =
                UpdateArchibusSchemaUtilities.AFMFLDS_FIELDS.replace(",VALIDATE_DATA", "");
        if (!ProjectUpdateWizardUtilities.isFieldInArchibus(ProjectUpdateWizardConstants.AFM_FLDS,
            "attributes")) {
            sqlCommands.add(fieldsForOldVersion
                    + " VALUES ('afm_flds','attributes',2050,1,'Trinidad',12,0,"
                    + "null,null,null,null,null,0,null,null,"
                    + "'Field Attributes',0,0,0,null,null,2000,null,40,0,null)");
        }
        if (!ProjectUpdateWizardUtilities.isFieldInArchibus(ProjectUpdateWizardConstants.AFM_FLDS,
            "validate_data")) {
            sqlCommands
                .add(fieldsForOldVersion
                        + " VALUES ('afm_flds','validate_data',2050,0,'Trinidad - Only affects validated fields.',"
                        + "5,0,null,1,null,null,'0;No;1;Yes',0,null,null,'Validate Data?'"
                        + ",0,0,0,null,null,1,null,5,0,null)");
        }
        sqlCommands.add("DELETE FROM afm_flds WHERE table_name = 'afm_wf_rules'");
        sqlCommands.add("DELETE FROM afm_tbls WHERE table_name = 'afm_wf_rules'");
        sqlCommands
            .add("UPDATE afm_flds SET field_name='alt_title' WHERE field_name='Alt_title' AND table_name='vn'");
        sqlCommands.add("COMMIT");
        if (DatabaseSchemaUtilities.isTableInSql(WFR_TABLE)) {
            sqlCommands.add("DROP TABLE afm_wf_rules");
        }
        
        this.output.runCommands(sqlCommands);
        final Project.Immutable project = ContextStore.get().getProject();
        project.clearCachedTableDefs();
        createOrAlterTable(ProjectUpdateWizardConstants.AFM_TBLS);
        createOrAlterTable(ProjectUpdateWizardConstants.AFM_FLDS);
        updateSchemPrefTable(MIN_DB_VER_NUM);
        project.clearCachedTableDefs();
        ((XmlImpl) project).setAttribute("/*/preferences", AFM_DB_VER_NUM_FIELD, MIN_DB_VER_NUM,
            true);
    }
    
    /**
     * Updates afm_scmpref table.
     * 
     * @param dbVerNum database version number
     */
    public void updateSchemPrefTable(final String dbVerNum) {
        final DataSource afmScmPrefDs =
                DataSourceFactory.createDataSource().addTable(AFM_SCM_PREF_TABLE)
                    .addField(AFM_SCM_PREF_TABLE).addField(AFM_DB_VER_NUM_FIELD);
        final DataRecord record = afmScmPrefDs.getRecord();
        record.setDbValue(AFM_DB_VER_NUM_FULL_FIELD_NAME, dbVerNum);
        afmScmPrefDs.saveRecord(record);
        afmScmPrefDs.commit();
    }
    
    /**
     * prepare db for project update wizard to be able to run.
     */
    public void updateDbVersionForProjUpWiz() {
        if (SqlUtils.isSybase()) {
            SybaseActions.setStringRTruncation(false);
        }
        
        final UpdateArchibusSchemaUtilities puwUpdateSchema = new UpdateArchibusSchemaUtilities();
        
        addNewProjUpWizObjects();
        
        if (ProjectUpdateWizardUtilities.isTableInArchibus(WFR_TABLE)) {
            boolean wfRulesChanged = false;
            if (!puwUpdateSchema.wfrExists(AB_COMM_RESOURCES, "getJobStatus")) {
                puwUpdateSchema.addGetJobStatusWfRuleId();
                wfRulesChanged = true;
            }
            if (!puwUpdateSchema.wfrExists(AB_COMM_RESOURCES, "getDataRecords")) {
                puwUpdateSchema.addGetDataRecordsWfRuleId();
                wfRulesChanged = true;
            }
            if (!puwUpdateSchema.wfrExists(AB_COMM_RESOURCES, "getDataRecord")) {
                puwUpdateSchema.addGetDataRecordWfRuleId();
                wfRulesChanged = true;
            }
            
            if (!puwUpdateSchema.wfrExists(AB_COMM_RESOURCES, "stopJob")) {
                puwUpdateSchema.addStopJobWfRuleId();
                wfRulesChanged = true;
            }
            
            if (wfRulesChanged) {
                // reload workflow rules to reflect the changes
                ContextStore.get().getProject().reloadWorkflowRules();
            }
        } else {
            final List<String> sqlStmts = puwUpdateSchema.getWfRulesTableStmts();
            this.output.runCommands(sqlStmts);
            ContextStore.get().getProject().clearCachedTableDefs();
            
            final TableDef.ThreadSafe tableDef =
                    ContextStore.get().getProject().loadTableDef(WFR_TABLE);
            final DatabaseSchemaTableDef sqlTableDef =
                    new DatabaseSchemaTableDef(tableDef.getName()).loadTableFieldsDefn();
            final CreateAlterTable suwCreate = new CreateAlterTable(tableDef, this.output, "");
            suwCreate.setSqlTableDef(sqlTableDef);
            suwCreate.createTable();
            puwUpdateSchema.addGetJobStatusWfRuleId();
            puwUpdateSchema.addGetDataRecordsWfRuleId();
            puwUpdateSchema.addGetDataRecordWfRuleId();
            puwUpdateSchema.addStopJobWfRuleId();
            
            // reload workflow rules to reflect the changes
            ContextStore.get().getProject().reloadWorkflowRules();
        }
        puwUpdateSchema.updateChangeTypeEnumList();
        puwUpdateSchema.addReviewErrorRecAction();
        puwUpdateSchema.addInProcessStatus();
        SchemaUpdateWizardUtilities.adjustTooBigFieldsSizes();
        ContextStore.get().getProject().clearCachedTableDefs();
        
        if (SqlUtils.isSybase()) {
            SybaseActions.setStringRTruncation(true);
        }
        
    }
}
