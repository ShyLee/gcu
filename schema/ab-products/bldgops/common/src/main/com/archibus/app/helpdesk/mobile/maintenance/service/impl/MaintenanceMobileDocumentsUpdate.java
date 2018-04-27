package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.service.*;
import com.archibus.service.DocumentService.DocumentParameters;
import com.archibus.utility.StringUtil;

/**
 * Provides supporting methods related to synchronizing documents in the main work request tables.
 * Supports the MaintenanceMobileService class.
 * 
 * 
 * @author Constantine Kriezis
 * @since 21.1
 * 
 */
@SuppressWarnings({ "PMD.AvoidUsingSql" })
// TODO (VT) Justification to suppress PMD.AvoidUsingSql?
final class MaintenanceMobileDocumentsUpdate {
    
    /**
     * Hide default constructor.
     */
    private MaintenanceMobileDocumentsUpdate() {
    }
    
    /**
     * Creates data source for the afm_docs table.
     * 
     * @return data source
     */
    // TODO (VT) Do not access afm_docs tables directly, use DocumentService
    static DataSource createAfmDocsDataSource() {
        final DataSource datasource = DataSourceFactory.createDataSource();
        
        datasource.addTable(Constant.AFM_DOCS_TABLE, DataSource.ROLE_MAIN);
        
        datasource.addField(Constant.TABLE_NAME);
        datasource.addField(Constant.FIELD_NAME);
        datasource.addField(Constant.LOCKED_BY);
        datasource.addField(Constant.PKEY_VALUE);
        
        datasource.addField(Constant.DESCRIPTION);
        datasource.addField(Constant.DELETED);
        datasource.addField(Constant.LOCKED);
        datasource.addField(Constant.LOCK_DATE);
        datasource.addField(Constant.LOCK_TIME);
        datasource.addField(Constant.TRANSFER_STATUS);
        
        return datasource;
    }
    
    /**
     * Creates data source for the afm_docs table.
     * 
     * @return data source
     */
    // TODO (VT) Do not access afm_docvers tables directly, use DocumentService
    static DataSource createAfmDocVersDataSource() {
        final DataSource datasource = DataSourceFactory.createDataSource();
        
        datasource.addTable(Constant.AFM_DOCVERS_TABLE, DataSource.ROLE_MAIN);
        
        datasource.addField(Constant.TABLE_NAME);
        datasource.addField(Constant.FIELD_NAME);
        datasource.addField(Constant.LOCKED_BY);
        datasource.addField(Constant.PKEY_VALUE);
        datasource.addField(Constant.DOC_FILE);
        
        datasource.addField(Constant.AUTHOR);
        datasource.addField(Constant.CHECKIN_DATE);
        datasource.addField(Constant.CHECKIN_TIME);
        datasource.addField(Constant.COMMENTS);
        datasource.addField(Constant.DOC_FILE);
        datasource.addField(Constant.DOC_SIZE);
        datasource.addField(Constant.TRANSFER_STATUS);
        datasource.addField(Constant.VERSION);
        
        return datasource;
    }
    
    /**
     * 
     * Updates the documents for new mobile requests from the sync table. Updates go to either the
     * work request (wr) or to the service request (activity_log) table.
     * 
     * @param pkeyId Work Request Code or Activity Log Code
     * @param autoNumber - wr_sync unique id
     * @param tableName - either wr or activity_log
     */
    static void updateDocumentsFromSyncForNewWork(final int pkeyId, final int autoNumber,
            final String tableName) {
        // TODO (VT) Do not access afm_docs tables directly, use DocumentService
        final DataSource wrSyncDocDs = createAfmDocsDataSource();
        
        // Look for documents that are assigned to the wr_sync record identified by autoNumber
        wrSyncDocDs.addRestriction(Restrictions.eq(Constant.AFM_DOCS_TABLE, Constant.TABLE_NAME,
            Constant.WR_SYNC_TABLE));
        
        wrSyncDocDs.addRestriction(Restrictions.eq(Constant.AFM_DOCS_TABLE, Constant.PKEY_VALUE,
            autoNumber));
        
        final List<DataRecord> docRecords = wrSyncDocDs.getRecords();
        
        // For each document switch the table name to wr or activity_log and the sync id to the new
        // work request code or the new activity log code.
        // The document file names in the doc1,doc2,doc3,doc4 fields are already copied over from
        // the sync table when we insert the work request record.
        for (final DataRecord docRecord : docRecords) {
            
            docRecord.setValue(Constant.AFM_DOCS_TABLE + Constant.DOT + Constant.TABLE_NAME,
                tableName);
            
            docRecord.setValue(Constant.AFM_DOCS_TABLE + Constant.DOT + Constant.PKEY_VALUE,
                Integer.toString(pkeyId));
            
            wrSyncDocDs.saveRecord(docRecord);
            
            wrSyncDocDs.commit();
        }
    }
    
