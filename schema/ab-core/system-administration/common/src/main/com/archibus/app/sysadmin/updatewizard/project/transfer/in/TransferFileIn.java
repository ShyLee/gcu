package com.archibus.app.sysadmin.updatewizard.project.transfer.in;

import java.io.*;
import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.transfer.TransferFile;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.DatabaseSchemaTableDef;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardUtilities;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.importexport.importer.*;
import com.archibus.ext.report.xls.XlsBuilder;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * Transfer file in properties.
 * 
 * @author Catalin Purice
 * 
 */
public class TransferFileIn extends TransferFile {
    
    /**
     * data transfer in manager.
     */
    private final transient DatabaseImporter dtInManager;
    
    /**
     * Constructor.
     * 
     */
    public TransferFileIn() {
        super();
        this.dtInManager =
                (DatabaseImporter) ContextStore.get().getBean(
                    DatabaseImporterImpl.DATABASEIMPORTOR_BEAN);
    }
    
    /**
     * Order the table names in the list according to dependencies.
     * 
     * @param tablesToTransfer tables to transfer
     */
    public static void orderTables(final List<String> tablesToTransfer) {
        final ProcessingOrder procOrder = new ProcessingOrder(tablesToTransfer, true);
        procOrder.calculatePrecedence();
        updateTablePosition(procOrder.getTablesByProcOrder());
    }
    
    /**
     * transfer into tableName the Map object.
     * 
     * @param tableName table name
     * @param fieldMap field map
     */
    public static void transferIn(final String tableName, final Map<String, Object> fieldMap) {
        final String sql = buildQuery(tableName, fieldMap);
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        EventHandlerBase.executeDbSql(context, sql, false);
        EventHandlerBase.executeDbCommit(context);
    }
    
    /**
     * Builds sql query.
     * 
     * @param tableName table name
     * @param map map
     * @return query
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification: Case #2: Statements with INSERT ... SELECT pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static String buildQuery(final String tableName, final Map<String, Object> map) {
        final StringBuffer fieldsNames = new StringBuffer("");
        final StringBuffer fieldsValues = new StringBuffer("");
        for (final Iterator<String> it = map.keySet().iterator(); it.hasNext();) {
            final String key = String.valueOf(it.next());
            fieldsNames.append(key);
            String value = String.valueOf(map.get(key));
            if (value.length() == 0) {
                fieldsValues.append("NULL");
            } else {
                if (value.contains(SchemaUpdateWizardUtilities.APOS)) {
                    value = value.replace(SchemaUpdateWizardUtilities.APOS, "''");
                }
                fieldsValues.append('\'').append(value).append('\'');
            }
            if (it.hasNext()) {
                fieldsNames.append(',');
                fieldsValues.append(',');
            }
            
        }
        final String sql = "INSERT INTO " + tableName + "(%s) VALUES (%s)";
        return String.format(sql, fieldsNames, fieldsValues);
    }
    
    /**
     * @return the dtManager
     */
    public DatabaseImporter getDtInManager() {
        return this.dtInManager;
    }
    
    /**
     * Checks if the file to be transfered in exists.
     * 
     * @return true/false
     */
    public boolean fileExists() {
        boolean fileExists = false;
        final File file = getFile();
        if (file.exists()) {
            fileExists = true;
        }
        return fileExists;
    }
    
    /**
     * 
     * @return file path
     */
    public String getFilePath() {
        return this.getFile().getAbsolutePath();
    }
    
    /**
     * sets the table name.
     * 
     * @param fileName name of the file
     */
    public void setTableName(final String fileName) {
        loadTableParam(fileName);
    }
    
    /**
     * Checks if the table exists.
     * 
     * @return true/false
     */
    public boolean tableExists() {
        boolean tableExists = false;
        final String tableName = getTableName();
        final DatabaseSchemaTableDef sqlTableDef =
                new DatabaseSchemaTableDef(tableName).loadTableFieldsDefn();
        if (sqlTableDef.exists()) {
            tableExists = true;
        }
        return tableExists;
    }
    
    /**
     * 
     * @param inputStream input stream
     * @throws ExceptionBase exception
     */
    public void transferIn(final InputStream inputStream) throws ExceptionBase {
        this.dtInManager.importData(inputStream, XlsBuilder.FileFormatType.CSV, isDocTable(),
            getDataPath(), true, "", true);
        updateRecordsNo();
    }
    
    /**
     * 
     */
    private void updateRecordsNo() {
        final String[] fields =
                { "autonumbered_id", "nrecords_inserted", "nrecords_updated", "nrecords_missing" };
        final DataSource afmTransferSetUpdateDs =
                DataSourceFactory.createDataSourceForFields(
                    ProjectUpdateWizardConstants.AFM_TRANSFER_SET, fields).addRestriction(
                    Restrictions.eq(ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
                        ProjectUpdateWizardUtilities.TABLE_NAME, getTableName().toLowerCase()));
        final DataRecord record = afmTransferSetUpdateDs.getRecord();
        record.setValue("afm_transfer_set.nrecords_inserted",
            (int) this.dtInManager.nRecordsInserted());
        record.setValue("afm_transfer_set.nrecords_updated",
            (int) this.dtInManager.nRecordsUpdated());
        record.setValue("afm_transfer_set.nrecords_missing",
            (int) this.dtInManager.nRecordsWithErrors());
        afmTransferSetUpdateDs.saveRecord(record);
    }
    
    /**
     * Updates the processing order field in afm_transfer_set.
     * 
     * @param orderedTableNames table names ordered
     */
    private static void updateTablePosition(final List<String> orderedTableNames) {
        final DataSource dsAfmTransferSet =
                ProjectUpdateWizardUtilities
                    .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET);
        for (final String tableName : orderedTableNames) {
            dsAfmTransferSet.clearRestrictions();
            dsAfmTransferSet.addRestriction(Restrictions.eq(
                ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
                ProjectUpdateWizardUtilities.TABLE_NAME, tableName));
            final DataRecord record = dsAfmTransferSet.getRecord();
            final int index = orderedTableNames.indexOf(tableName);
            if (record != null) {
                record.setValue("afm_transfer_set.processing_order", index);
                dsAfmTransferSet.saveRecord(record);
            }
        }
    }
    
    /**
     * Delete file after import.
     */
    public void deleteFile() {
        if (isDocTable()) {
            final File dirDoc = new File(getFile().getParent() + File.separator + getTableName());
            if (dirDoc.isDirectory()) {
                TransferFile.deleteDir(dirDoc);
            }
        }
        try {
            if (!getFile().delete()) {
                throw new IOException();
            }
        } catch (final IOException ioE) {
            ProjectUpdateWizardLogger.logException(ioE.getMessage());
            ProjectUpdateWizardUtilities.updateTableStatus(getTableName(),
                ProjectUpdateWizardConstants.NOT_PROCESSED);
        }
    }
    
    /**
     * 
     * Get Job Status.
     * 
     * @return JobStatus
     */
    public JobStatus getJobStatus() {
        return this.dtInManager.getJobStatus();
    }
}
