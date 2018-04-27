package com.archibus.app.sysadmin.updatewizard.project.transfer.out;

import java.io.File;
import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.transfer.TransferFile;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.db.*;
import com.archibus.db.RestrictionSqlBase.Immutable;
import com.archibus.ext.importexport.exporter.*;
import com.archibus.utility.*;

/**
 * Transfer file out properties.
 * 
 * @author Catalin Purice
 * 
 */
public class TransferFileOut extends TransferFile {
    
    /**
     * Constant.
     */
    private static final String AFM_PROCESSES = "afm_processes";
    
    /**
     * Constant.
     */
    private static final String AFM_PTASKS = "afm_ptasks";
    
    /**
     * Constant.
     */
    private static final String DIFFERENT = "<>";
    
    /**
     * Constant.
     */
    private static final String PROCESS_ID = "process_id";
    
    /**
     * Constant.
     */
    private static final String PROCESS_TYPE = "process_type";
    
    /**
     * Constant.
     */
    private static final Object WEB_DASH = "WEB-DASH";
    
    /**
     * data transfer out manager.
     */
    private final transient DatabaseExporter dtOutManager;
    
    /**
     * Constructor.
     */
    public TransferFileOut() {
        super();
        this.dtOutManager =
                (DatabaseExporter) ContextStore.get().getBean(
                    DatabaseExporterImpl.DATABASEEXPORTOR_BEAN);
    }
    
    /**
     * Set the file name to export.
     * 
     * @param fileName file name
     */
    public void setTableName(final String fileName) {
        loadTableParam(fileName);
        final File outFile = this.getFile();
        final File folderFile = outFile.getParentFile();
        FileUtil.createFoldersIfNot(folderFile.getAbsolutePath());
    }
    
    /**
     * 
     * @throws ExceptionBase ExceptionBase
     */
    public void transferOut() throws ExceptionBase {
        final String tableName = this.getTableName();
        
        List<RestrictionSqlBase.Immutable> restrictions = null;
        if (isSpecialTable(tableName)) {
            final boolean isPNav = isType(tableName, "PNAV");
            final boolean isPDash = isType(tableName, "PDASH");
            if (isPNav != isPDash) {
                // set restriction
                restrictions = getRestrictionForSpecialTable(tableName, isPNav, isPDash);
            }
        }
        
        final String fullPathFileName = getFile().getAbsolutePath();
        this.dtOutManager.exportData(fullPathFileName, tableName, new ArrayList<String>(),
            restrictions, tableName, this.isDocTable());
    }
    
    /**
     * returns restriction for project dash-board tables.
     * 
     * @param tableName table name
     * @return RestrictionSqlBase
     */
    private List<RestrictionSqlBase.Immutable> getRestrForProjectDashTable(final String tableName) {
        final List<RestrictionSqlBase.Immutable> restrictions =
                new ArrayList<RestrictionSqlBase.Immutable>();
        
        final RestrictionParsedImpl rest = new RestrictionParsedImpl();
        if (AFM_PROCESSES.equalsIgnoreCase(tableName)) {
            rest.addClause(AFM_PROCESSES, PROCESS_TYPE, WEB_DASH);
        } else if (AFM_PTASKS.equalsIgnoreCase(tableName)) {
            final List<String> processIds = getWebDashProcessIds();
            for (final String processId : processIds) {
                rest.addClause(AFM_PTASKS, PROCESS_ID, processId, "=", "OR");
            }
        }
        restrictions.add(rest);
        return restrictions;
    }
    
    /**
     * 
     * @param tableName table name
     * @return restriction
     */
    private List<RestrictionSqlBase.Immutable> getRestrForProjectNavTable(final String tableName) {
        final List<RestrictionSqlBase.Immutable> restrictions =
                new ArrayList<RestrictionSqlBase.Immutable>();
        final RestrictionParsedImpl rest = new RestrictionParsedImpl();
        if (AFM_PROCESSES.equalsIgnoreCase(tableName)) {
            rest.addClause(tableName, PROCESS_TYPE, WEB_DASH, DIFFERENT);
        } else if (AFM_PTASKS.equalsIgnoreCase(tableName)) {
            final List<String> processIds = getWebDashProcessIds();
            for (final String processId : processIds) {
                rest.addClause(AFM_PTASKS, PROCESS_ID, processId, DIFFERENT, "AND");
            }
        }
        restrictions.add(rest);
        return restrictions;
    }
    
    /**
     * Returns restrictions.
     * 
     * @param tableName table name
     * @param isPNav true if the table is a process navigator type
     * @param isPDash true if the table is a process dash-board type
     * @return restrictions
     */
    private List<Immutable> getRestrictionForSpecialTable(final String tableName,
            final boolean isPNav, final boolean isPDash) {
        List<RestrictionSqlBase.Immutable> restrictions = null;
        if (isPNav) {
            restrictions = getRestrForProjectNavTable(tableName);
        } else if (isPDash) {
            restrictions = getRestrForProjectDashTable(tableName);
        }
        return restrictions;
    }
    
    /**
     * Gets all process_id with process_type = "WEB-DASH".
     * 
     * @return all process id
     */
    private List<String> getWebDashProcessIds() {
        final DataSource webDashProcessIdsDs =
                ProjectUpdateWizardUtilities.createDataSourceForTable(AFM_PROCESSES)
                    .addRestriction(Restrictions.eq(AFM_PROCESSES, PROCESS_TYPE, WEB_DASH));
        
        final List<String> processIds = new ArrayList<String>();
        final List<DataRecord> records = webDashProcessIdsDs.getRecords();
        for (final DataRecord record : records) {
            processIds.add(record.getValue("afm_processes.process_id").toString());
        }
        return processIds;
    }
    
    /**
     * Returns true if table is in ('afm_processes','afm_ptasks').
     * 
     * @param tableName tableName
     * @return boolean
     */
    private boolean isSpecialTable(final String tableName) {
        return ((AFM_PROCESSES.equalsIgnoreCase(tableName) || AFM_PTASKS
            .equalsIgnoreCase(tableName))) ? true : false;
    }
    
    /**
     * Returns afm_transfer_set.set_name.
     * 
     * @param tableName table name
     * @param tableType table type
     * @return boolean
     */
    private boolean isType(final String tableName, final String tableType) {
        final DataSource setNameDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET)
                    .addField("autonumbered_id")
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
                            ProjectUpdateWizardUtilities.TABLE_NAME, tableName))
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_TRANSFER_SET, "set_name",
                            tableType));
        
        return (setNameDS.getRecords().size() > 0) ? true : false;
    }
    
    /**
     * Getter for the dtOutManager property.
     * 
     * @see dtOutManager
     * @return the dtOutManager property.
     */
    public DatabaseExporter getDtOutManager() {
        return this.dtOutManager;
    }
}
