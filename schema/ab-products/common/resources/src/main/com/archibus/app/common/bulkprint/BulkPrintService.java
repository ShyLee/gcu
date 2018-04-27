package com.archibus.app.common.bulkprint;

import java.io.InputStream;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.pdflivecycle.PdfFormExportJob;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.service.DocumentService;
import com.archibus.utility.StringUtil;

/**
 * Provides Bulk Print Functionality to workflow rules that need to print multiple documents to a
 * merged one with specified output document type.
 * 
 * @author ZY
 * @since 20.1
 * 
 */
public class BulkPrintService extends JobBase {
    
    /**
     * Constant: Char: ".".
     */
    private static final String DOT = ".";
    
    /**
     * Constant: "100" - job's progressing percentage base.
     */
    private static final int HUNDRED = 100;
    
    /**
     * Constant: Title shown on job view for the links of generated pdf files.
     */
    // @translatable
    private static final String TITLE_JOB_RESULT = "Printed PDF file(s)";
    
    /**
     * Records to print documents.
     */
    private final List<InputStream> docList = new ArrayList<InputStream>();
    
    /**
     * Field Name.
     */
    private final String fieldName;
    
    /**
     * Limited putput file size.
     */
    private final long limitSize;
    
    /**
     * Records to print documents.
     */
    private final List<DataRecord> records;
    
    /**
     * Table Name.
     */
    private final String tableName;
    
    /**
     * Public Constructor: create a BulkPrintService instance by passing into parameters for service
     * initializing.
     * 
     * 
     * @param tableName table name
     * @param fieldName field name
     * @param records list of records
     * @param limitSize output document size limit
     */
    public BulkPrintService(final String tableName, final String fieldName,
            final List<DataRecord> records, final long limitSize) {
        
        super();
        
        PdfFormExportJob.loadPdfKitLibraryLicense();
        
        this.tableName = tableName;
        this.fieldName = fieldName;
        this.records = records;
        this.limitSize = limitSize;
        
    }
    
    /**
     * Public interface: after BulkPrintService instance object is created, run the print documents
     * job.
     */
    @Override
    public void run() {
        
        this.status.setTotalNumber(HUNDRED);
        this.status.setCurrentNumber(0);
        this.status.setResult(new JobResult(EventHandlerBase.localizeString(ContextStore.get()
            .getEventHandlerContext(), TITLE_JOB_RESULT, this.getClass().getName())));
        
        this.printDocumentsToPdf();
        
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Private method: Retrieve documents from input document records and print them to local PDF
     * files, then return file links list to response result.
     * 
     * Justification: KB#3034281 will un-deprecate the method getTablePkFieldNames, or provide a
     * replacement API.
     */
    @SuppressWarnings({ "deprecation" })
    private void printDocumentsToPdf() {
        
        final DocumentProcess documentProcess = new DocumentProcess();
        
        final int step = this.records.isEmpty() ? 0 : HUNDRED / this.records.size();
        
        // get ARCHIBUS document service instance
        final DocumentService documentService =
                (DocumentService) ContextStore.get().getBean("documentService");
        
        // get primary key of transfered table
        final String[] pkNames =
                EventHandlerBase.getTablePkFieldNames(ContextStore.get().getEventHandlerContext(),
                    this.tableName);
        
        final Map<String, String> keys = new HashMap<String, String>();
        for (final DataRecord record : this.records) {
            
            // A long run job should be stoppable
            if (this.status.isStopRequested()) {
                break;
            }
            
            // prepare key-values map.
            for (final String pkey : pkNames) {
                keys.put(pkey, record.getValue(this.tableName + DOT + pkey).toString());
            }
            
            // get document file name
            final String docName = record.getString(this.tableName + DOT + this.fieldName);
            
            // if file exists then process the document
            if (StringUtil.notNullOrEmpty(docName)) {
                
                documentProcess.processSingleDocument(this.docList, this.tableName, this.fieldName,
                    documentService, keys, docName);
                
            }
            this.status.setCurrentNumber(this.status.getCurrentNumber() + step);
        }
        
        new PdfPrinter().outputPdf(this.docList, this.status, this.limitSize);
    }
    
}
