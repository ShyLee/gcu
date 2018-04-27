package com.archibus.app.sysadmin.updatewizard.project.transfer;

import java.io.*;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardUtilities;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.ext.report.xls.XlsBuilder.FileFormatType;

/**
 * Common properties for TransferFileIn and TrnsferFileOut.
 * 
 * @author Catalin Purice
 * 
 */
public class TransferFile {
    
    /**
     * path to documents.
     */
    private transient String dataPath;
    
    /**
     * file object.
     */
    private transient File file;
    
    /**
     * file name.
     */
    private transient String fileName;
    
    /**
     * table name.
     */
    private transient String tableName;
    
    /**
     * Set a new table name.
     * 
     * @param myTableName table name
     * @return current object
     */
    public TransferFile loadTableParam(final String myTableName) {
        this.tableName = myTableName;
        this.fileName = myTableName + SchemaUpdateWizardUtilities.DOT + FileFormatType.CSV;
        final String path = getTransferFolder() + File.separator + this.fileName;
        this.file = new File(path);
        this.dataPath = getTransferFolder();
        return this;
    }
    
    /**
     * Return true if the table has fields that contains documents.
     * 
     * @return true/false
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification: Case #1: Statements with SELECT WHERE EXISTS ... pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public boolean isDocTable() {
        final String sql =
                "SELECT (CASE WHEN EXISTS (SELECT 1 FROM afm_flds where afm_type=2165 and afm_flds.table_name=afm_tbls.table_name) THEN 1 ELSE 0 END ) AS is_doc FROM afm_tbls WHERE table_name='"
                        + this.tableName + "'";
        final DataSource dsIsDoc =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET)
                    .addQuery(sql)
                    .addVirtualField(ProjectUpdateWizardConstants.AFM_TRANSFER_SET, "is_doc",
                        DataSource.DATA_TYPE_INTEGER);
        
        final DataRecord record = dsIsDoc.getRecord();
        return record.getInt("afm_transfer_set.is_doc") == 1 ? true : false;
    }
    
    /**
     * Create a new folder.
     * 
     * @param folder folder path
     * @throws IOException IO Exception
     */
    public static void createFolder(final String folder) throws IOException {
        try {
            if (!new File(folder).mkdirs()) {
                throw new IOException();
            }
        } catch (final IOException ioE) {
            ProjectUpdateWizardLogger.logException(ioE.getMessage());
        }
    }
    
    /**
     * 
     * @return transfer folder
     */
    public static String getTransferFolder() {
        final String archibusPath = ContextStore.get().getWebAppPath();
        final String userName = ContextStore.get().getUser().getName().toLowerCase();
        return archibusPath + File.separator + "projects" + File.separator + "users"
                + File.separator + userName;
    }
    
    /**
     * Returns the path to afm_tbls_table_types.csv file.
     * 
     * @return String
     */
    public static String getTableTypeFileFolder() {
        final String archibusPath = ContextStore.get().getWebAppPath();
        return archibusPath + File.separator + "schema" + File.separator + "ab-core"
                + File.separator + "system-administration" + File.separator + "dbwiz";
    }
    
    /**
     * @return the dataPath
     */
    public String getDataPath() {
        return this.dataPath;
    }
    
    /**
     * @return the file
     */
    public File getFile() {
        return this.file;
    }
    
    /**
     * @return the fileName
     */
    public String getFileName() {
        return this.fileName;
    }
    
    /**
     * @return the tableName
     */
    public String getTableName() {
        return this.tableName;
    }
    
    /**
     * 
     * @param dir File
     */
    public static void deleteDir(final File dir) {
        if (dir.isDirectory()) {
            final File[] elements = dir.listFiles();
            for (final File element : elements) {
                if (element.isDirectory()) {
                    deleteDir(element);
                } else {
                    if (!element.delete()) {
                        ProjectUpdateWizardLogger.logException("Unable to delete files");
                    }
                }
            }
        }
        // The directory is now empty so delete it
        try {
            dir.delete();
        } catch (final SecurityException e) {
            ProjectUpdateWizardLogger.logException(e.getMessage());
            throw e;
        }
    }
    
    /**
     * 
     * Get Total Number Of Records To Be Exported/Imported for tables with status='PENDING'.
     * 
     * @return long
     */
    public static long getTotalNoOfRecordsToTransfer() {
        final Clause restriction =
                Restrictions.eq(ProjectUpdateWizardConstants.AFM_TRANSFER_SET, "status",
                    ProjectUpdateWizardConstants.PENDING);
        return DataStatistics.getInt(ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
            "nrecords_source", "SUM", restriction);
    }
}