    /**
     * Copy new documents for existing assigned work requests from the sync table to the work
     * request table. Assumes that only new documents are entered in the sync table.
     * 
     * @param syncRecord - source sync work record
     * @param wrId - work request code
     */
    static void addNewSyncDocumentsToExistingWork(final DataRecord syncRecord, final int wrId) {
        
        // First we get the work request record as we will need to update the file name in the first
        // available doc field.
        
        // Create the data source for the work request table
        final DataSource wrDs = MaintenanceMobileWorkUpdate.createWrDataSource();
        
        // Restrict based on the work request code to find the record that we need to update
        wrDs.addRestriction(Restrictions.eq(Constant.WR_TABLE, Constant.WR_ID, wrId));
        
        // Get the work request record
        final DataRecord wrRecord = wrDs.getRecord();
        
        // If we have a work request record to copy the documents to.
        if (wrRecord != null) {
            
            // We get the key of the sync table
            final int autoNumber =
                    syncRecord.getInt(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.AUTO_NUMBER);
            
            // Create data source for documents
            final DataSource docDs = createAfmDocsDataSource();
            
            // Look for documents that are assigned to the wr_sync record identified by autoNumber
            docDs.addRestriction(Restrictions.eq(Constant.AFM_DOCS_TABLE, Constant.TABLE_NAME,
                Constant.WR_SYNC_TABLE));
            
            docDs.addRestriction(Restrictions.eq(Constant.AFM_DOCS_TABLE, Constant.PKEY_VALUE,
                autoNumber));
            
            final List<DataRecord> docRecords = docDs.getRecords();
            
            // For each document switch the table name to wr and the sync id to the new work request
            // code. We need to look for an open doc field in the wr table and set it.
            for (final DataRecord docRecord : docRecords) {
                
                // Before we act on the documents we need to make sure there is an empty doc field
                // in the wr table to receive them.
                final String firstWrEmptyDocFieldName = getFirstWrEmptyDocField(wrRecord);
                
                // If there is an available open document field in the work request table.
                if (StringUtil.notNullOrEmpty(firstWrEmptyDocFieldName)) {
                    
                    // Get the field name where the document file name is stored
                    final String docFieldName =
                            docRecord.getString(Constant.AFM_DOCS_TABLE + Constant.DOT
                                    + Constant.FIELD_NAME);
                    
                    // Get the name of the file stored in the corresponding doc field of the sync
                    // table
                    final String docFileName =
                            syncRecord.getString(Constant.WR_SYNC_TABLE + Constant.DOT
                                    + docFieldName);
                    
                    // Switch the table to wr
                    docRecord.setValue(
                        Constant.AFM_DOCS_TABLE + Constant.DOT + Constant.TABLE_NAME,
                        Constant.WR_TABLE);
                    
                    // Switch the key to wrId
                    docRecord.setValue(
                        Constant.AFM_DOCS_TABLE + Constant.DOT + Constant.PKEY_VALUE,
                        Integer.toString(wrId));
                    
                    // Switch the field to the first available field
                    docRecord.setValue(
                        Constant.AFM_DOCS_TABLE + Constant.DOT + Constant.FIELD_NAME,
                        firstWrEmptyDocFieldName);
                    
                    docDs.saveRecord(docRecord);
                    
                    docDs.commit();
                    
                    // Update the wr empty field with the file name of the document
                    wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + firstWrEmptyDocFieldName,
                        docFileName);
                    
                    wrDs.saveRecord(wrRecord);
                    
                    wrDs.commit();
                }
            }
        }
    }
    
    /**
     * Copy documents assigned from the work request table to the sync table. Assumes that
     * doc1,doc2,doc3,doc4 fields are already copied when the program inserts the wr_sync record.
     * 
     * @param wrId source work request code
     * @param wrSyncId target wr_sync
     * @param doc1File - document1 file name
     * @param doc2File - document2 file name
     * @param doc3File - document3 file name
     * @param doc4File - document4 file name
     */
    static void copyDocumentsFromWrToWrSync(final int wrId, final int wrSyncId,
            final String doc1File, final String doc2File, final String doc3File,
            final String doc4File) {
        
        final DocumentService documentService =
                (DocumentService) ContextStore.get().getBean("documentService");
        
        // TODO (VT) Do not access afm_docs tables directly, use DocumentService
        final DataSource wrDocDs = createAfmDocsDataSource();
        
        wrDocDs.addRestriction(Restrictions.eq(Constant.AFM_DOCS_TABLE, Constant.PKEY_VALUE, wrId));
        wrDocDs.addRestriction(Restrictions.eq(Constant.AFM_DOCS_TABLE, Constant.TABLE_NAME,
            Constant.WR_TABLE));
        
        final List<DataRecord> docRecords = wrDocDs.getRecords();
        
        for (final DataRecord wrDocRecord : docRecords) {
            
            final String docFieldName =
                    wrDocRecord.getString(Constant.AFM_DOCS_TABLE + Constant.DOT
                            + Constant.FIELD_NAME);
            
            final String docFileDescription =
                    wrDocRecord.getString(Constant.AFM_DOCS_TABLE + Constant.DOT
                            + Constant.DESCRIPTION);
            
            String docFileName;
            
            if ("doc1".equals(docFieldName)) {
                docFileName = doc1File;
            } else if ("doc2".equals(docFieldName)) {
                docFileName = doc2File;
            } else if ("doc3".equals(docFieldName)) {
                docFileName = doc3File;
            } else {
                docFileName = doc4File;
            }
            
            if (StringUtil.notNullOrEmpty(docFileName)) {
                
                // source doc parameters
                final Map<String, String> srcKeys = new HashMap<String, String>();
                
                srcKeys.put(Constant.WR_ID, Integer.toString(wrId));
                
                final DocumentParameters srcDocParam =
                        new DocumentParameters(srcKeys, Constant.WR_TABLE, docFieldName, null, true);
                
                // target document parameters
                final Map<String, String> targetKeys = new HashMap<String, String>();
                
                targetKeys.put(Constant.AUTO_NUMBER, Integer.toString(wrSyncId));
                
                final DocumentParameters targetDocParam =
                        new DocumentParameters(targetKeys, Constant.WR_SYNC_TABLE, docFieldName,
                            docFileName, docFileDescription, "0");
                
                // copy document
                documentService.copyDocument(srcDocParam, targetDocParam);
            }
        }
    }
    
    // static void copyDocumentsFromWrToWrSyncTEST(final int wrId, final int wrSyncId,
    // final String doc1File, final String doc2File, final String doc3File,
    // final String doc4File) {
    // }
    
    /**
     * Get the first empty doc field name in the work request record.
     * 
     * @param wrRecord work request record
     * @return wrDocFieldName
     */
    static String getFirstWrEmptyDocField(final DataRecord wrRecord) {
        final String wrDoc1 = wrRecord.getString(Constant.WR_TABLE + Constant.DOT + Constant.DOC1);
        
        final String wrDoc2 = wrRecord.getString(Constant.WR_TABLE + Constant.DOT + Constant.DOC2);
        
        final String wrDoc3 = wrRecord.getString(Constant.WR_TABLE + Constant.DOT + Constant.DOC3);
        
        final String wrDoc4 = wrRecord.getString(Constant.WR_TABLE + Constant.DOT + Constant.DOC4);
        
        String firstEmptyField = "";
        
        if (!StringUtil.notNullOrEmpty(wrDoc4)) {
            firstEmptyField = Constant.DOC4;
        }
        
        if (!StringUtil.notNullOrEmpty(wrDoc3)) {
            firstEmptyField = Constant.DOC3;
        }
        
        if (!StringUtil.notNullOrEmpty(wrDoc2)) {
            firstEmptyField = Constant.DOC2;
        }
        
        if (!StringUtil.notNullOrEmpty(wrDoc1)) {
            firstEmptyField = Constant.DOC1;
        }
        
        return firstEmptyField;
    }
}