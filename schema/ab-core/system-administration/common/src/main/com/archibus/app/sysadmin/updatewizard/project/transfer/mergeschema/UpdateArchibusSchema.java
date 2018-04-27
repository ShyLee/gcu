package com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.loader.DataSourceFile;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.JobStatus;
import com.archibus.utility.ExceptionBase;
import com.enterprisedt.util.debug.Logger;

/**
 * Updates the ARCHIBUS Data Dictionary.
 * 
 * @author Catalin Purice
 * 
 *         Suppress PMD warning "AvoidUsingSql" in this method.
 */
public class UpdateArchibusSchema {
    
    /**
     * Action type.
     * 
     * @author Catalin
     * 
     */
    public enum ACTIONTYPE {
        /**
         * chosen action.
         */
        CHOSEN_ACTION,
        /**
         * recommended action.
         */
        REC_ACTION
    }
    
    /**
     * constant.
     */
    public static final String ENUM_LIST = "enum_list";
    
    /**
     * constant.
     */
    public static final String ML_HEADING = "ml_heading";
    
    /**
     * constant.
     */
    public static final String AFM_FLDS_TRANS_REC_ACTION = "afm_flds_trans.rec_action";
    
    /**
     * constant.
     */
    public static final String AFM_FLDS_TRANS_CHOSEN_ACTION = "afm_flds_trans.chosen_action";
    
    /**
     * constant.
     */
    public static final String CHANGE_TYPE_FIELD = "afm_flds_trans.change_type";
    
    /**
     * constant.
     */
    private static final String CHANGE_TYPE = "change_type";
    
    /**
     * constant.
     */
    private static final String REF_TABLE = "ref_table";
    
    /**
     * constant.
     */
    private static final String TRANSFER_STATUS = "afm_flds.transfer_status";
    
    /**
     * constant.
     */
    private static final String STATUS_UPDATED = "UPDATED";
    
    /**
     * constant.
     */
    private static final String EMPTY_STRING = "";
    
    /**
     * constant.
     */
    private static final String EDIT_GROUP = "afm_flds.edit_group";
    
    /**
     * constant.
     */
    private static final String REVIEW_GROUP = "afm_flds.review_group";
    
    /**
     * constant.
     */
    private static final String AFM_GROUPS_TABLE = "afm_groups";
    
    /**
     * constant.
     */
    private static final String GROUP_NAME_FIELD = "group_name";
    
    /**
     * constant.
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this static variable.
     * <p>
     * Justification: This is not an SQL command.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static final String IN_CLAUSE_VALUES_FOR_RECOMM = "APPLY CHANGE,DELETE FIELD";
    
    /**
     * constant.
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this static variable.
     * <p>
     * Justification: This is not an SQL command.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static final String IN_CLAUSE_VALUES_FOR_CHOSEN =
            "APPLY CHANGE,DELETE FIELD,KEEP EXISTING";
    
    /**
     * Postponed changes.
     */
    private final List<DataRecord> postponedChanges = new ArrayList<DataRecord>();
    
    /**
     * afm_flds_trans dataSource.
     */
    private final DataSource afmFldsTransDs = ProjectUpdateWizardUtilities
        .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS).addRestriction(
            Restrictions.isNotNull(ProjectUpdateWizardConstants.AFM_FLDS_TRANS, "data_dict_diffs"));
    
    /**
     * afm_flds dataSource.
     */
    private final DataSource afmFldsDs = ProjectUpdateWizardUtilities
        .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS);
    
    /**
     * afm_tbls dataSource.
     */
    private final DataSource afmTblsDs = ProjectUpdateWizardUtilities
        .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_TBLS);
    
    /**
     * afm_flds dataSource.
     */
    private DataSource afmFldsLangDs;
    
    /**
     * True if the locale is EN and false otherwise.
     */
    private final boolean isLangEn;
    
    /**
     * Suffix for translatable fields.
     */
    private final String langSuffix;
    
    /**
     * True if the field translatable one.
     */
    private boolean isLangField;
    
    /**
     * field name.
     */
    private transient String fieldName;
    
    /**
     * table name.
     */
    private transient String tableName;
    
    /**
     * field to update.
     */
    private transient String fieldToUpdate;
    
    /**
     * field value.
     */
    private transient Object fieldValue;
    
    /**
     * Constructor.
     * 
     * @param aType action type
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #1: Statements with SELECT WHERE EXISTS ... pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public UpdateArchibusSchema(final ACTIONTYPE aType) {
        final String query =
                "SELECT * FROM afm_flds_trans a1 WHERE autonumbered_id NOT IN "
                        + "(SELECT autonumbered_id FROM afm_flds_trans a1 WHERE change_type='NEW' "
                        + "AND EXISTS(SELECT 1 FROM afm_flds_trans a2 "
                        + "WHERE a2.table_name = a1.table_name AND a2.change_type='TBL_IS_NEW'))";
        if (aType == ACTIONTYPE.REC_ACTION) {
            this.afmFldsTransDs.addQuery(query).addRestriction(
                Restrictions.in(ProjectUpdateWizardConstants.AFM_FLDS_TRANS, "rec_action",
                    IN_CLAUSE_VALUES_FOR_RECOMM));
        } else {
            this.afmFldsTransDs.addQuery(query).addRestriction(
                Restrictions.in(ProjectUpdateWizardConstants.AFM_FLDS_TRANS, "chosen_action",
                    IN_CLAUSE_VALUES_FOR_CHOSEN));
        }
        this.isLangEn = LangUtilities.isLangEn();
        this.langSuffix = LangUtilities.getFieldSuffix();
        if (!this.isLangEn) {
            this.afmFldsLangDs =
                    DataSourceFactory.createDataSource()
                        .addTable(ProjectUpdateWizardConstants.AFM_FLDS_LANG)
                        .addField(ProjectUpdateWizardUtilities.TABLE_NAME)
                        .addField(ProjectUpdateWizardUtilities.FIELD_NAME)
                        .addField(ENUM_LIST + this.langSuffix)
                        .addField(ML_HEADING + this.langSuffix);
        }
    }
    
    /**
     * Updates the data dictionary.
     * 
     * @param status job status
     */
    public void update(final JobStatus status) {
        
        final List<DataRecord> records = this.afmFldsTransDs.getRecords();
        status.setTotalNumber(records.size());
        int count = 0;
        for (final DataRecord record : records) {
            try {
                final String chosenAction =
                        record.getValue(AFM_FLDS_TRANS_CHOSEN_ACTION).toString();
                if (Actions.KEEP_EXISTING.getMessage().equals(chosenAction)) {
                    this.afmFldsTransDs.deleteRecord(record);
                } else {
                    updateDictionary(record);
                    this.afmFldsTransDs.deleteRecord(record);
                }
            } catch (final ExceptionBase e) {
                Logger.getLogger(getClass()).error(e.toStringForLogging(), e);
            }
            
            status.setCurrentNumber(++count);
        }
        savePostponedRecords();
        SqlUtils.commit();
    }
    
    /**
     * Saves postponed records.
     * 
     * @throws ExceptionBase in case the saveRecord(record) fails
     */
    private void savePostponedRecords() throws ExceptionBase {
        for (final DataRecord record : this.postponedChanges) {
            this.afmFldsDs.saveRecord(record);
        }
    }
    
    /**
     * creates the query.
     * 
     * @param record record
     */
    private void updateDictionary(final DataRecord record) {
        String chgType = record.getValue(CHANGE_TYPE_FIELD).toString();
        this.tableName = record.getValue(ProjectUpdateWizardUtilities.A_F_T_TABLE_NAME).toString();
        this.fieldName = record.getValue(ProjectUpdateWizardUtilities.A_F_T_FIELD_NAME).toString();
        
        if ("size".equalsIgnoreCase(chgType)) {
            chgType = DifferenceMessage.AFM_SIZE.name();
        } else if ("validate".equalsIgnoreCase(chgType)) {
            chgType = DifferenceMessage.VALIDATE_DATA.name();
        }
        if (chgType.equals(DifferenceMessage.TBL_IS_NEW.toString())) {
            addNewTable();
        } else {
            if (chgType.equals(DifferenceMessage.TBL_IN_PROJ_ONLY.toString())) {
                deleteTable();
            } else if (chgType.equals(DifferenceMessage.PROJECT_ONLY.toString())) {
                deleteField();
            } else if (chgType.equals(DifferenceMessage.NEW.toString())) {
                addNewFieldToExistanceTable(record);
            } else {
                this.fieldValue =
                        record.getValue(ProjectUpdateWizardConstants.AFM_FLDS_TRANS + '.'
                                + chgType.toLowerCase(Locale.getDefault()));
                this.fieldToUpdate = getFieldNameToUpdate(chgType);
                updateField();
            }
        }
    }
    
    /**
     * 
     * Gets field name to update. For enum_list and ml_heading the language suffix will be added.
     * 
     * @param changeType change type
     * @return updated field name
     */
    private String getFieldNameToUpdate(final String changeType) {
        String fieldNameToUpdate = "";
        if (!this.isLangEn
                && (ENUM_LIST.equalsIgnoreCase(changeType) || ML_HEADING
                    .equalsIgnoreCase(changeType))) {
            final String fieldNameEn = changeType.toLowerCase(Locale.getDefault());
            fieldNameToUpdate = fieldNameEn + this.langSuffix;
            this.isLangField = true;
        } else {
            fieldNameToUpdate = changeType.toLowerCase(Locale.getDefault());
            this.isLangField = false;
        }
        return fieldNameToUpdate;
    }
    
    /**
     * Delete table from afm_tbls/afm_flds.
     */
    private void deleteTable() {
        this.afmFldsDs.clearRestrictions();
        this.afmTblsDs.clearRestrictions();
        this.afmFldsDs.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS,
            ProjectUpdateWizardUtilities.TABLE_NAME, this.tableName));
        final List<DataRecord> fldsRecords = this.afmFldsDs.getRecords();
        for (final DataRecord fldRecord : fldsRecords) {
            this.afmFldsDs.deleteRecord(fldRecord);
        }
        this.afmTblsDs.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_TBLS,
            ProjectUpdateWizardUtilities.TABLE_NAME, this.tableName));
        final DataRecord tblRecord = this.afmTblsDs.getRecord();
        this.afmFldsDs.deleteRecord(tblRecord);
    }
    
    /**
     * Delete field from afm_flds.
     */
    private void deleteField() {
        this.afmFldsDs.clearRestrictions();
        this.afmFldsDs.addRestriction(
            Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS,
                ProjectUpdateWizardUtilities.TABLE_NAME, this.tableName)).addRestriction(
            Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS,
                ProjectUpdateWizardUtilities.FIELD_NAME, this.fieldName));
        final DataRecord record = this.afmFldsDs.getRecord();
        this.afmFldsDs.deleteRecord(record);
    }
    
    /**
     * Adds a new table in ARCHIBUS data dictionary including the fields.
     */
    private void addNewTable() {
        final DataSourceFile dsf = new DataSourceFile("afm_tbls.csv");
        final Map<String, Object> tableMap =
                CsvUtilities.getTableMap(this.tableName, dsf.getAllRecords());
        final DataRecord newTblRecord = CsvUtilities.mapToRecord(this.afmTblsDs, tableMap);
        final List<DataRecord> newFieldsRec = getNewFieldsRecords();
        if (newFieldsRec.isEmpty()) {
            Logger.getLogger(getClass()).warn(
                String.format("Table [%s] has no field defined.", this.tableName));
        } else {
            this.afmTblsDs.saveRecord(newTblRecord);
            for (final DataRecord newFieldRec : newFieldsRec) {
                addNewFieldToExistanceTable(newFieldRec);
                this.afmFldsTransDs.deleteRecord(newFieldRec);
            }
        }
    }
    
    /**
     * .
     * 
     * @param record record
     * @throws ExceptionBase write warning to log if the statement fails
     */
    private void addNewFieldToExistanceTable(final DataRecord record) throws ExceptionBase {
        final List<String> excludeFields =
                new ArrayList<String>(Arrays.asList(AFM_FLDS_TRANS_CHOSEN_ACTION,
                    AFM_FLDS_TRANS_REC_ACTION, CHANGE_TYPE_FIELD, "afm_flds_trans.data_dict_diffs",
                    "afm_flds_trans.sql_table_diffs", "afm_flds_trans.autonumbered_id"));
        final DataSource amFldsDs =
                ProjectUpdateWizardUtilities
                    .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS);
        final DataRecord newRecord = amFldsDs.createNewRecord();
        for (final DataRecordField dataRec : record.getFieldValues()) {
            if (!excludeFields.contains(dataRec.getName())) {
                final String name = dataRec.getName().replace("afm_flds_trans", "afm_flds");
                final Object value = dataRec.getValue();
                newRecord.setValue(name, value);
            }
        }
        handleForeignKeyValuesForAfmFlds(newRecord);
        newRecord.setValue(TRANSFER_STATUS, STATUS_UPDATED);
        if (newRecord.getValue("afm_flds.ref_table") == null) {
            amFldsDs.saveRecord(newRecord);
        } else {
            this.postponedChanges.add(newRecord);
        }
    }
    
    /**
     * 
     * @param record record
     */
    private void handleForeignKeyValuesForAfmFlds(final DataRecord record) {
        final Object editGroup = record.getValue(EDIT_GROUP);
        if (editGroup != null && !valueExists(editGroup.toString())) {
            record.setValue(EDIT_GROUP, "");
        }
        final Object reviewGroup = record.getValue(REVIEW_GROUP);
        if (reviewGroup != null && !valueExists(reviewGroup.toString())) {
            record.setValue(REVIEW_GROUP, "");
        }
    }
    
    /**
     * 
     * @param fldValue field value
     * @return true/false
     */
    private boolean valueExists(final String fldValue) {
        final DataSource getPkDs =
                DataSourceFactory.createDataSource().addTable(AFM_GROUPS_TABLE)
                    .addField(GROUP_NAME_FIELD)
                    .addRestriction(Restrictions.eq(AFM_GROUPS_TABLE, GROUP_NAME_FIELD, fldValue));
        return getPkDs.getRecords().isEmpty() ? false : true;
    }
    
    /**
     * Gets new DataRecords for a new table.
     * 
     * @return List<DataRecord>
     */
    private List<DataRecord> getNewFieldsRecords() {
        final DataSource dsNewFields =
                ProjectUpdateWizardUtilities
                    .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS)
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS_TRANS,
                            ProjectUpdateWizardUtilities.TABLE_NAME, this.tableName))
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS_TRANS, CHANGE_TYPE,
                            DifferenceMessage.NEW));
        return dsNewFields.getRecords();
    }
    
    /**
     * Updates the data dictionary.
     */
    private void updateField() {
        DataSource updFieldDataSource;
        String tblName;
        if (this.isLangField) {
            updFieldDataSource = this.afmFldsLangDs;
            tblName = this.afmFldsLangDs.getMainTableName();
        } else {
            updFieldDataSource = this.afmFldsDs;
            tblName = this.afmFldsDs.getMainTableName();
        }
        updFieldDataSource.clearRestrictions();
        updFieldDataSource.addRestriction(
            Restrictions.eq(tblName, ProjectUpdateWizardUtilities.TABLE_NAME, this.tableName))
            .addRestriction(
                Restrictions.eq(tblName, ProjectUpdateWizardUtilities.FIELD_NAME, this.fieldName));
        final DataRecord record = updFieldDataSource.getRecord();
        if (record != null) {
            if (this.fieldValue == null) {
                this.fieldValue = EMPTY_STRING;
            }
            record.setValue(tblName + "." + this.fieldToUpdate, this.fieldValue);
            if (!this.isLangField) {
                record.setValue(TRANSFER_STATUS, STATUS_UPDATED);
            }
            if (!this.isLangField && REF_TABLE.equals(this.fieldToUpdate)
                    && !EMPTY_STRING.equals(this.fieldValue)) {
                this.postponedChanges.add(record);
            } else {
                updFieldDataSource.saveRecord(record);
            }
        }
    }
}
